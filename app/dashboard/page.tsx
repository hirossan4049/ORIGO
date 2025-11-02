'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from './layout'

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
    // fetchProjects is stable and doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="gas-title">My Projects</h1>
            <p className="gas-subtitle mt-1">Create and manage your Apps Script projects</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="gas-button">
            <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create
          </button>
        </div>

        {showCreateModal && (
          <div className="gas-card">
            <div className="gas-card-header">
              <h3 className="gas-title">Create project</h3>
              <p className="gas-subtitle">Create a new Apps Script project</p>
            </div>
            <div className="gas-card-content">
              <form onSubmit={createProject} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="gas-label">Title</label>
                  <input
                    id="name"
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Untitled project"
                    className="gas-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="gas-label">Description</label>
                  <input
                    id="description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Project description (optional)"
                    className="gas-input"
                  />
                </div>
              </form>
            </div>
            <div className="gas-card-footer">
              <button onClick={() => setShowCreateModal(false)} className="gas-button-outline">
                Cancel
              </button>
              <button onClick={createProject} className="gas-button">
                Create
              </button>
            </div>
          </div>
        )}

        <div className="gas-card">
          <div className="gas-card-header">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="gas-title">Recent projects</h3>
                <p className="gas-subtitle mt-1">Your Apps Script projects</p>
              </div>
            </div>
          </div>
          <div style={{ padding: 0 }}>
            {projects.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center" style={{ justifyContent: 'center' }}>
                  <svg style={{ width: '24px', height: '24px' }} className="text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="gas-title mb-2">No projects yet</h3>
                <p className="gas-body text-muted-foreground mb-4">Get started by creating your first Apps Script project</p>
                <button onClick={() => setShowCreateModal(true)} className="gas-button">
                  Create your first project
                </button>
              </div>
            ) : (
              <table className="gas-table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Files</th>
                    <th>Last modified</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg style={{ width: '16px', height: '16px', color: '#1976d2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          </div>
                          <div>
                            <div className="gas-body font-medium">{project.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="gas-body text-muted-foreground">
                        {project.description || "No description"}
                      </td>
                      <td className="gas-body text-muted-foreground">
                        {project.scripts.length} file{project.scripts.length !== 1 ? 's' : ''}
                      </td>
                      <td className="gas-body text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Link href={`/projects/${project.id}`}>
                          <button className="gas-button-outline h-8 px-2" style={{ height: '32px' }}>
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
