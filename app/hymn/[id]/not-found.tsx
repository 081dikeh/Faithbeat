// app/hymn/[id]/not-found.tsx
import Link from 'next/link'
import { Music } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="text-center">
        <Music className="w-16 h-16 text-brass-soft mx-auto mb-4" />
        <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-ink mb-2">Hymn Not Found</h1>
        <p className="text-ink-soft/70 mb-8">
          This hymn doesn't exist or you don't have permission to view it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/my-hymns"
            className="px-6 py-3 bg-ink text-parchment rounded-lg hover:bg-ink/90 transition-colors"
          >
            My Hymns
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-brass-soft/50 text-ink-soft/70 rounded-lg hover:border-brass transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
