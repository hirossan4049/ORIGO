import { NextResponse } from 'next/server'
import { ensureSchedulerInitialized } from '@/lib/init-scheduler'

export async function GET() {
  // Ensure scheduler is initialized when health check is called
  await ensureSchedulerInitialized()
  
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
