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

    // Verify file belongs to user
    const file = await prisma.file.findFirst({
      where: {
        id: params.id,
        project: {
          userId: session.user.id
        }
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Get executions for this file
    const executions = await prisma.execution.findMany({
      where: {
        fileId: params.id
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
