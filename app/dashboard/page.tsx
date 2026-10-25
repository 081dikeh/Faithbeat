// app/dashboard/page.tsx
import type { Metadata } from 'next'
import { getSessionSafe } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { dailyLimit } from '@/lib/usage'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/app/components/site-header'
import SiteFooter from '@/app/components/site-footer'
import HymnIndex, { type IndexRow } from '@/app/components/hymn-index'
import { primaryBtn } from '@/app/components/ui'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Home' }

export default async function DashboardPage() {
  const session = await getSessionSafe()
  if (!session?.user) redirect('/login')
  const user = session.user

  const [stats] = (await sql`
    select count(*)::int as hymns,
           count(*) filter (where is_public)::int as shared,
           coalesce(sum(plays_count), 0)::int as plays
    from hymns where user_id = ${user.id}
  `) as { hymns: number; shared: number; plays: number }[]

  const recent = (await sql`
    with mine as (
      select h.*,
             row_number() over (order by h.created_at asc)::int as number,
             exists (
               select 1 from satb_arrangements a
               where a.hymn_id = h.id and a.status = 'ready' and a.abc_notation is not null
             ) as has_music
      from hymns h where h.user_id = ${user.id}
    )
    select * from mine order by created_at desc limit 5
  `) as IndexRow[]

  // Remaining AI generations today (needs migration 002; the page works without it)
  let left: number | null = null
  try {
    const [u] = (await sql`
      select count(*)::int as c from generation_usage
      where user_id = ${user.id}::uuid and kind = 'hymn' and created_at > now() - interval '24 hours'
    `) as { c: number }[]
    left = Math.max(0, dailyLimit('hymn') - u.c)
  } catch {
    left = null
  }

  const first = user.name?.split(' ')[0]

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1 className="display text-[3rem] sm:text-[4.4rem]">
              {first ? `Welcome back, ${first}.` : 'Welcome back.'}
            </h1>
            <p className="text-serif-body mt-4 text-ink-2">
              {stats.hymns === 0
                ? 'Your library is empty. Describe a hymn in a sentence or two and it will appear here.'
                : `${stats.hymns} ${stats.hymns === 1 ? 'hymn' : 'hymns'} in your library, ${stats.shared} shared${
                    stats.plays > 0 ? `, played ${stats.plays} ${stats.plays === 1 ? 'time' : 'times'}` : ''
                  }.`}
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Link href="/create" className={primaryBtn}>
              Write a hymn
            </Link>
            {left !== null && (
              <p className="mt-3 text-sm text-ink-3">
                {left === 0
                  ? 'You have used today’s hymn limit. It resets within 24 hours.'
                  : `You can write ${left} more ${left === 1 ? 'hymn' : 'hymns'} today.`}
              </p>
            )}
          </div>
        </div>

        {recent.length > 0 && (
          <section className="mt-16" aria-labelledby="recent">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="recent" className="heading text-[1.7rem]">Recent hymns</h2>
              <Link href="/my-hymns" className="text-[0.95rem] underline underline-offset-4 decoration-rule hover:decoration-ink">
                All your hymns
              </Link>
            </div>
            <HymnIndex rows={recent} showStatus />
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}