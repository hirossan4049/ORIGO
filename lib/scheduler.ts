import cron from 'node-cron'
import { prisma } from './db'
import { executeScript } from './executor'

const scheduledTasks = new Map<string, cron.ScheduledTask>()

export async function initScheduler() {
  console.log('Initializing scheduler...')
  
  // Load all enabled schedules from database
  const schedules = await prisma.schedule.findMany({
    where: { enabled: true },
    include: { file: true }
  })

  for (const schedule of schedules) {
    startSchedule(schedule)
  }

  console.log(`Initialized ${schedules.length} scheduled tasks`)
}

export function startSchedule(schedule: any) {
  // Stop existing task if any
  stopSchedule(schedule.id)

  // Validate cron expression
  if (!cron.validate(schedule.cronExpression)) {
    console.error(`Invalid cron expression for schedule ${schedule.id}: ${schedule.cronExpression}`)
    return
  }

  // Create new task
  const task = cron.schedule(schedule.cronExpression, async () => {
    console.log(`Executing scheduled task ${schedule.id}`)
    
    let envVars = {}
    let localStorage = {}
    
    try {
      envVars = schedule.envVars ? JSON.parse(schedule.envVars) : {}
    } catch (error) {
      console.error(`Failed to parse envVars for schedule ${schedule.id}:`, error)
    }
    
    try {
      localStorage = schedule.localStorage ? JSON.parse(schedule.localStorage) : {}
    } catch (error) {
      console.error(`Failed to parse localStorage for schedule ${schedule.id}:`, error)
    }

    await executeScript(schedule.fileId, schedule.functionName, {
      env: envVars,
      localStorage
    })
  })

  scheduledTasks.set(schedule.id, task)
  console.log(`Started schedule ${schedule.id} with expression: ${schedule.cronExpression}`)
}

export function stopSchedule(scheduleId: string) {
  const task = scheduledTasks.get(scheduleId)
  if (task) {
    task.stop()
    scheduledTasks.delete(scheduleId)
    console.log(`Stopped schedule ${scheduleId}`)
  }
}

export function stopAllSchedules() {
  for (const [, task] of scheduledTasks) {
    task.stop()
  }
  scheduledTasks.clear()
  console.log('Stopped all scheduled tasks')
}
