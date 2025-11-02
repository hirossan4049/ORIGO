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

    const result = await executeScript(params.id, functionName, {
      env: envVars || {},
      localStorage: localStorage || {}
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Execute script error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
