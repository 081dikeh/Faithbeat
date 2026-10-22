// lib/music/compose.ts
// Lyrics (+ optional AI melody contour) -> validated 4-part arrangement + ABC.
import { analyzeLyrics, formatLyricLine } from './lyrics'
import { layoutRhythm } from './rhythm'
import { degreeToMidi, hashString, proceduralContour, repairContour } from './melody'
import { harmonize, ROMAN } from './harmonize'
import { buildAbc } from './abc'
import { KeyName, Language } from './types'

export interface ComposeInput {
  title: string
  lyrics: string
  language: Language
  key?: KeyName
  tempo?: number
  /** scale degrees per line, e.g. proposed by an LLM; validated and repaired here */
  contour?: unknown
}

export interface VoiceOut {
  part: 'soprano' | 'alto' | 'tenor' | 'bass'
  notes: { midi: number; dur: number }[]
}

export interface ComposeResult {
  abc: string
  key: KeyName
  tempo: number
  timeSignature: '4/4'
  voices: VoiceOut[]
  chords: string[]
  syllableCounts: number[]
  source: 'ai' | 'algorithmic'
  warnings: string[]
}

export function composeHymn(input: ComposeInput): ComposeResult {
  const analysis = analyzeLyrics(input.lyrics, input.language)
  const { counts } = analysis
  const seed = hashString(`${input.title}|${input.lyrics}`)
  const key: KeyName = input.key ?? (['G', 'F', 'D', 'C', 'Eb'] as KeyName[])[seed % 5]
  const tempo = Math.min(120, Math.max(60, Math.round(input.tempo ?? 80)))
  const warnings: string[] = []
  const slots = layoutRhythm(counts)

  let contour: number[][]
  let source: 'ai' | 'algorithmic' = 'algorithmic'
  const repaired = input.contour !== undefined ? repairContour(input.contour, counts) : null
  if (repaired) {
    contour = repaired.contour
    source = 'ai'
    if (repaired.repaired) warnings.push('The proposed melody was adjusted to fit the lyrics.')
  } else {
    contour = proceduralContour(counts, seed)
    if (input.contour !== undefined) warnings.push('The AI melody could not be used, so an algorithmic melody was generated.')
  }

  const sop = contour.flat().map((d) => degreeToMidi(key, d))
  const h = harmonize(sop, slots, key)
  if (h.relaxed) warnings.push('Voice-leading rules had to be relaxed for this melody.')

  const multi = analysis.verses.length > 1
  const lyric = analysis.syllables.map((verse, v) =>
    verse.map((syl, j) => formatLyricLine(syl, counts[j], multi && j === 0 ? v + 1 : undefined))
  )
  const abc = buildAbc({
    title: input.title,
    key,
    tempo,
    slots,
    voices: { S: sop, A: h.alto, T: h.tenor, B: h.bass },
    lyric,
  })
  const mk = (part: VoiceOut['part'], midi: number[]): VoiceOut => ({
    part,
    notes: midi.map((m, i) => ({ midi: m, dur: slots[i].dur })),
  })
  return {
    abc,
    key,
    tempo,
    timeSignature: '4/4',
    voices: [mk('soprano', sop), mk('alto', h.alto), mk('tenor', h.tenor), mk('bass', h.bass)],
    chords: h.chords.map((c) => ROMAN[c]),
    syllableCounts: counts,
    source,
    warnings,
  }
}