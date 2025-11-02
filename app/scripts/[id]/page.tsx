'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Schedule {
  id: string
  cronExpression: string
  functionName: string
  enabled: boolean
  envVars: string | null
  localStorage: string | null
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

export default function ScriptPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [script, setScript] = useState<Script | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [cronExpression, setCronExpression] = useState('*/5 * * * *')
  const [functionName, setFunctionName] = useState('main')
  const [envVars, setEnvVars] = useState('')
  const [localStorage, setLocalStorage] = useState('')
  const [executeResult, setExecuteResult] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchScript()
    }
  }, [status, router])

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
      const response = await fetch(`/api/scripts/${params.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          functionName: functionName || 'main',
          envVars: envVars ? JSON.parse(envVars) : {},
          localStorage: localStorage ? JSON.parse(localStorage) : {}
        })
      })

      const result = await response.json()
      setExecuteResult(result)
    } catch (error) {
      console.error('Error executing script:', error)
      setExecuteResult({ success: false, error: 'Failed to execute' })
    }
  }

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptId: params.id,
          cronExpression,
          functionName,
          envVars: envVars ? JSON.parse(envVars) : null,
          localStorage: localStorage ? JSON.parse(localStorage) : null
        })
      })

      if (response.ok) {
        setShowScheduleModal(false)
        fetchScript()
        alert('Schedule created successfully')
      }
    } catch (error) {
      console.error('Error creating schedule:', error)
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

      <div className="card">
        <h2>Code Editor</h2>
        <div className="form-group">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ minHeight: '400px', fontFamily: 'monospace' }}
          />
        </div>
        <button className="button" onClick={saveScript} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
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
          <label htmlFor="envVars">Environment Variables (JSON)</label>
          <textarea
            id="envVars"
            value={envVars}
            onChange={(e) => setEnvVars(e.target.value)}
            placeholder='{"API_KEY": "value"}'
            style={{ minHeight: '100px' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="localStorage">Local Storage (JSON)</label>
          <textarea
            id="localStorage"
            value={localStorage}
            onChange={(e) => setLocalStorage(e.target.value)}
            placeholder='{"key": "value"}'
            style={{ minHeight: '100px' }}
          />
        </div>
        <button className="button" onClick={executeScript}>
          Execute Now
        </button>
        {executeResult && (
          <div style={{ marginTop: '10px' }}>
            <h3>Result:</h3>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
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
          <form onSubmit={createSchedule} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label htmlFor="cron">Cron Expression</label>
              <input
                id="cron"
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="*/5 * * * *"
                required
              />
              <small>Examples: */5 * * * * (every 5 minutes), 0 0 * * * (daily at midnight)</small>
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
                Create
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
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '4px'
                }}
              >
                <div>
                  <strong>Cron:</strong> {schedule.cronExpression}
                </div>
                <div>
                  <strong>Function:</strong> {schedule.functionName}
                </div>
                <div>
                  <strong>Status:</strong> {schedule.enabled ? 'Enabled' : 'Disabled'}
                </div>
                <button
                  className="button button-danger"
                  style={{ marginTop: '10px' }}
                  onClick={() => deleteSchedule(schedule.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
