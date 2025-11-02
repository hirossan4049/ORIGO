import { initScheduler } from './scheduler'

let isInitialized = false

export async function ensureSchedulerInitialized() {
  if (!isInitialized) {
    try {
      await initScheduler()
      isInitialized = true
      console.log('Scheduler initialized successfully')
    } catch (error) {
      console.error('Failed to initialize scheduler:', error)
    }
  }
}

// Initialize on module load (server-side only)
if (typeof window === 'undefined') {
  ensureSchedulerInitialized()
}
