'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/app/components/AppLayout'

interface Project {
  id: string
  name: string
  description: string | null
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProject()
    }
    // fetchProject and params are stable in Next.js App Router
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>
  }

  if (status !== 'authenticated') {
    return null
  }

  if (loading) {
    return <AppLayout><div className="p-6">Loading...</div></AppLayout>
  }

  if (!project) {
    return <AppLayout><div className="p-6">Project not found</div></AppLayout>
  }

  return (
    <AppLayout projectName={project.name} projectId={project.id}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && <p className="text-gray-600 mt-1">{project.description}</p>}
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="flex space-x-3 mt-4">
          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors" onClick={deleteProject}>
            Delete Project
          </button>
        </div>

        <div className="mt-6">
          <p>Select a file from the list to start editing.</p>
        </div>
      </div>
    </AppLayout>
  )
}

