import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'ORIGO - Scheduled Script Execution',
  description: 'Execute TypeScript/JavaScript on schedule',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
