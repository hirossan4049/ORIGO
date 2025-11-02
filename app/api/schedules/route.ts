import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startSchedule } from '@/lib/scheduler'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        file: {
          project: {
            userId: session.user.id
          }
        }
      },
      include: {
        file: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error('Get schedules error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId, cronExpression, functionName, envVars, localStorage } = await req.json()

    if (!fileId || !cronExpression || !functionName) {
      return NextResponse.json(
        { error: 'fileId, cronExpression, and functionName are required' },
        { status: 400 }
      )
    }

    // Verify file belongs to user
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const schedule = await prisma.schedule.create({
      data: {
        fileId,
        cronExpression,
        functionName,
        envVars: envVars ? JSON.stringify(envVars) : null,
        localStorage: localStorage ? JSON.stringify(localStorage) : null,
        enabled: true
      }
    })

    // Start the schedule immediately
    startSchedule(schedule)

    return NextResponse.json({ schedule })
  } catch (error) {
    console.error('Create schedule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
