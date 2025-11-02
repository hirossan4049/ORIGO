import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify script belongs to user
    const script = await prisma.script.findFirst({
      where: {
        id: params.id,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 })
    }

    // Get executions for this script
    const executions = await prisma.execution.findMany({
      where: {
        scriptId: params.id
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 50 // Limit to last 50 executions
    })

    return NextResponse.json({ executions })
  } catch (error) {
    console.error('Get executions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
