// app/my-hymns/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Music, ArrowLeft } from 'lucide-react'

export default async function MyHymnsPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log('MyHymnsPage auth', { user, authError })

  if (!user) {
    redirect('/login')
  }

  // Get user's hymns
  const { data: hymns, error } = await supabase
    .from('hymns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching hymns:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Hymns</h1>
          </div>
          <Link
            href="/create"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create New
          </Link>
        </div>

        {hymns && hymns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hymns.map((hymn: any) => (
              <div
                key={hymn.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {hymn.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {hymn.language} • {new Date(hymn.created_at).toLocaleDateString()}
                </p>
                <div className="bg-gray-50 rounded p-3 mb-4">
                  <pre className="text-xs text-gray-700 line-clamp-3 whitespace-pre-wrap">
                    {hymn.lyrics}
                  </pre>
                </div>
                <Link
                  href={`/hymn/${hymn.id}`}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 block text-center"
                >
                  View Full
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Hymns Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first hymn to get started!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Music className="w-5 h-5" />
              Create Your First Hymn
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}