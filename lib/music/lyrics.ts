// lib/music/lyrics.ts
import { Syllable, syllabifyLine } from './syllables'
import type { Language } from './types'

const HEADER =
  /^[^\p{L}\p{N}]*(?:verse|stanza|chorus|refrain|nkeji|ẹsẹ|ese|aya|ukwe|orin)(?![\p{L}])[\s\d.:)\-–]*$/iu

/** Split pasted/generated lyrics into verses (arrays of lines), dropping "Verse 1:" headers. */
export function parseLyrics(raw: string): string[][] {
  const blocks = raw.replace(/\r/g, '').split(/\n\s*\n/)
  let verses = blocks
    .map((b) =>
      b
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !HEADER.test(l))
        .map((l) => l.replace(/^\d+[.)]\s+/, ''))
    )
    .filter((lines) => lines.length > 0)
  if (verses.length === 1 && verses[0].length > 4) {
    const all = verses[0]
    verses = []
    for (let i = 0; i < all.length; i += 4) verses.push(all.slice(i, i + 4))
  }
  return verses
}

export interface LyricsAnalysis {
  verses: string[][]
  /** syllables[verse][line] */
  syllables: Syllable[][][]
  /** notes needed per line = max syllables across verses */
  counts: number[]
}

export function analyzeLyrics(raw: string, language: Language): LyricsAnalysis {
  const verses = parseLyrics(raw).slice(0, 8)
  if (verses.length === 0) throw new Error('No lyrics found')
  const linesPerVerse = verses[0].length
  if (linesPerVerse < 2) throw new Error('Each verse needs at least 2 lines to set to music')
  if (linesPerVerse > 8) throw new Error('Verses with more than 8 lines are not supported yet')
  const syllables = verses.map((v) =>
    Array.from({ length: linesPerVerse }, (_, j) => (v[j] ? syllabifyLine(v[j], language) : []))
  )
  const counts = Array.from({ length: linesPerVerse }, (_, j) => {
    const c = Math.max(...syllables.map((v) => v[j].length))
    return c > 0 ? c : 4
  })
  if (counts.some((c) => c > 30)) throw new Error('A line is too long to set as a single phrase')
  return { verses, syllables, counts }
}

const clean = (t: string) => t.replace(/[|_*~\\-]/g, '')

/** One ABC `w:` fragment for a line, padded with `_` (hold) up to the note count. */
export function formatLyricLine(syl: Syllable[], total: number, versePrefix?: number): string {
  if (syl.length === 0) return Array.from({ length: total }, () => '*').join(' ')
  const parts = syl.map((s, i) => {
    let text = clean(s.text) || '*'
    if (i === 0 && versePrefix) text = `${versePrefix}.~${text}`
    return text + (s.wordEnd ? ' ' : '-')
  })
  let out = parts.join('')
  for (let k = syl.length; k < total; k++) out += ' _'
  return out.trim()
}