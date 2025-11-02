'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Script {
  id: string
  name: string
  language: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  scripts: Script[]
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newScriptName, setNewScriptName] = useState('')
  const [newScriptLanguage, setNewScriptLanguage] = useState('javascript')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProject()
    }
  }, [status, router])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const data = await response.json()
      setProject(data.project)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const createScript = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newScriptName,
          language: newScriptLanguage,
          code: `// ${newScriptName}\n\nfunction main() {\n  console.log('Hello from ${newScriptName}');\n}\n`,
          projectId: params.id
        })
      })

      if (response.ok) {
        setNewScriptName('')
        setShowCreateModal(false)
        fetchProject()
      }
    } catch (error) {
      console.error('Error creating script:', error)
    }
  }

  const deleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!project) {
    return <div className="container">Project not found</div>
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{project.name}</h1>
        {project.description && <p>{project.description}</p>}
        <div className="nav">
          <Link href="/dashboard">Back to Dashboard</Link>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button className="button" onClick={() => setShowCreateModal(true)}>
          Create New Script
        </button>
        <button className="button button-danger" onClick={deleteProject}>
          Delete Project
        </button>
      </div>

      {showCreateModal && (
        <div className="card">
          <h2>Create New Script</h2>
          <form onSubmit={createScript}>
            <div className="form-group">
              <label htmlFor="name">Script Name</label>
              <input
                id="name"
                type="text"
                value={newScriptName}
                onChange={(e) => setNewScriptName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={newScriptLanguage}
                onChange={(e) => setNewScriptLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="button">
                Create
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h2>Scripts</h2>
      <div className="grid">
        {project.scripts.length === 0 ? (
          <div className="card">
            <p>No scripts yet. Create your first script!</p>
          </div>
        ) : (
          project.scripts.map((script) => (
            <div key={script.id} className="card">
              <h3>{script.name}</h3>
              <p style={{ fontSize: '12px', color: '#999' }}>
                {script.language} • Updated: {new Date(script.updatedAt).toLocaleDateString()}
              </p>
              <Link href={`/scripts/${script.id}`}>
                <button className="button">Edit Script</button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
