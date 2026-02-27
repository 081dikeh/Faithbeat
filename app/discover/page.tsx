// app/discover/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Music, Globe, Calendar, Play, TrendingUp } from 'lucide-react'

export default async function DiscoverPage() {
  const supabase = await createClient()

  // Get public hymns
  const { data: hymns } = await supabase
    .from('hymns')
    .select('*, profiles:user_id(full_name)')
    .eq('is_public', true)
    .order('plays_count', { ascending: false })
    .limit(50)

  const languageLabels: Record<string, string> = {
    english: 'English 🇬🇧',
    igbo: 'Igbo 🇳🇬',
    yoruba: 'Yoruba 🇳🇬',
    hausa: 'Hausa 🇳🇬'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Discover Hymns
              </h1>
              <p className="text-gray-600">
                Explore beautiful hymns created by our community
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg whitespace-nowrap">
              All
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
              English
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
              Igbo
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
              Yoruba
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
              Hausa
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
              Christmas
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
              Easter
            </button>
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
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                  <h3 className="text-lg font-bold mb-1">{hymn.title}</h3>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Globe className="w-3 h-3" />
                    {languageLabels[hymn.language]}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Metadata */}
                  <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
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

                  {/* Lyrics Preview */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-serif line-clamp-4">
                      {hymn.lyrics}
                    </pre>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/hymn/${hymn.id}`}
                    className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    View & Listen
                  </Link>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                  Created {new Date(hymn.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Public Hymns Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your hymn with the community!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Music className="w-5 h-5" />
              Create a Hymn
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}