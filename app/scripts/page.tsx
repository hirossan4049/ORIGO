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

export default function ScriptsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchScripts()
    }
  }, [status, router])

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/scripts')
      const data = await response.json()
      setScripts(data.scripts || [])
    } catch (error) {
      console.error('Error fetching scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Scripts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scripts.length === 0 ? (
          <div className="col-span-full bg-white shadow-md rounded-lg p-8 text-center">
            <p className="text-gray-600">No scripts found.</p>
          </div>
        ) : (
          scripts.map((script) => (
            <div key={script.id} className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{script.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {script.language} • Updated: {new Date(script.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Link href={`/scripts/${script.id}`} className="mt-4 inline-block text-right font-medium text-blue-600 hover:underline">Edit Script</Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
