// lib/music/harmonize.ts
// Rule-based four-part harmonization by dynamic programming over diatonic
// triads (I ii iii IV V vi). Hard rules: ranges, no voice crossing, no
// parallel/consecutive 5ths or 8ves, no doubled leading tone, cadence on I.
import { KeyName, MAJOR_SCALE, keyPc } from './types'
import type { Slot } from './rhythm'

export interface HarmonizeResult {
  alto: number[]
  tenor: number[]
  bass: number[]
  chords: number[] // index into ROMAN
  relaxed: boolean // true if parallel-motion rules had to be softened
}
export const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi']

interface Chord { root: number; third: number; fifth: number; pcs: number[] }
interface State { chord: number; s: number; a: number; t: number; b: number; nct: boolean }
interface Node { st: State; cost: number; prev: number }

const A_RANGE = [55, 74]
const T_RANGE = [48, 67]
const B_RANGE = [40, 62]
const KEEP_PER_CHORD = 40
const KEEP_PER_LAYER = 160

// cost of moving between chords (rows/cols: I ii iii IV V vi)
const CHANGE = [
  [0.5, 1, 2, 0.5, 0.5, 1],
  [3, 0.5, 3, 2, 0, 2.5],
  [2.5, 2, 0.5, 1, 2.5, 0.5],
  [1, 1.5, 3, 0.5, 0, 2],
  [0, 3.5, 3, 3.5, 0.5, 1],
  [2, 1, 2, 0.5, 1.5, 0.5],
]
const LINE_END_PREF = [0, 3, 2.5, 1.2, 1.5, 1]

function buildChords(kp: number): Chord[] {
  return [0, 1, 2, 3, 4, 5].map((deg) => {
    const root = (kp + MAJOR_SCALE[deg]) % 12
    const third = (kp + MAJOR_SCALE[(deg + 2) % 7]) % 12
    const fifth = (kp + MAJOR_SCALE[(deg + 4) % 7]) % 12
    return { root, third, fifth, pcs: [root, third, fifth] }
  })
}

const sign = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0)

function parallel(p: State, q: State): boolean {
  const pv = [p.s, p.a, p.t, p.b]
  const qv = [q.s, q.a, q.t, q.b]
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const ip = Math.abs(pv[i] - pv[j]) % 12
      const iq = Math.abs(qv[i] - qv[j]) % 12
      if (ip !== iq || (ip !== 0 && ip !== 7)) continue
      const di = qv[i] - pv[i]
      const dj = qv[j] - pv[j]
      if (di === 0 || dj === 0) continue
      if (sign(di) === sign(dj)) return true
      if (i === 0 && j === 3) return true // contrary 5ths/8ves in the outer voices
    }
  }
  return false
}

function run(sop: number[], slots: Slot[], key: KeyName, strict: boolean): HarmonizeResult | null {
  const kp = keyPc(key)
  const leadingTone = (kp + 11) % 12
  const chords = buildChords(kp)
  const n = sop.length
  const last = n - 1
  const totalLines = slots[last].line + 1
  const halfLine = Math.floor(totalLines / 2) - 1

  function staticCost(ci: number, st: State, i: number): number {
    const ch = chords[ci]
    const pcs = [st.s % 12, st.a % 12, st.t % 12, st.b % 12]
    const cnt = (pc: number) => pcs.filter((p) => p === pc).length
    if (cnt(ch.root) === 0 || cnt(ch.third) === 0) return Infinity
    if (cnt(leadingTone) >= 2) return Infinity
    let c = 0
    if (cnt(ch.third) >= 2) c += 1.5
    if (cnt(ch.fifth) >= 2) c += 1
    if (cnt(ch.fifth) === 0) c += 0.4
    if (st.b % 12 === ch.third) c += 1.2
    if (st.a - st.t > 9) c += 0.4 * (st.a - st.t - 9)
    if (st.s - st.a > 7) c += 0.3 * (st.s - st.a - 7)
    c += 0.04 * (Math.abs(st.a - 66) + Math.abs(st.t - 57) + Math.abs(st.b - 49))
    const rootPos = st.b % 12 === ch.root
    if (i === last) {
      if (ci !== 0 || !rootPos) c += strict ? Infinity : 10
    } else if (i === last - 1) {
      c += ci === 4 ? 0 : ci === 3 ? 1.5 : ci === 1 ? 2.5 : 8
    }
    if (slots[i].lineEnd && i !== last) {
      if (!rootPos) c += 6
      if (slots[i].line === halfLine) c += ci === 4 ? 0 : ci === 0 ? 2.5 : 5
      else c += LINE_END_PREF[ci]
    }
    return c
  }

  function candidates(i: number): { st: State; cost: number }[] {
    const s = sop[i]
    const all: { st: State; cost: number }[] = []
    chords.forEach((ch, ci) => {
      if (!ch.pcs.includes(s % 12)) return
      const found: { st: State; cost: number }[] = []
      for (let b = B_RANGE[0]; b <= B_RANGE[1]; b++) {
        if (b % 12 !== ch.root && b % 12 !== ch.third) continue
        for (let t = Math.max(T_RANGE[0], b + 1); t <= T_RANGE[1]; t++) {
          if (t - b > 19) break
          if (!ch.pcs.includes(t % 12)) continue
          for (let a = Math.max(A_RANGE[0], t + 1); a < s && a <= A_RANGE[1]; a++) {
            if (a - t > 12) break
            if (s - a > 12 || !ch.pcs.includes(a % 12)) continue
            const st: State = { chord: ci, s, a, t, b, nct: false }
            const cost = staticCost(ci, st, i)
            if (cost !== Infinity) found.push({ st, cost })
          }
        }
      }
      found.sort((x, y) => x.cost - y.cost)
      all.push(...found.slice(0, KEEP_PER_CHORD))
    })
    return all
  }

  function transition(p: State, q: State, i: number): number {
    if (parallel(p, q)) {
      if (strict) return Infinity
    }
    let c = parallel(p, q) ? 25 : 0
    const change = p.chord !== q.chord
    // keep harmony moving: staying on one chord across several beats gets dull
    if (!change && slots[i].pos % 4 === 0 && q.s !== p.s) c += 2.4
    if (!change && q.b === p.b && q.a === p.a && q.t === p.t && q.s === p.s) c += 1.2
    if (change) {
      c += CHANGE[p.chord][q.chord]
      const pos = slots[i].pos
      c += pos % 4 === 0 ? 0 : pos % 4 === 2 ? 1 : 4
    }
    const da = Math.abs(q.a - p.a)
    const dt = Math.abs(q.t - p.t)
    const db = Math.abs(q.b - p.b)
    c += da + dt + 0.5 * db
    for (const d of [da, dt]) {
      if (d > 4) c += d - 4
      if (d > 7) c += 4
    }
    if (db > 7 && db !== 12) c += (db - 7) * 0.7
    if (da === 0) c -= 0.25
    if (dt === 0) c -= 0.25
    // leading tone in V should rise to the tonic in inner voices when resolving to I
    if (p.chord === 4 && q.chord === 0) {
      if (p.a % 12 === leadingTone && q.a !== p.a + 1) c += 3
      if (p.t % 12 === leadingTone && q.t !== p.t + 1) c += 3
    }
    const ds = q.s - p.s
    const dbs = q.b - p.b
    if (ds !== 0 && dbs !== 0) {
      if (sign(ds) !== sign(dbs)) c -= 0.5
      else if (Math.abs(ds) > 2 && [0, 7].includes(Math.abs(q.s - q.b) % 12)) c += 4
    }
    return c
  }

  function nctAllowed(i: number): boolean {
    const sl = slots[i]
    if (i === 0 || i === last || sl.lineEnd || sl.pos % 4 === 0 || sl.dur > 2) return false
    if (slots[i - 1].line !== sl.line) return false
    return Math.abs(sop[i] - sop[i - 1]) <= 2 && Math.abs(sop[i + 1] - sop[i]) <= 2
  }

  const layers: Node[][] = []
  for (let i = 0; i < n; i++) {
    let cur: Node[] = []
    const cands = candidates(i)
    if (i === 0) {
      for (const c of cands) cur.push({ st: c.st, cost: c.cost + (c.st.chord === 0 ? 0 : 3), prev: -1 })
    } else {
      const prev = layers[i - 1]
      for (const c of cands) {
        let best = Infinity
        let bp = -1
        for (let pi = 0; pi < prev.length; pi++) {
          const p = prev[pi]
          const tc = transition(p.st, c.st, i)
          if (tc === Infinity) continue
          const v = p.cost + tc
          if (v < best) {
            best = v
            bp = pi
          }
        }
        if (bp >= 0) cur.push({ st: c.st, cost: best + c.cost, prev: bp })
      }
      if (nctAllowed(i)) {
        prev.forEach((p, pi) => {
          if (p.st.nct || chords[p.st.chord].pcs.includes(sop[i] % 12)) return
          const q: State = { ...p.st, s: sop[i], nct: true }
          if (q.a < q.s && q.s - q.a <= 12) cur.push({ st: q, cost: p.cost + 0.5, prev: pi })
        })
      }
    }
    if (cur.length === 0) return null
    cur.sort((x, y) => x.cost - y.cost)
    cur = cur.slice(0, KEEP_PER_LAYER)
    layers.push(cur)
  }

  let idx = 0
  const out: State[] = new Array(n)
  for (let i = n - 1; i >= 0; i--) {
    out[i] = layers[i][idx].st
    idx = layers[i][idx].prev
  }
  return {
    alto: out.map((s) => s.a),
    tenor: out.map((s) => s.t),
    bass: out.map((s) => s.b),
    chords: out.map((s) => s.chord),
    relaxed: !strict,
  }
}

export function harmonize(sop: number[], slots: Slot[], key: KeyName): HarmonizeResult {
  const res = run(sop, slots, key, true) ?? run(sop, slots, key, false)
  if (!res) throw new Error('Could not harmonize this melody')
  return res
}