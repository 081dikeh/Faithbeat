// app/hymn/[id]/not-found.tsx
import Link from 'next/link'
import { Music } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Hymn Not Found</h1>
        <p className="text-gray-600 mb-8">
          This hymn doesn't exist or you don't have permission to view it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/my-hymns"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            My Hymns
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}