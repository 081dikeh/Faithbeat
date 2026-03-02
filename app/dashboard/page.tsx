// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Music, Plus, Library, Calendar, LogOut } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's hymns count
  const { count } = await supabase
    .from('hymns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const hymnCount = count || 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">FaithBeat</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.user_metadata?.full_name || user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Friend'}! 👋
          </h2>
          <p className="text-xl text-gray-600">
            Ready to create some beautiful hymns today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Hymns</h3>
              <Library className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{hymnCount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">This Week</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Languages</h3>
              <Music className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">4</p>
            <p className="text-xs text-gray-500 mt-1">En, Ig, Yo, Ha</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/create"
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <Plus className="w-12 h-12" />
              <span className="text-4xl font-bold opacity-20">+</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Create New Hymn</h3>
            <p className="text-purple-100">
              Generate a custom hymn with AI in seconds
            </p>
          </Link>

          <Link
            href="/my-hymns"
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-600 transition-all block cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <Library className="w-12 h-12 text-purple-600" />
              <span className="text-4xl font-bold text-gray-100">{hymnCount}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">My Hymns</h3>
            <p className="text-gray-600">
              View and manage your created hymns
            </p>
          </Link>

          <Link
            href="/compose"
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white hover:from-green-700 hover:to-green-800 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <Music className="w-12 h-12" />
              <span className="text-4xl font-bold opacity-20">♫</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Compose & Arrange</h3>
            <p className="text-green-100">
              Generate SATB notation and playback
            </p>
          </Link>
        </div>

        {/* Getting Started Guide */}
        {hymnCount === 0 && (
          <div className="mt-12 bg-blue-50 rounded-2xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🎵 Getting Started
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Click "Create New Hymn" to generate your first hymn</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Choose your language and church event</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Save your hymn to your library</span>
              </li>
            </ol>
          </div>
        )}
      </main>
    </div>
  )
}