// lib/music/syllables.ts
// Heuristic syllabification for English, Igbo, Yoruba and Hausa. The African
// languages are written with mostly open (CV) syllables, so a rule-based split
// is reliable; English uses a vowel-group heuristic with silent-e handling.
import type { Language } from './types'

export interface Syllable {
  text: string
  wordEnd: boolean
}

const MARKS = /[\u0300-\u036f]/
const baseOf = (u: string) => u.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const isVowelUnit = (u: string) => /^[aeiou]$/.test(baseOf(u))

function splitUnits(word: string): string[] {
  const units: string[] = []
  for (const ch of word.normalize('NFD')) {
    if (MARKS.test(ch) && units.length) units[units.length - 1] += ch
    else units.push(ch)
  }
  return units.map((u) => u.normalize('NFC'))
}

const AFRICAN_DIGRAPHS: Record<string, string[]> = {
  igbo: ['ch', 'gb', 'gh', 'gw', 'kp', 'kw', 'ny', 'nw', 'sh'],
  yoruba: ['gb', 'kp'],
  hausa: ['ts', 'sh', 'ky', 'gy', 'fy', 'kw', 'gw'],
}

function mergeDigraphs(units: string[], set: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < units.length; i++) {
    const u = units[i]
    const nx = units[i + 1]
    if (nx !== undefined && !isVowelUnit(u) && !isVowelUnit(nx) && set.includes(baseOf(u) + baseOf(nx))) {
      out.push(u + nx)
      i++
    } else out.push(u)
  }
  return out
}

function syllabifyAfricanPart(part: string, lang: Language): string[] {
  const units = mergeDigraphs(splitUnits(part), AFRICAN_DIGRAPHS[lang] ?? [])
  const nuclei: number[] = []
  units.forEach((u, i) => {
    if (isVowelUnit(u)) {
      nuclei.push(i)
      return
    }
    const b = baseOf(u)
    const next = units[i + 1]
    // word-initial syllabic nasal: "nkorin", "ndagwurugwu", "mba"
    if ((b === 'n' || b === 'm') && i === 0 && (next === undefined || !isVowelUnit(next))) nuclei.push(i)
  })
  if (nuclei.length === 0) return [units.join('')]
  const starts = nuclei.map((n, s) => {
    if (s === 0) return 0
    const between = n - nuclei[s - 1] - 1
    return between >= 1 ? n - 1 : n
  })
  return nuclei.map((_, s) => {
    const end = s + 1 < nuclei.length ? starts[s + 1] : units.length
    return units.slice(starts[s], end).join('')
  })
}

const EN_DIGRAPHS = ['th', 'sh', 'ch', 'ph', 'wh', 'ck', 'ng', 'gh', 'qu']
const LEGAL_ONSETS = new Set([
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp',
  'st', 'sw', 'tr', 'tw', 'kn', 'wr', 'str', 'spr', 'spl', 'scr', 'shr', 'thr',
])

function englishUnits(cluster: string): string[] {
  const out: string[] = []
  for (let i = 0; i < cluster.length; i++) {
    const two = cluster.slice(i, i + 2)
    if (EN_DIGRAPHS.includes(two)) {
      out.push(two)
      i++
    } else out.push(cluster[i])
  }
  return out
}

/** Offset inside a consonant cluster where the next syllable begins. */
function clusterBoundary(cluster: string): number {
  if (cluster.length === 0) return 0
  const units = englishUnits(cluster)
  if (units.length === 1) return units[0] === 'ng' || units[0] === 'ck' ? cluster.length : 0
  let onsetLen = units[units.length - 1].length
  for (const take of [3, 2]) {
    if (units.length >= take) {
      const s = units.slice(-take).join('')
      if (LEGAL_ONSETS.has(s)) {
        onsetLen = s.length
        break
      }
    }
  }
  return cluster.length - onsetLen
}

function syllabifyEnglishCore(core: string): string[] {
  const lower = core.toLowerCase()
  const nuclei: { start: number; end: number }[] = []
  const re = /[aeiouy]+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(lower))) {
    let start = m.index
    const end = m.index + m[0].length
    if (start === 0 && m[0][0] === 'y' && m[0].length > 1) start = 1
    const group = lower.slice(start, end)
    const prev = lower[start - 1]
    const blocked = prev !== undefined && 'tsxcgq'.includes(prev)
    if (!blocked && group === 'uia') {
      nuclei.push({ start, end: start + 1 }, { start: start + 1, end })
    } else if (!blocked && group === 'iou') {
      nuclei.push({ start, end: start + 1 }, { start: start + 1, end })
    } else if (!blocked && (group === 'ia' || group === 'io' || group === 'ua')) {
      nuclei.push({ start, end: start + 1 }, { start: start + 1, end })
    } else nuclei.push({ start, end })
  }
  const last = nuclei[nuclei.length - 1]
  if (nuclei.length > 1 && last) {
    const L = lower.length
    const silentE =
      /[^aeiouy]e$/.test(lower) && !/[^aeiouy]le$/.test(lower) && last.start === L - 1 && last.end === L
    const silentEd = /[^aeiouytd]ed$/.test(lower) && last.start === L - 2 && last.end === L - 1
    const silentEs = /[^aeiouysxzcgh]es$/.test(lower) && last.start === L - 2 && last.end === L - 1
    if (silentE || silentEd || silentEs) nuclei.pop()
  }
  if (nuclei.length === 0) return [core]
  const bounds: number[] = [0]
  for (let k = 0; k + 1 < nuclei.length; k++) {
    const cluster = lower.slice(nuclei[k].end, nuclei[k + 1].start)
    bounds.push(nuclei[k].end + clusterBoundary(cluster))
  }
  bounds.push(core.length)
  const out: string[] = []
  for (let k = 0; k + 1 < bounds.length; k++) out.push(core.slice(bounds[k], bounds[k + 1]))
  return out
}

function syllabifyToken(token: string, lang: Language): string[] {
  const lead = (token.match(/^[^\p{L}\p{M}]*/u) ?? [''])[0]
  const trail = (token.match(/[^\p{L}\p{M}]*$/u) ?? [''])[0]
  const core = token.slice(lead.length, token.length - trail.length)
  if (!core) return []
  const out: string[] = []
  for (const part of core.split(/[-–—]/).filter(Boolean)) {
    if (lang === 'english') {
      out.push(...syllabifyEnglishCore(part))
    } else {
      const pieces = part.split("'")
      pieces.forEach((piece, idx) => {
        if (!piece) return
        const syl = syllabifyAfricanPart(piece, lang)
        if (idx < pieces.length - 1) syl[syl.length - 1] += "'"
        out.push(...syl)
      })
    }
  }
  if (out.length === 0) return []
  out[0] = lead + out[0]
  out[out.length - 1] += trail
  return out
}

export function syllabifyLine(line: string, lang: Language): Syllable[] {
  const words = line.replace(/[’‘ʼ]/g, "'").trim().split(/\s+/).filter(Boolean)
  const result: Syllable[] = []
  for (const w of words) {
    const syl = syllabifyToken(w, lang)
    if (syl.length === 0) {
      // punctuation-only token: glue to the previous syllable
      if (result.length) result[result.length - 1].text += w
      continue
    }
    syl.forEach((text, i) => result.push({ text, wordEnd: i === syl.length - 1 }))
  }
  return result
}

export function countSyllables(line: string, lang: Language): number {
  return syllabifyLine(line, lang).length
}