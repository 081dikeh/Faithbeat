// app/dashboard/page.tsx
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Music, Plus, Library, Calendar } from 'lucide-react'
import SignOutButton from '@/app/components/sign-out-button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { data: session } = await auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }
  const user = session.user

  const [{ count }] = await sql`
    select count(*)::int as count from hymns where user_id = ${user.id}
  `
  const hymnCount = count || 0

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur border-b border-brass-soft/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="w-7 h-7 text-brass" />
            <h1 className="font-[family-name:var(--font-display)] text-2xl italic text-ink">Faithbeat</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft/70">
              {user.name || user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl italic text-ink mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Friend'}
          </h2>
          <p className="text-lg text-ink-soft/70">
            Ready to write some beautiful hymns today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-brass-soft/40 border-l-4 border-l-brass">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ink-soft/70">Total Hymns</h3>
              <Library className="w-5 h-5 text-brass" />
            </div>
            <p className="text-3xl font-[family-name:var(--font-display)] text-ink">{hymnCount}</p>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-brass-soft/40 border-l-4 border-l-sage">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ink-soft/70">This Week</h3>
              <Calendar className="w-5 h-5 text-sage" />
            </div>
            <p className="text-3xl font-[family-name:var(--font-display)] text-ink">0</p>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-xl p-6 border border-brass-soft/40 border-l-4 border-l-wine">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ink-soft/70">Languages</h3>
              <Music className="w-5 h-5 text-wine" />
            </div>
            <p className="text-3xl font-[family-name:var(--font-display)] text-ink">4</p>
            <p className="text-xs text-ink-soft/50 mt-1">En, Ig, Yo, Ha</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/create"
            className="bg-ink rounded-2xl p-8 text-parchment hover:bg-ink/90 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <Plus className="w-10 h-10 text-brass" />
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl italic mb-2">Create New Hymn</h3>
            <p className="text-parchment/70">
              Write a custom hymn from a title and description
            </p>
          </Link>

          <Link
            href="/my-hymns"
            className="bg-white/70 backdrop-blur rounded-2xl p-8 border border-brass-soft/40 hover:border-brass transition-colors block"
          >
            <div className="flex items-center justify-between mb-4">
              <Library className="w-10 h-10 text-brass" />
              <span className="text-4xl font-[family-name:var(--font-display)] text-ink/10">{hymnCount}</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl italic text-ink mb-2">My Hymns</h3>
            <p className="text-ink-soft/70">
              View and manage your created hymns
            </p>
          </Link>

          <Link
            href="/compose"
            className="bg-sage rounded-2xl p-8 text-white hover:bg-sage/90 transition-colors md:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <Music className="w-10 h-10" />
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-2xl italic mb-2">Compose & Arrange</h3>
            <p className="text-white/80">
              Generate SATB notation and playback
            </p>
          </Link>
        </div>

        {/* Getting Started Guide */}
        {hymnCount === 0 && (
          <div className="mt-12 bg-white/70 backdrop-blur rounded-2xl p-8 border border-brass-soft/40">
            <h3 className="font-[family-name:var(--font-display)] text-xl italic text-ink mb-4">
              Getting Started
            </h3>
            <ol className="space-y-3 text-ink-soft/80">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brass text-ink rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Click "Create New Hymn" and describe what it should be about</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brass text-ink rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Choose your language and occasion</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brass text-ink rounded-full flex items-center justify-center text-sm font-bold">
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
