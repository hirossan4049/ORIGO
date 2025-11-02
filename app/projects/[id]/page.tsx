'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface File {
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
  files: File[]
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('javascript')

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

  const createFile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFileName,
          language: newFileLanguage,
          content: `// ${newFileName}\n\nfunction main() {\n  console.log('Hello from ${newFileName}');\n}\n`,
          projectId: params.id
        })
      })

      if (response.ok) {
        setNewFileName('')
        setShowCreateModal(false)
        fetchProject()
      }
    } catch (error) {
      console.error('Error creating file:', error)
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
    return <div className="p-6">Loading...</div>
  }

  if (!project) {
    return <div className="p-6">Project not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && <p className="text-gray-600 mt-1">{project.description}</p>}
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>

      <div className="flex space-x-3">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors" onClick={() => setShowCreateModal(true)}>
          Create New File
        </button>
        <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors" onClick={deleteProject}>
          Delete Project
        </button>
      </div>

      {showCreateModal && (
        <div className="bg-white shadow-md rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Create New File</h3>
          </div>
          <div className="p-6">
            <form onSubmit={createFile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">File Name</label>
                <input
                  id="name"
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">Language</label>
                <select
                  id="language"
                  value={newFileLanguage}
                  onChange={(e) => setNewFileLanguage(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-900">Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.files.length === 0 ? (
          <div className="col-span-full bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600">No files yet. Create your first file!</p>
          </div>
        ) : (
          project.files.map((file) => (
            <div key={file.id} className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {file.language} • Updated: {new Date(file.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Link href={`/files/${file.id}`} className="mt-4 inline-block text-right font-medium text-blue-600 hover:underline">Edit File</Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
