export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureSchedulerInitialized } = await import('./lib/init-scheduler')
    await ensureSchedulerInitialized()
  }
}
