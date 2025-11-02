import { prisma } from './db'
import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export interface ExecutionContext {
  env: Record<string, string>
  localStorage: Record<string, any>
}

export type Runtime = 'nodejs' | 'deno'

async function executeWithNodeJS(
  content: string,
  functionName: string,
  context: ExecutionContext
): Promise<{ result: any; logs: string[] }> {
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

  // Execute the script using Function constructor
  // This provides basic isolation but note: not suitable for untrusted code
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
  const fn = new AsyncFunction('console', 'env', 'localStorage', `
    ${content}
    
    // Call the specified function
    if (typeof ${functionName} === 'function') {
      return await ${functionName}();
    } else {
      throw new Error('Function ${functionName} not found');
    }
  `)

  const result = await fn(sandbox.console, sandbox.env, sandbox.localStorage)
  return { result, logs: outputBuffer }
}

async function executeWithDeno(
  content: string,
  functionName: string,
  context: ExecutionContext
): Promise<{ result: any; logs: string[] }> {
  return new Promise((resolve, reject) => {
    // Create a wrapper script that sets up the environment
    const wrapperScript = `
// Set up the environment
const env = ${JSON.stringify(context.env)};
const localStorage = ${JSON.stringify(context.localStorage)};

// Override console to capture output
const originalLog = console.log;
const originalError = console.error;
const logs = [];

console.log = (...args) => {
  const message = args.map(arg => {
    try {
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
    } catch {
      return '[Circular or Non-serializable]';
    }
  }).join(' ');
  logs.push(message);
  originalLog('[Script]', message);
};

console.error = (...args) => {
  const message = args.map(arg => {
    try {
      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
    } catch {
      return '[Circular or Non-serializable]';
    }
  }).join(' ');
  logs.push('ERROR: ' + message);
  originalError('[Script]', message);
};

// User's code
${content}

// Execute the specified function
(async () => {
  try {
    if (typeof ${functionName} !== 'function') {
      throw new Error('Function ${functionName} not found');
    }
    const result = await ${functionName}();
    // Output result as JSON
    originalLog('__ORIGO_RESULT__' + JSON.stringify({ success: true, result, logs }));
  } catch (error) {
    originalLog('__ORIGO_RESULT__' + JSON.stringify({ 
      success: false, 
      error: error.message,
      logs 
    }));
  }
})();
`

    // Write the script to a temporary file
    const tempFile = join(tmpdir(), `origo-${Date.now()}-${Math.random().toString(36).substring(7)}.ts`)
    
    writeFile(tempFile, wrapperScript)
      .then(() => {
        // Execute with Deno
        const denoProcess = spawn('deno', ['run', '--allow-all', tempFile], {
          env: { ...process.env, ...context.env }
        })

        let stdout = ''
        let stderr = ''

        denoProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        denoProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        denoProcess.on('close', async (code) => {
          // Clean up temp file
          await unlink(tempFile).catch(() => {})

          if (code !== 0) {
            reject(new Error(`Deno process exited with code ${code}: ${stderr}`))
            return
          }

          // Extract result from stdout
          const resultMatch = stdout.match(/__ORIGO_RESULT__(.+)/)
          if (resultMatch) {
            try {
              const parsed = JSON.parse(resultMatch[1])
              if (parsed.success === false) {
                reject(new Error(parsed.error))
              } else {
                resolve({ result: parsed.result, logs: parsed.logs })
              }
            } catch (_error) {
              reject(new Error('Failed to parse execution result'))
            }
          } else {
            reject(new Error('No result found in output'))
          }
        })

        denoProcess.on('error', async (error) => {
          await unlink(tempFile).catch(() => {})
          reject(error)
        })
      })
      .catch(reject)
  })
}

export async function executeScript(
  fileId: string,
  functionName: string,
  content: string,
  context: ExecutionContext,
  runtime: Runtime = 'nodejs'
) {
  const execution = await prisma.execution.create({
    data: {
      fileId,
      status: 'running',
      startedAt: new Date()
    }
  })

  try {
    // Validate function name to prevent code injection
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(functionName)) {
      throw new Error('Invalid function name')
    }

    let result
    let outputBuffer: string[]

    if (runtime === 'deno') {
      const executeResult = await executeWithDeno(content, functionName, context)
      result = executeResult.result
      outputBuffer = executeResult.logs
    } else {
      const executeResult = await executeWithNodeJS(content, functionName, context)
      result = executeResult.result
      outputBuffer = executeResult.logs
    }

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
