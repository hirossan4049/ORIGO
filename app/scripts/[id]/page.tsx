'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading editor...</div>
})

interface Schedule {
  id: string
  cronExpression: string
  functionName: string
  enabled: boolean
  envVars: string | null
  localStorage: string | null
}

interface Execution {
  id: string
  status: string
  output: string | null
  error: string | null
  startedAt: string
  endedAt: string | null
}

interface Script {
  id: string
  name: string
  code: string
  language: string
  projectId: string
  project: {
    id: string
    name: string
  }
  schedules: Schedule[]
}

interface EnvVar {
  key: string
  value: string
}

interface LocalStorageItem {
  key: string
  value: string
}

export default function ScriptPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [script, setScript] = useState<Script | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [functionName, setFunctionName] = useState('main')
  const [executeResult, setExecuteResult] = useState<any>(null)
  const [executions, setExecutions] = useState<Execution[]>([])
  const [activeTab, setActiveTab] = useState<'editor' | 'logs'>('editor')
  
  // Schedule configuration
  const [scheduleType, setScheduleType] = useState<'minutes' | 'hours' | 'days' | 'custom'>('minutes')
  const [scheduleValue, setScheduleValue] = useState('5')
  
  // Environment variables as key-value pairs
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: '', value: '' }])
  
  // LocalStorage as key-value pairs
  const [localStorageItems, setLocalStorageItems] = useState<LocalStorageItem[]>([{ key: '', value: '' }])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchScript()
      fetchExecutions()
    }
  }, [status, router, params])

  const fetchScript = async () => {
    try {
      const response = await fetch(`/api/scripts/${params.id}`)
      const data = await response.json()
      setScript(data.script)
      setCode(data.script.code)
    } catch (error) {
      console.error('Error fetching script:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExecutions = async () => {
    try {
      const response = await fetch(`/api/scripts/${params.id}/executions`)
      const data = await response.json()
      setExecutions(data.executions || [])
    } catch (error) {
      console.error('Error fetching executions:', error)
    }
  }

  const saveScript = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/scripts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: script?.name,
          code,
          language: script?.language
        })
      })

      if (response.ok) {
        alert('Script saved successfully')
      }
    } catch (error) {
      console.error('Error saving script:', error)
    } finally {
      setSaving(false)
    }
  }

  const executeScript = async () => {
    try {
      // Convert env vars array to object
      const envVarsObj: Record<string, string> = {}
      envVars.forEach(item => {
        if (item.key) {
          envVarsObj[item.key] = item.value
        }
      })

      // Convert localStorage array to object
      const localStorageObj: Record<string, string> = {}
      localStorageItems.forEach(item => {
        if (item.key) {
          localStorageObj[item.key] = item.value
        }
      })

      const response = await fetch(`/api/scripts/${params.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          functionName: functionName || 'main',
          envVars: envVarsObj,
          localStorage: localStorageObj
        })
      })

      const result = await response.json()
      setExecuteResult(result)
      
      // Refresh executions after running
      setTimeout(() => fetchExecutions(), 1000)
    } catch (error) {
      console.error('Error executing script:', error)
      setExecuteResult({ success: false, error: 'Failed to execute' })
    }
  }

  const getCronExpression = () => {
    switch (scheduleType) {
      case 'minutes':
        return `*/${scheduleValue} * * * *`
      case 'hours':
        return `0 */${scheduleValue} * * *`
      case 'days':
        return `0 0 */${scheduleValue} * *`
      case 'custom':
        return scheduleValue
      default:
        return '*/5 * * * *'
    }
  }

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert env vars array to object
      const envVarsObj: Record<string, string> = {}
      envVars.forEach(item => {
        if (item.key) {
          envVarsObj[item.key] = item.value
        }
      })

      // Convert localStorage array to object
      const localStorageObj: Record<string, string> = {}
      localStorageItems.forEach(item => {
        if (item.key) {
          localStorageObj[item.key] = item.value
        }
      })

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptId: params.id,
          cronExpression: getCronExpression(),
          functionName,
          envVars: envVarsObj,
          localStorage: localStorageObj
        })
      })

      if (response.ok) {
        setShowScheduleModal(false)
        fetchScript()
        alert('Schedule created successfully')
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
      alert('Failed to create schedule')
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchScript()
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }])
  }

  const removeEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index))
  }

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = [...envVars]
    newEnvVars[index][field] = value
    setEnvVars(newEnvVars)
  }

  const addLocalStorageItem = () => {
    setLocalStorageItems([...localStorageItems, { key: '', value: '' }])
  }

  const removeLocalStorageItem = (index: number) => {
    setLocalStorageItems(localStorageItems.filter((_, i) => i !== index))
  }

  const updateLocalStorageItem = (index: number, field: 'key' | 'value', value: string) => {
    const newItems = [...localStorageItems]
    newItems[index][field] = value
    setLocalStorageItems(newItems)
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!script) {
    return <div className="container">Script not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{script.name}</h1>
          <p className="text-gray-600">{script.language}</p>
        </div>
        <div className="flex space-x-4">
          <Link href={`/projects/${script.projectId}`} className="text-blue-600 hover:underline">
            Back to {script.project.name}
          </Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'editor' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Code Editor
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'logs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Execution Logs ({executions.length})
        </button>
      </div>

      {activeTab === 'editor' && (
        <>
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Code Editor</h2>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <MonacoEditor
                height="500px"
                language={script.language === 'typescript' ? 'typescript' : 'javascript'}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
            <div className="mt-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200" onClick={saveScript} disabled={saving}>
                {saving ? 'Saving...' : 'Save Code'}
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Execute Script</h2>
            <div className="mb-4">
              <label htmlFor="functionName" className="block text-sm font-medium text-gray-700 mb-1">Function Name</label>
              <input
                id="functionName"
                type="text"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="main"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Environment Variables</label>
              {envVars.map((item, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200"
                    onClick={() => removeEnvVar(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200" onClick={addEnvVar}>
                + Add Environment Variable
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Local Storage</label>
              {localStorageItems.map((item, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) => updateLocalStorageItem(index, 'key', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => updateLocalStorageItem(index, 'value', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200"
                    onClick={() => removeLocalStorageItem(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200" onClick={addLocalStorageItem}>
                + Add Local Storage Item
              </button>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200" onClick={executeScript}>
              Execute Now
            </button>
            {executeResult && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-800">Result:</h3>
                <pre className="bg-gray-100 p-3 rounded-md max-h-80 overflow-auto text-sm text-gray-800">
                  {JSON.stringify(executeResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Schedules</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200" onClick={() => setShowScheduleModal(true)}>
              Create Schedule
            </button>

            {showScheduleModal && (
              <form onSubmit={createSchedule} className="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Create New Schedule</h3>

                <div className="mb-4">
                  <label htmlFor="scheduleType" className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                  <select
                    id="scheduleType"
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value as any)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="minutes">Every X Minutes</option>
                    <option value="hours">Every X Hours</option>
                    <option value="days">Every X Days</option>
                    <option value="custom">Custom Cron Expression</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="scheduleValue" className="block text-sm font-medium text-gray-700 mb-1">
                    {scheduleType === 'custom' ? 'Cron Expression' : 'Interval'}
                  </label>
                  <input
                    id="scheduleValue"
                    type="text"
                    value={scheduleValue}
                    onChange={(e) => setScheduleValue(e.target.value)}
                    placeholder={scheduleType === 'custom' ? '*/5 * * * *' : '5'}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {scheduleType !== 'custom' && (
                    <small className="mt-1 text-gray-500 block">
                      Will run every {scheduleValue} {scheduleType}
                      {' '}(Cron: {getCronExpression()})
                    </small>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="schedFunctionName" className="block text-sm font-medium text-gray-700 mb-1">Function Name</label>
                  <input
                    id="schedFunctionName"
                    type="text"
                    value={functionName}
                    onChange={(e) => setFunctionName(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
                    Create Schedule
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              {script.schedules.length === 0 ? (
                <p className="text-gray-600">No schedules configured</p>
              ) : (
                script.schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`border border-gray-200 rounded-lg p-4 mb-4 ${schedule.enabled ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="text-sm text-gray-700">
                      <strong>Cron:</strong> {schedule.cronExpression}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Function:</strong> {schedule.functionName}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <strong>Status:</strong>{' '}
                      <span className={`font-semibold ${schedule.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <button
                      className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200"
                      onClick={() => deleteSchedule(schedule.id)}
                    >
                      Delete Schedule
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Execution Logs</h2>
          {executions.length === 0 ? (
            <p className="text-gray-600">No executions yet. Run the script to see logs here.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto pr-2">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className={`border border-gray-200 rounded-lg p-4 mb-4 ${execution.status === 'success' ? 'bg-blue-50' : execution.status === 'error' ? 'bg-red-50' : 'bg-yellow-50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <strong className="text-gray-800">Status:</strong>{' '}
                      <span className={`font-bold ${execution.status === 'success' ? 'text-green-600' : execution.status === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {execution.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(execution.startedAt).toLocaleString()}
                      {execution.endedAt && (
                        <> • Duration: {Math.round((new Date(execution.endedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s</>
                      )}
                    </div>
                  </div>
                  
                  {execution.output && (
                    <div className="mt-2">
                      <strong className="text-gray-800">Output:</strong>
                      <pre className="bg-gray-100 p-3 rounded-md mt-1 text-sm text-gray-800 max-h-40 overflow-auto">
                        {execution.output}
                      </pre>
                    </div>
                  )}
                  
                  {execution.error && (
                    <div className="mt-2">
                      <strong className="text-red-600">Error:</strong>
                      <pre className="bg-red-100 p-3 rounded-md mt-1 text-sm text-red-800 max-h-40 overflow-auto">
                        {execution.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
