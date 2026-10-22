// lib/music/rhythm.ts
// 4/4, L:1/8. Each lyric line becomes 2+ full bars; one note per syllable,
// notes never cross a barline, and each line ends on a longer note.
export interface Slot {
  dur: number // eighths
  pos: number // eighths from start of bar
  bar: number
  line: number
  lineEnd: boolean
}

const MID: Record<number, number[]> = {
  1: [8], 2: [4, 4], 3: [2, 2, 4], 4: [2, 2, 2, 2], 5: [2, 2, 2, 1, 1], 6: [2, 2, 1, 1, 1, 1],
}
const FINAL: Record<number, number[]> = {
  1: [8], 2: [4, 4], 3: [2, 2, 4], 4: [2, 2, 2, 2], 5: [2, 1, 1, 2, 2], 6: [1, 1, 1, 1, 2, 2],
}

export function layoutRhythm(counts: number[]): Slot[] {
  const slots: Slot[] = []
  let bar = 0
  counts.forEach((n, line) => {
    const bars = Math.min(Math.max(2, Math.ceil(n / 6)), n)
    let rem = n
    for (let k = 0; k < bars; k++) {
      const m = Math.ceil(rem / (bars - k))
      rem -= m
      const pattern = (k === bars - 1 ? FINAL : MID)[m]
      let pos = 0
      pattern.forEach((dur) => {
        slots.push({ dur, pos, bar, line, lineEnd: false })
        pos += dur
      })
      bar++
    }
    slots[slots.length - 1].lineEnd = true
  })
  return slots
}