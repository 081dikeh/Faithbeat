// app/my-hymns/page.tsx
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Music, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MyHymnsPage() {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  const hymns = await sql`
    select * from hymns where user_id = ${session.user.id} order by created_at desc
  `

  return (
    <div className="min-h-screen bg-parchment p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-ink-soft/60 hover:text-brass transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-ink">My Hymns</h1>
          </div>
          <Link
            href="/create"
            className="px-4 py-2 bg-ink text-parchment rounded-lg hover:bg-ink/90 transition-colors text-center"
          >
            Create New
          </Link>
        </div>

        <div className="staff-rule mb-8" />

        {hymns && hymns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hymns.map((hymn: any) => (
              <div
                key={hymn.id}
                className="bg-white/70 backdrop-blur rounded-xl border border-brass-soft/40 hover:border-brass transition-colors p-6"
              >
                <h3 className="font-[family-name:var(--font-display)] text-lg italic text-ink mb-2">
                  {hymn.title}
                </h3>
                <p className="text-sm text-ink-soft/60 mb-4">
                  {hymn.language} • {new Date(hymn.created_at).toLocaleDateString()}
                </p>
                <div className="bg-parchment-dim/60 rounded-lg p-3 mb-4">
                  <pre className="text-xs text-ink-soft/80 line-clamp-3 whitespace-pre-wrap">
                    {hymn.lyrics}
                  </pre>
                </div>
                <Link
                  href={`/hymn/${hymn.id}`}
                  className="w-full py-2 bg-ink text-parchment rounded-lg hover:bg-ink/90 block text-center transition-colors"
                >
                  View Full
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-brass-soft mx-auto mb-4" />
            <h3 className="font-[family-name:var(--font-display)] text-2xl italic text-ink mb-2">
              No Hymns Yet
            </h3>
            <p className="text-ink-soft/70 mb-6">
              Create your first hymn to get started!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-parchment rounded-lg hover:bg-ink/90 transition-colors"
            >
              <Music className="w-5 h-5 text-brass" />
              Create Your First Hymn
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
