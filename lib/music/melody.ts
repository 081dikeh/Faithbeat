// lib/music/melody.ts
// A melody "contour" is scale degrees per syllable (1 = tonic, 8 = octave).
// The AI proposes one; repairContour() makes it safe, proceduralContour() is
// the algorithmic fallback (still generated per request, never canned).
import { KeyName, MAJOR_SCALE, tonicMidi } from './types'

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function degreeToMidi(key: KeyName, degree: number): number {
  const idx = degree - 1
  const oct = Math.floor(idx / 7)
  const r = ((idx % 7) + 7) % 7
  return tonicMidi(key) + MAJOR_SCALE[r] + 12 * oct
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function fitToCount(arr: number[], n: number): number[] {
  if (arr.length === n) return [...arr]
  if (n === 1) return [arr[0]]
  return Array.from({ length: n }, (_, k) => arr[Math.round((k * (arr.length - 1)) / (n - 1))])
}

function nearest(v: number, options: number[]): number {
  return options.reduce((best, o) => (Math.abs(o - v) < Math.abs(best - v) ? o : best), options[0])
}

const MAX_LEAP = 4 // scale steps (a fifth)

/** Force structure: stable line endings, bounded leaps, limited range. */
function shape(lines: number[][]): number[][] {
  const L = lines.length
  const half = Math.floor(L / 2) - 1
  let prevEnd: number | null = null
  return lines.map((line, j) => {
    const out = line.map((d) => clamp(Math.round(d), 1, 8))
    if (prevEnd !== null) out[0] = clamp(out[0], prevEnd - MAX_LEAP, prevEnd + MAX_LEAP)
    for (let k = 1; k < out.length; k++) out[k] = clamp(out[k], out[k - 1] - MAX_LEAP, out[k - 1] + MAX_LEAP)
    const last = out.length - 1
    if (j === L - 1) out[last] = 1
    else if (j === half) out[last] = [2, 5, 7].includes(out[last]) ? out[last] : 5
    else out[last] = nearest(out[last], [1, 3, 5])
    if (last > 0) out[last - 1] = clamp(out[last - 1], out[last] - MAX_LEAP, out[last] + MAX_LEAP)
    // the note before the final tonic should lead to it by step
    if (j === L - 1 && last > 0 && Math.abs(out[last - 1] - 1) > 1) out[last - 1] = 2
    prevEnd = out[last]
    return out
  })
}

export function repairContour(raw: unknown, counts: number[]): { contour: number[][]; repaired: boolean } | null {
  if (!Array.isArray(raw) || raw.length !== counts.length) return null
  let repaired = false
  const lines: number[][] = []
  for (let j = 0; j < counts.length; j++) {
    const line = raw[j]
    if (!Array.isArray(line)) return null
    const nums = line.map(Number).filter((n) => Number.isFinite(n))
    if (nums.length === 0) return null
    if (nums.length !== counts[j]) repaired = true
    lines.push(fitToCount(nums, counts[j]))
  }
  // judge variety on what the model actually wrote, before cadences are forced onto it
  if (new Set(lines.flat().map((d) => clamp(Math.round(d), 1, 8))).size < 4) return null
  return { contour: shape(lines), repaired }
}

function walk(n: number, start: number, end: number, rng: () => number): number[] {
  const peak = 1 + Math.floor(rng() * 3) + (n > 6 ? 1 : 0)
  return Array.from({ length: n }, (_, k) => {
    if (k === 0) return start
    if (k === n - 1) return end
    const t = k / (n - 1)
    const base = start + (end - start) * t + peak * Math.sin(Math.PI * t)
    const noise = rng() < 0.35 ? (rng() < 0.5 ? -1 : 1) : 0
    return Math.round(base + noise)
  }).map((d, k, arr) => {
    // avoid 3+ identical notes in a row: nudge by a step toward the phrase target
    if (k > 1 && k < n - 1 && d === arr[k - 1] && d === arr[k - 2]) {
      arr[k] = clamp(d + (end >= d ? 1 : -1), 1, 8)
      return arr[k]
    }
    return d
  })
}

export function proceduralContour(counts: number[], seed: number): number[][] {
  const rng = mulberry32(seed)
  const L = counts.length
  const half = Math.floor(L / 2) - 1
  const starts = [1, 3, 5]
  const first = starts[Math.floor(rng() * starts.length)]
  const lines: number[][] = []
  for (let j = 0; j < L; j++) {
    const n = counts[j]
    let line: number[]
    if (j === L - 1) line = walk(n, 5 - Math.floor(rng() * 2), 1, rng)
    else if (j === half) line = walk(n, lines[0]?.[lines[0].length - 1] ?? first, 5, rng)
    else if (j === 2 && lines[0]) {
      // restate the opening phrase with a small variation (AABA-like shape)
      line = fitToCount(lines[0], n)
      const k = Math.floor(rng() * n)
      line[k] = line[k] + (rng() < 0.5 ? 1 : -1)
    } else line = walk(n, j === 0 ? first : 3, [3, 5][Math.floor(rng() * 2)], rng)
    lines.push(line)
  }
  return shape(lines)
}