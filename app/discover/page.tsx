// app/discover/page.tsx
import { sql } from '@/lib/db'
import Link from 'next/link'
import { Music, Globe, Calendar, Play } from 'lucide-react'

export default async function DiscoverPage() {
  const hymns = await sql`
    select h.*, u.name as author_name
    from hymns h
    left join neon_auth."user" u on u.id = h.user_id
    where h.is_public = true
    order by h.plays_count desc
    limit 50
  `

  const languageLabels: Record<string, string> = {
    english: 'English',
    igbo: 'Igbo',
    yoruba: 'Yoruba',
    hausa: 'Hausa'
  }

  const filters = ['All', 'English', 'Igbo', 'Yoruba', 'Hausa', 'Christmas', 'Easter']

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur border-b border-brass-soft/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-ink mb-2">
                Discover Hymns
              </h1>
              <p className="text-ink-soft/70">
                Explore hymns created by the community
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-ink text-parchment rounded-lg hover:bg-ink/90 transition-colors"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white/50 backdrop-blur border-b border-brass-soft/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto">
            {filters.map((f, i) => (
              <button
                key={f}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
                  i === 0
                    ? 'bg-ink text-parchment'
                    : 'border border-brass-soft/50 text-ink-soft/70 hover:border-brass'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {hymns && hymns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hymns.map((hymn: any) => (
              <div
                key={hymn.id}
                className="bg-white/70 backdrop-blur rounded-xl border border-brass-soft/40 hover:border-brass transition-colors overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-ink p-4 text-parchment">
                  <h3 className="font-[family-name:var(--font-display)] text-lg italic mb-1">{hymn.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-brass-soft">
                    <Globe className="w-3 h-3" />
                    {languageLabels[hymn.language] || hymn.language}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3 text-sm text-ink-soft/60">
                    {hymn.church_event && hymn.church_event !== 'general' && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {hymn.church_event}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {hymn.plays_count || 0} plays
                    </div>
                  </div>

                  <div className="bg-parchment-dim/60 rounded-lg p-3 mb-4">
                    <pre className="text-xs text-ink-soft/80 whitespace-pre-wrap font-[family-name:var(--font-display)] line-clamp-4">
                      {hymn.lyrics}
                    </pre>
                  </div>

                  <Link
                    href={`/hymn/${hymn.id}`}
                    className="block w-full text-center py-2 bg-ink text-parchment rounded-lg hover:bg-ink/90 font-medium transition-colors"
                  >
                    View & Listen
                  </Link>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2 bg-parchment-dim/40 border-t border-brass-soft/20 text-xs text-ink-soft/50">
                  Created {new Date(hymn.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-brass-soft mx-auto mb-4" />
            <h3 className="font-[family-name:var(--font-display)] text-2xl italic text-ink mb-2">
              No Public Hymns Yet
            </h3>
            <p className="text-ink-soft/70 mb-6">
              Be the first to share your hymn with the community!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-parchment rounded-lg hover:bg-ink/90 transition-colors"
            >
              <Music className="w-5 h-5 text-brass" />
              Create a Hymn
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
