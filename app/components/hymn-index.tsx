// app/components/hymn-index.tsx
// A hymnal-style index: ruled rows, hymn number, first line. Used wherever hymns are listed.
import Link from 'next/link'
import { parseLyrics } from '@/lib/music/lyrics'
import { eventLabel, formatDate, languageLabel } from '@/lib/labels'

export interface IndexRow {
  id: string
  number?: number
  title: string
  lyrics: string
  language: string
  church_event: string | null
  created_at: Date | string
  is_public?: boolean
  has_music?: boolean
  plays_count?: number
  author_name?: string | null
}

export default function HymnIndex({
  rows,
  showStatus = false,
  showAuthor = false,
}: {
  rows: IndexRow[]
  showStatus?: boolean
  showAuthor?: boolean
}) {
  const numbered = rows.some((r) => r.number !== undefined)
  const grid = numbered
    ? 'grid-cols-[3.25rem_1fr] sm:grid-cols-[4.5rem_1fr_auto]'
    : 'grid-cols-[1fr] sm:grid-cols-[1fr_auto]'
  const side = numbered ? 'col-start-2 sm:col-start-3' : 'col-start-1 sm:col-start-2'
  return (
    <ol className="border-t border-ink">
      {rows.map((h) => {
        const firstLine = parseLyrics(h.lyrics)[0]?.[0] ?? ''
        const meta = [languageLabel(h.language), eventLabel(h.church_event)]
        return (
          <li key={h.id} className="border-b border-rule">
            <Link
              href={`/hymn/${h.id}`}
              className={`group grid ${grid} items-baseline gap-x-4 gap-y-1 px-1 py-5 hover:bg-wash sm:gap-x-6`}
            >
              {numbered && (
                <span
                  className="display text-right text-[2rem] tabular-nums text-ink-3 group-hover:text-ink sm:text-[2.6rem]"
                  aria-label={`Hymn number ${h.number}`}
                >
                  {h.number}
                </span>
              )}

              <span className="min-w-0">
                <span className="heading block truncate text-[1.35rem] sm:text-[1.55rem]">{h.title}</span>
                {firstLine && (
                  <span className="mt-0.5 block truncate font-serif text-[1.05rem] italic text-ink-2">
                    {firstLine}
                  </span>
                )}
                <span className="mt-1.5 block text-sm text-ink-3">
                  {meta.join(', ')}
                  {showAuthor && h.author_name ? `, by ${h.author_name}` : ''}
                </span>
              </span>

              <span className={`${side} mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3 sm:mt-0 sm:flex-col sm:items-end sm:gap-1`}>
                {showStatus && (
                  <>
                    <span className={h.is_public ? 'hl px-1 font-medium text-ink' : ''}>
                      {h.is_public ? 'Shared' : 'Private'}
                    </span>
                    <span>{h.has_music ? 'Music ready' : 'Words only'}</span>
                  </>
                )}
                {typeof h.plays_count === 'number' && !showStatus && (
                  <span>{h.plays_count === 1 ? '1 play' : `${h.plays_count} plays`}</span>
                )}
                <span>{formatDate(h.created_at)}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}