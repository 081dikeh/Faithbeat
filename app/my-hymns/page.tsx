// app/my-hymns/page.tsx
import type { Metadata } from 'next'
import { getSessionSafe } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/app/components/site-header'
import SiteFooter from '@/app/components/site-footer'
import HymnIndex, { type IndexRow } from '@/app/components/hymn-index'
import { primaryBtn } from '@/app/components/ui'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Your hymns' }

export default async function MyHymnsPage() {
  const session = await getSessionSafe()
  if (!session?.user) redirect('/login')

  const hymns = (await sql`
    with mine as (
      select h.*,
             row_number() over (order by h.created_at asc)::int as number,
             exists (
               select 1 from satb_arrangements a
               where a.hymn_id = h.id and a.status = 'ready' and a.abc_notation is not null
             ) as has_music
      from hymns h where h.user_id = ${session.user.id}
    )
    select * from mine order by created_at desc
  `) as IndexRow[]

  return (
    <div className="min-h-screen">
      <SiteHeader active="library" />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="display text-[3rem] sm:text-[4.4rem]">Your hymns</h1>
            <p className="text-serif-body mt-3 text-ink-2">
              {hymns.length === 0
                ? 'Nothing here yet.'
                : `${hymns.length} ${hymns.length === 1 ? 'hymn' : 'hymns'}, newest first. Numbers follow the order you wrote them.`}
            </p>
          </div>
          <Link href="/create" className={primaryBtn}>Write a hymn</Link>
        </div>

        {hymns.length > 0 ? (
          <HymnIndex rows={hymns} showStatus />
        ) : (
          <div className="staff border-y border-rule px-6 py-16 sm:py-20">
            <div className="max-w-lg border border-rule bg-sheet p-5">
              <h2 className="heading text-[1.8rem]">Your first hymn starts with a sentence</h2>
              <p className="text-serif-body mt-3 text-ink-2">
                Say what it is for, such as an occasion, a scripture or a feeling. The hymn you save appears here,
                with its music, ready to print and share.
              </p>
              <Link href="/create" className={`${primaryBtn} mt-6`}>Write a hymn</Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}