import { prisma } from './db'

export interface ExecutionContext {
  env: Record<string, string>
  localStorage: Record<string, any>
}

export async function executeScript(
  scriptId: string,
  functionName: string,
  context: ExecutionContext
) {
  const execution = await prisma.execution.create({
    data: {
      scriptId,
      status: 'running',
      startedAt: new Date()
    }
  })

  try {
    const script = await prisma.script.findUnique({
      where: { id: scriptId }
    })

    if (!script) {
      throw new Error('Script not found')
    }

    // Create output buffer to capture console logs
    const outputBuffer: string[] = []
    
    // Create a sandbox object
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          const message = args.map(arg => {
            try {
              return typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            } catch {
              return '[Circular or Non-serializable]'
            }
          }).join(' ')
          outputBuffer.push(message)
          console.log('[Script]', message)
        },
        error: (...args: any[]) => {
          const message = args.map(arg => {
            try {
              return typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            } catch {
              return '[Circular or Non-serializable]'
            }
          }).join(' ')
          outputBuffer.push('ERROR: ' + message)
          console.error('[Script]', message)
        }
      },
      env: context.env,
      localStorage: context.localStorage
    }

    // Validate function name to prevent code injection
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(functionName)) {
      throw new Error('Invalid function name')
    }

    // Execute the script using Function constructor
    // This provides basic isolation but note: not suitable for untrusted code
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
    const fn = new AsyncFunction('console', 'env', 'localStorage', `
      ${script.code}
      
      // Call the specified function
      if (typeof ${functionName} === 'function') {
        return await ${functionName}();
      } else {
        throw new Error('Function ${functionName} not found');
      }
    `)

    const result = await fn(sandbox.console, sandbox.env, sandbox.localStorage)

    // Update execution status
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'success',
        output: JSON.stringify({ result, logs: outputBuffer }),
        endedAt: new Date()
      }
    })

    return { success: true, result, logs: outputBuffer }
  } catch (error: any) {
    // Update execution status with error
    await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: 'error',
        error: error.message,
        endedAt: new Date()
      }
    })

    return { success: false, error: error.message }
  }
}
