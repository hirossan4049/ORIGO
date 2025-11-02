import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { executeScript } from '@/lib/executor'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { functionName, envVars, localStorage } = await req.json()

    if (!functionName) {
      return NextResponse.json(
        { error: 'functionName is required' },
        { status: 400 }
      )
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

    const result = await executeScript(params.id, functionName, file.content, {
      env: envVars || {},
      localStorage: localStorage || {}
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Execute file error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
