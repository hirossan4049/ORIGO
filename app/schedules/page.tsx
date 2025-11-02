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
  file: {
    id: string
    name: string
  }
}

export default function SchedulesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSchedules()
    }
  }, [status, router])

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedules')
      const data = await response.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
        <p className="text-gray-600 mt-1">Manage your scheduled executions</p>
      </div>
      <div className="bg-white shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">File</th>
              <th scope="col" className="px-6 py-3">Function</th>
              <th scope="col" className="px-6 py-3">Cron Expression</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="bg-white border-b hover:bg-gray-50" data-testid="schedule-card">
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${schedule.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {schedule.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  <Link href={`/files/${schedule.file.id}`} className="hover:underline">{schedule.file.name}</Link>
                </td>
                <td className="px-6 py-4">{schedule.functionName}</td>
                <td className="px-6 py-4">{schedule.cronExpression}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/files/${schedule.file.id}`} className="font-medium text-blue-600 hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {schedules.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-600">No schedules found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
