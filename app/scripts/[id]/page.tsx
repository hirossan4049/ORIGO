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
    <div className="container">
      <div className="header">
        <h1>{script.name}</h1>
        <p>{script.language}</p>
        <div className="nav">
          <Link href={`/projects/${script.projectId}`}>Back to {script.project.name}</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('editor')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'editor' ? '#0070f3' : 'transparent',
            color: activeTab === 'editor' ? '#fff' : '#333',
            border: 'none',
            borderBottom: activeTab === 'editor' ? '2px solid #0070f3' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'editor' ? 'bold' : 'normal'
          }}
        >
          Code Editor
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'logs' ? '#0070f3' : 'transparent',
            color: activeTab === 'logs' ? '#fff' : '#333',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '2px solid #0070f3' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'logs' ? 'bold' : 'normal'
          }}
        >
          Execution Logs ({executions.length})
        </button>
      </div>

      {activeTab === 'editor' && (
        <>
          <div className="card">
            <h2>Code Editor</h2>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
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
            <div style={{ marginTop: '10px' }}>
              <button className="button" onClick={saveScript} disabled={saving}>
                {saving ? 'Saving...' : 'Save Code'}
              </button>
            </div>
          </div>

          <div className="card">
            <h2>Execute Script</h2>
            <div className="form-group">
              <label htmlFor="functionName">Function Name</label>
              <input
                id="functionName"
                type="text"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="main"
              />
            </div>

            <div className="form-group">
              <label>Environment Variables</label>
              {envVars.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="button button-danger"
                    onClick={() => removeEnvVar(index)}
                    style={{ padding: '10px 15px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="button button-secondary" onClick={addEnvVar}>
                + Add Environment Variable
              </button>
            </div>

            <div className="form-group">
              <label>Local Storage</label>
              {localStorageItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Key"
                    value={item.key}
                    onChange={(e) => updateLocalStorageItem(index, 'key', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => updateLocalStorageItem(index, 'value', e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="button button-danger"
                    onClick={() => removeLocalStorageItem(index)}
                    style={{ padding: '10px 15px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="button button-secondary" onClick={addLocalStorageItem}>
                + Add Local Storage Item
              </button>
            </div>

            <button className="button" onClick={executeScript}>
              Execute Now
            </button>
            {executeResult && (
              <div style={{ marginTop: '10px' }}>
                <h3>Result:</h3>
                <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(executeResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="card">
            <h2>Schedules</h2>
            <button className="button" onClick={() => setShowScheduleModal(true)}>
              Create Schedule
            </button>

            {showScheduleModal && (
              <form onSubmit={createSchedule} style={{ marginTop: '20px', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px' }}>
                <h3>Create New Schedule</h3>
                
                <div className="form-group">
                  <label htmlFor="scheduleType">Schedule Type</label>
                  <select
                    id="scheduleType"
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value as any)}
                  >
                    <option value="minutes">Every X Minutes</option>
                    <option value="hours">Every X Hours</option>
                    <option value="days">Every X Days</option>
                    <option value="custom">Custom Cron Expression</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="scheduleValue">
                    {scheduleType === 'custom' ? 'Cron Expression' : 'Interval'}
                  </label>
                  <input
                    id="scheduleValue"
                    type="text"
                    value={scheduleValue}
                    onChange={(e) => setScheduleValue(e.target.value)}
                    placeholder={scheduleType === 'custom' ? '*/5 * * * *' : '5'}
                  />
                  {scheduleType !== 'custom' && (
                    <small>
                      Will run every {scheduleValue} {scheduleType}
                      {' '} (Cron: {getCronExpression()})
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="schedFunctionName">Function Name</label>
                  <input
                    id="schedFunctionName"
                    type="text"
                    value={functionName}
                    onChange={(e) => setFunctionName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="button">
                    Create Schedule
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div style={{ marginTop: '20px' }}>
              {script.schedules.length === 0 ? (
                <p>No schedules configured</p>
              ) : (
                script.schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '4px',
                      background: schedule.enabled ? '#fff' : '#f5f5f5'
                    }}
                  >
                    <div>
                      <strong>Cron:</strong> {schedule.cronExpression}
                    </div>
                    <div>
                      <strong>Function:</strong> {schedule.functionName}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span style={{ color: schedule.enabled ? 'green' : 'red' }}>
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <button
                      className="button button-danger"
                      style={{ marginTop: '10px' }}
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
        <div className="card">
          <h2>Execution Logs</h2>
          {executions.length === 0 ? (
            <p>No executions yet. Run the script to see logs here.</p>
          ) : (
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    padding: '15px',
                    marginBottom: '15px',
                    borderRadius: '4px',
                    background: execution.status === 'success' ? '#f0f9ff' : execution.status === 'error' ? '#fff0f0' : '#fffbf0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span style={{
                        color: execution.status === 'success' ? 'green' : execution.status === 'error' ? 'red' : 'orange',
                        fontWeight: 'bold'
                      }}>
                        {execution.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(execution.startedAt).toLocaleString()}
                      {execution.endedAt && (
                        <> • Duration: {Math.round((new Date(execution.endedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s</>
                      )}
                    </div>
                  </div>
                  
                  {execution.output && (
                    <div>
                      <strong>Output:</strong>
                      <pre style={{
                        background: '#f5f5f5',
                        padding: '10px',
                        borderRadius: '4px',
                        marginTop: '5px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {execution.output}
                      </pre>
                    </div>
                  )}
                  
                  {execution.error && (
                    <div style={{ marginTop: '10px' }}>
                      <strong style={{ color: 'red' }}>Error:</strong>
                      <pre style={{
                        background: '#ffe0e0',
                        padding: '10px',
                        borderRadius: '4px',
                        marginTop: '5px',
                        fontSize: '12px',
                        overflow: 'auto',
                        color: 'red'
                      }}>
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
