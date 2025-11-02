'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  scripts: Array<{ id: string; name: string }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status, router])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription
        })
      })

      if (response.ok) {
        setNewProjectName('')
        setNewProjectDescription('')
        setShowCreateModal(false)
        fetchProjects()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Dashboard</h1>
        <p>Welcome, {session?.user?.name || session?.user?.email}</p>
        <div className="nav">
          <Link href="/dashboard">Projects</Link>
          <a href="/api/auth/signout">Logout</a>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button className="button" onClick={() => setShowCreateModal(true)}>
          Create New Project
        </button>
      </div>

      {showCreateModal && (
        <div className="card">
          <h2>Create New Project</h2>
          <form onSubmit={createProject}>
            <div className="form-group">
              <label htmlFor="name">Project Name</label>
              <input
                id="name"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                style={{ minHeight: '100px' }}
              />
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

      <div className="grid">
        {projects.length === 0 ? (
          <div className="card">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="card">
              <h2>{project.name}</h2>
              {project.description && <p>{project.description}</p>}
              <p style={{ fontSize: '12px', color: '#999' }}>
                {project.scripts.length} script(s)
              </p>
              <Link href={`/projects/${project.id}`}>
                <button className="button">Open Project</button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
