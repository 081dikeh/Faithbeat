// app/discover/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { sql } from '@/lib/db'
import SiteHeader from '@/app/components/site-header'
import SiteFooter from '@/app/components/site-footer'
import HymnIndex, { type IndexRow } from '@/app/components/hymn-index'
import { primaryBtn } from '@/app/components/ui'

export const metadata: Metadata = { title: 'Shared hymns' }

const LANGS = ['english', 'igbo', 'yoruba', 'hausa']
const EVENTS = ['christmas', 'easter']
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'english', label: 'English' },
  { key: 'igbo', label: 'Igbo' },
  { key: 'yoruba', label: 'Yorùbá' },
  { key: 'hausa', label: 'Hausa' },
  { key: 'christmas', label: 'Christmas' },
  { key: 'easter', label: 'Easter' },
]

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams
  const active = (f ?? 'all').toLowerCase()
  const lang = LANGS.includes(active) ? active : null
  const event = EVENTS.includes(active) ? active : null
  const current = lang ?? event ?? 'all'

  const hymns = (await sql`
    select h.*, u.name as author_name
    from hymns h
    left join neon_auth."user" u on u.id = h.user_id
    where h.is_public = true
      and (${lang}::text is null or h.language = ${lang})
      and (${event}::text is null or h.church_event = ${event})
    order by h.plays_count desc, h.created_at desc
    limit 50
  `) as IndexRow[]

  return (
    <div className="min-h-screen">
      <SiteHeader active="discover" />
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <h1 className="display text-[3rem] sm:text-[4.4rem]">Shared hymns</h1>
        <p className="text-serif-body mt-3 max-w-2xl text-ink-2">
          Hymns that writers have chosen to share. Open one to read the words, play the four parts and print
          the score.
        </p>

        <nav aria-label="Filter hymns" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-b border-rule pb-4">
          {FILTERS.map((item) => {
            const isCurrent = item.key === current
            return (
              <Link
                key={item.key}
                href={item.key === 'all' ? '/discover' : `/discover?f=${item.key}`}
                aria-current={isCurrent ? 'true' : undefined}
                className={`px-1 py-0.5 text-[0.95rem] ${isCurrent ? 'hl font-medium text-ink' : 'text-ink-2 hover:text-ink'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6">
          {hymns.length > 0 ? (
            <HymnIndex rows={hymns} showAuthor />
          ) : (
            <div className="staff border-y border-rule px-2 py-14">
              <div className="max-w-lg border border-rule bg-sheet p-5">
                <h2 className="heading text-[1.7rem]">
                  {current === 'all' ? 'No hymns have been shared yet' : 'No shared hymns match this filter yet'}
                </h2>
                <p className="text-serif-body mt-3 text-ink-2">
                  Write a hymn and share it, and it will appear here for other choirs to use.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <Link href="/create" className={primaryBtn}>Write a hymn</Link>
                  {current !== 'all' && (
                    <Link href="/discover" className="underline underline-offset-4">Clear filter</Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}