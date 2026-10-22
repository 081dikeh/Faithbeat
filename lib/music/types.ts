// lib/music/types.ts
export type Language = 'english' | 'igbo' | 'yoruba' | 'hausa'
export const LANGUAGES: readonly Language[] = ['english', 'igbo', 'yoruba', 'hausa']

// Keys are limited to those where a soprano line built from scale degrees 1..8
// stays inside C4–G5, a comfortable congregational/choir range.
export type KeyName = 'C' | 'D' | 'Eb' | 'F' | 'G'
export const KEY_NAMES: readonly KeyName[] = ['C', 'D', 'Eb', 'F', 'G']

export const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11] as const
const KEYS: Record<KeyName, { pc: number; letter: number }> = {
  C: { pc: 0, letter: 0 },
  D: { pc: 2, letter: 1 },
  Eb: { pc: 3, letter: 2 },
  F: { pc: 5, letter: 3 },
  G: { pc: 7, letter: 4 },
}

export function isKeyName(v: unknown): v is KeyName {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(KEYS, v)
}

export function normalizeLanguage(v: unknown): Language {
  return typeof v === 'string' && (LANGUAGES as readonly string[]).includes(v) ? (v as Language) : 'english'
}

export function keyPc(k: KeyName): number {
  return KEYS[k].pc
}

/** Tonic of the key in the octave starting at middle C (C4 = 60). */
export function tonicMidi(k: KeyName): number {
  return 60 + KEYS[k].pc
}

/** MIDI note -> ABC note letter (+octave marks). Notes must be diatonic to the key. */
export function midiToAbc(key: KeyName, midi: number): string {
  const info = KEYS[key]
  const pc = ((midi % 12) + 12) % 12
  for (let i = 0; i < 7; i++) {
    const li = (info.letter + i) % 7
    const target = (info.pc + MAJOR_SCALE[i]) % 12
    if (target !== pc) continue
    const diff = target - NATURAL_PC[li]
    const acc = ((((diff + 6) % 12) + 12) % 12) - 6
    const oct = Math.floor((midi - acc) / 12) - 1
    const letter = LETTERS[li]
    if (oct >= 5) return letter.toLowerCase() + "'".repeat(oct - 5)
    return letter + ','.repeat(Math.max(0, 4 - oct))
  }
  throw new Error(`Note ${midi} is not diatonic to ${key} major`)
}