import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startSchedule, stopSchedule } from '@/lib/scheduler'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cronExpression, functionName, envVars, localStorage, enabled } = await req.json()

    const updated = await prisma.schedule.updateMany({
      where: {
        id: params.id,
        script: {
          project: {
            userId: session.user.id
          }
        }
      },
      data: {
        cronExpression,
        functionName,
        envVars: envVars ? JSON.stringify(envVars) : null,
        localStorage: localStorage ? JSON.stringify(localStorage) : null,
        enabled
      }
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // Restart the schedule with new settings
    const schedule = await prisma.schedule.findUnique({
      where: { id: params.id }
    })

    if (schedule) {
      if (schedule.enabled) {
        startSchedule(schedule)
      } else {
        stopSchedule(schedule.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update schedule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Stop the schedule first
    stopSchedule(params.id)

    const schedule = await prisma.schedule.deleteMany({
      where: {
        id: params.id,
        script: {
          project: {
            userId: session.user.id
          }
        }
      }
    })

    if (schedule.count === 0) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete schedule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
