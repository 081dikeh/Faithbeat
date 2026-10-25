// app/hymn/[id]/page.tsx
import { getSessionSafe } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import SiteHeader from '@/app/components/site-header'
import SiteFooter from '@/app/components/site-footer'
import HymnActions from '@/app/components/hymn-actions'
import ArrangementPanel from '@/app/components/arrangement-panel'
import VisibilityToggle from '@/app/components/visibility-toggle'
import { parseLyrics } from '@/lib/music/lyrics'
import { eventLabel, formatDate, languageLabel } from '@/lib/labels'

export const dynamic = 'force-dynamic'

interface HymnRow {
  id: string
  user_id: string
  title: string
  lyrics: string
  description: string | null
  theme: string | null
  language: string
  church_event: string | null
  is_public: boolean
  plays_count: number
  created_at: string
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function HymnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSessionSafe()

  if (!UUID.test(id)) notFound()

  const [hymn] = (await sql`select * from hymns where id = ${id}`) as HymnRow[]
  if (!hymn) notFound()

  const isOwner = !!session?.user && hymn.user_id === session.user.id

  // Private hymns are only for their owner; public hymns can be viewed by anyone.
  if (!isOwner && !hymn.is_public) {
    redirect(session?.user ? '/dashboard' : `/login?redirectTo=/hymn/${id}`)
  }

  const [arrangement] = (await sql`
    select abc_notation, key_signature, tempo_bpm from satb_arrangements
    where hymn_id = ${id} and status = 'ready' and abc_notation is not null
    order by created_at desc
    limit 1
  `) as { abc_notation: string; key_signature: string | null; tempo_bpm: number | null }[]

  let number: number | null = null
  if (isOwner) {
    const [n] = (await sql`
      select count(*)::int as n from hymns
      where user_id = ${hymn.user_id} and created_at <= (select created_at from hymns where id = ${id})
    `) as { n: number }[]
    number = n.n
  }

  const verses = parseLyrics(hymn.lyrics)
  const meta = [
    number ? `Hymn ${number}` : null,
    languageLabel(hymn.language),
    eventLabel(hymn.church_event),
    formatDate(hymn.created_at),
    hymn.is_public && hymn.plays_count > 0
      ? `played ${hymn.plays_count} ${hymn.plays_count === 1 ? 'time' : 'times'}`
      : null,
  ].filter(Boolean)

  return (
    <div className="min-h-screen">
      <SiteHeader active={isOwner ? 'library' : 'discover'} />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href={isOwner ? '/my-hymns' : '/discover'}
          className="text-sm text-ink-2 underline decoration-rule underline-offset-4 hover:decoration-ink"
        >
          {isOwner ? 'Your hymns' : 'Shared hymns'}
        </Link>

        <header className="mt-8 border-b border-ink pb-8">
          <p className="text-sm text-ink-3">{meta.join(', ')}</p>
          <h1 className="display mt-3 text-[3.2rem] sm:text-[5rem]">{hymn.title}</h1>
          {hymn.description && (
            <p className="text-serif-body mt-5 max-w-2xl italic text-ink-2">{hymn.description}</p>
          )}
        </header>

        <div className="mt-10 grid gap-14 lg:grid-cols-12 lg:gap-12">
          <section aria-labelledby="words-heading" className="lg:col-span-5">
            <h2 id="words-heading" className="heading text-[1.6rem]">Words</h2>
            {verses.length > 0 ? (
              <ol className="lyrics mt-5 space-y-7">
                {verses.map((lines, i) => (
                  <li key={i} className="grid grid-cols-[2rem_1fr] gap-x-2">
                    <span className="pt-[0.5rem] font-sans text-sm text-ink-3">{i + 1}</span>
                    <p className="whitespace-pre-line">{lines.join('\n')}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <pre className="lyrics mt-5 whitespace-pre-wrap">{hymn.lyrics}</pre>
            )}
          </section>

          <div className="lg:col-span-7">
            <ArrangementPanel
              hymnId={hymn.id}
              isOwner={isOwner}
              initial={
                arrangement
                  ? { abc: arrangement.abc_notation, keySignature: arrangement.key_signature, tempo: arrangement.tempo_bpm }
                  : null
              }
            />
          </div>
        </div>

        <div className="mt-16 space-y-6">
          {isOwner && <VisibilityToggle hymnId={hymn.id} initialPublic={hymn.is_public} />}
          <HymnActions
            isOwner={isOwner}
            hymn={{
              id: hymn.id,
              title: hymn.title,
              lyrics: hymn.lyrics,
              language: hymn.language,
              church_event: hymn.church_event ?? undefined,
              theme: hymn.theme ?? undefined,
            }}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}