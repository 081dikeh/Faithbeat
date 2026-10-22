// lib/music/abc.ts
import { KeyName, midiToAbc } from './types'
import type { Slot } from './rhythm'

export interface AbcInput {
  title: string
  key: KeyName
  tempo: number
  slots: Slot[]
  voices: { S: number[]; A: number[]; T: number[]; B: number[] }
  /** lyric[verse][line] -> ABC w: fragment */
  lyric: string[][]
}

const dur = (d: number) => (d === 1 ? '' : String(d))

function voiceLines(key: KeyName, slots: Slot[], midi: number[], fromLine: number, toLine: number, final: boolean): string {
  let out = ''
  let curBar = -1
  let inBeam = false
  slots.forEach((sl, i) => {
    if (sl.line < fromLine || sl.line > toLine) return
    if (curBar !== -1 && sl.bar !== curBar) {
      out += ' | '
      inBeam = false
    }
    curBar = sl.bar
    const note = midiToAbc(key, midi[i]) + dur(sl.dur)
    if (sl.dur === 1) {
      out += (inBeam ? '' : out.endsWith(' ') || out === '' ? '' : ' ') + note
      inBeam = true
    } else {
      out += (out === '' || out.endsWith(' ') ? '' : ' ') + note
      inBeam = false
    }
  })
  return out.trim() + (final ? ' |]' : ' |')
}

export function buildAbc(inp: AbcInput): string {
  const lines = inp.slots[inp.slots.length - 1].line + 1
  const title = inp.title.replace(/[\r\n]+/g, ' ').trim() || 'Untitled Hymn'
  const head = [
    'X:1',
    `T:${title}`,
    'M:4/4',
    'L:1/8',
    `Q:1/4=${Math.round(inp.tempo)}`,
    '%%score {(S A) (T B)}',
    'V:S clef=treble name="S" snm="S" stem=up',
    'V:A clef=treble name="A" snm="A" stem=down',
    'V:T clef=bass name="T" snm="T" stem=up',
    'V:B clef=bass name="B" snm="B" stem=down',
    `K:${inp.key}`,
  ]
  const body: string[] = []
  for (let from = 0; from < lines; from += 2) {
    const to = Math.min(from + 1, lines - 1)
    const final = to === lines - 1
    ;(['S', 'A', 'T', 'B'] as const).forEach((v) => {
      body.push(`V:${v}`)
      body.push(voiceLines(inp.key, inp.slots, inp.voices[v], from, to, final))
      if (v === 'S') {
        inp.lyric.forEach((verse) => {
          const frag = verse.slice(from, to + 1).join(' ')
          body.push(`w: ${frag}`)
        })
      }
    })
  }
  return [...head, ...body].join('\n') + '\n'
}