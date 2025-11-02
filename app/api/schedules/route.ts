import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scriptId, cronExpression, functionName, envVars, localStorage } = await req.json()

    if (!scriptId || !cronExpression || !functionName) {
      return NextResponse.json(
        { error: 'scriptId, cronExpression, and functionName are required' },
        { status: 400 }
      )
    }

    // Verify script belongs to user
    const script = await prisma.script.findFirst({
      where: {
        id: scriptId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }

    const schedule = await prisma.schedule.create({
      data: {
        scriptId,
        cronExpression,
        functionName,
        envVars: envVars ? JSON.stringify(envVars) : null,
        localStorage: localStorage ? JSON.stringify(localStorage) : null,
        enabled: true
      }
    })

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error('Create schedule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
