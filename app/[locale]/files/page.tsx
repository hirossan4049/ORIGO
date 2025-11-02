'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/app/components/AppLayout'

interface File {
  id: string
  name: string
  language: string
  createdAt: string
  updatedAt: string
  project: {
    id: string
    name: string
  }
}

export default function FilesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchFiles()
    }
  }, [status, router, fetchFiles])

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>
  }

  if (status !== 'authenticated') {
    return null
  }

  return (
    <AppLayout>
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Files</h1>
            <p className="text-gray-600 mt-1">Manage your files across all projects</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.length === 0 ? (
              <div className="col-span-full bg-white shadow-md rounded-lg p-8 text-center">
                <p className="text-gray-600">No files found.</p>
              </div>
            ) : (
              files.map((file) => (
                <Link
                  key={file.id}
                  href={`/files/${file.id}`}
                  className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  data-testid="file-card"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{file.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Project: {file.project.name}</p>
                    <p className="text-sm text-gray-500">
                      {file.language} • Updated: {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="mt-4 text-right font-medium text-blue-600">Edit</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
