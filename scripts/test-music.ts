// Run: npx tsx scripts/test-music.ts
// Independent checks of the music engine (does not reuse the harmonizer's own rule code).
import abcjs from 'abcjs'
import { composeHymn } from '../lib/music/compose'
import { proposeContour } from '../lib/ai/melody'
import { syllabifyLine } from '../lib/music/syllables'
import { KEY_NAMES, Language, MAJOR_SCALE, keyPc } from '../lib/music/types'

const SAMPLES: Record<Language, string> = {
  english: `Verse 1:
O Lord, our God, how great Thou art,
Your love flows from a gracious heart,
In every season, every day,
You guide us on our homeward way.

Verse 2:
When troubles come and storms arise,
We lift our hearts unto the skies,
Your mercy covers like the dawn,
In You our hope is firmly drawn.`,
  igbo: `Nkeji 1:
Chineke anyi, I di ukwu nke ukwu,
I huru anyi n'anya mgbe nile,
N'oge obula, ubochi obula,
I na-edu anyi n'uzo ezi okwu.

Nkeji 2:
Mgbe nsogbu bia, oké ifufe,
Anyi na-ebuli obi anyi elu,
Ebere Gi di ka chi owuwa anyanwu,
Na Gi ka olile anyi di siri ike.`,
  yoruba: `Ẹsẹ 1:
Oluwa wa, O tobi ju gbogbo lọ,
Ifẹ Re nla julọ lailai,
Ni gbogbo akoko, gbogbo ọjọ,
O nto wa ni ọna ododo.`,
  hausa: `Aya 1:
Ya Ubangiji, Kai babba ne sosai,
Ƙaunarka ta cika zukatanmu,
A kowane lokaci, kowace rana,
Kana jagorantar mu zuwa gida.`,
}

let failures = 0
const fail = (m: string) => { failures++; console.error('  FAIL:', m) }

// syllable sanity
const syl = (s: string, l: Language) => syllabifyLine(s, l).map((x) => x.text + (x.wordEnd ? ' ' : '-')).join('').trim()
console.log('syllables:')
for (const [s, l] of [
  ['How great Thou art, hallelujah', 'english'],
  ['gracious mercy covers like the dawn', 'english'],
  ['Alleluia, glorious singing', 'english'],
  ["I huru anyi n'anya mgbe nile", 'igbo'],
  ['A nkorin iyin Re lojoojumọ', 'yoruba'],
  ['Ya Ubangiji, Kai babba ne sosai', 'hausa'],
] as [string, Language][]) console.log('  ', syl(s, l))

const keyScale = (k: (typeof KEY_NAMES)[number]) => new Set(MAJOR_SCALE.map((x) => (keyPc(k) + x) % 12))
const sign = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0)
let total = 0
let relaxedCount = 0
let maxMs = 0

for (const lang of Object.keys(SAMPLES) as Language[]) {
  for (const key of KEY_NAMES) {
    for (let variant = 0; variant < 6; variant++) {
      const title = `T${variant}`
      const t0 = Date.now()
      const r = composeHymn({ title, lyrics: SAMPLES[lang] + '\n'.repeat(variant % 2), language: lang, key })
      maxMs = Math.max(maxMs, Date.now() - t0)
      total++
      const tag = `${lang}/${key}/${variant}`
      if (r.warnings.some((w) => w.includes('relaxed'))) relaxedCount++
      const [S, A, T, B] = r.voices.map((v) => v.notes.map((n) => n.midi))
      const n = S.length
      if (![A, T, B].every((v) => v.length === n)) fail(`${tag} voice lengths`)
      const scale = keyScale(key)
      for (let i = 0; i < n; i++) {
        if (S[i] < 60 || S[i] > 79) fail(`${tag} soprano range @${i}: ${S[i]}`)
        if (A[i] < 55 || A[i] > 74) fail(`${tag} alto range @${i}`)
        if (T[i] < 48 || T[i] > 67) fail(`${tag} tenor range @${i}`)
        if (B[i] < 40 || B[i] > 62) fail(`${tag} bass range @${i}`)
        if (!(S[i] > A[i] && A[i] > T[i] && T[i] > B[i])) fail(`${tag} crossing @${i}`)
        if (S[i] - A[i] > 12 || A[i] - T[i] > 12) fail(`${tag} spacing @${i}`)
        for (const v of [S, A, T, B]) if (!scale.has(v[i] % 12)) fail(`${tag} non-diatonic @${i}`)
        if (i > 0 && !r.warnings.some((w) => w.includes('relaxed'))) {
          const p = [S[i - 1], A[i - 1], T[i - 1], B[i - 1]]
          const q = [S[i], A[i], T[i], B[i]]
          for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
            const ip = Math.abs(p[a] - p[b]) % 12, iq = Math.abs(q[a] - q[b]) % 12
            if (ip === iq && (ip === 0 || ip === 7) && p[a] !== q[a] && p[b] !== q[b] && sign(q[a] - p[a]) === sign(q[b] - p[b]))
              fail(`${tag} parallel ${ip === 0 ? '8ve' : '5th'} voices ${a}-${b} @${i}`)
          }
        }
      }
      if (r.chords[n - 1] !== 'I') fail(`${tag} final chord ${r.chords[n - 1]}`)
      if (B[n - 1] % 12 !== keyPc(key)) fail(`${tag} final bass not tonic`)
      if (S[n - 1] % 12 !== keyPc(key)) fail(`${tag} final soprano not tonic`)
      {
        const tune = abcjs.parseOnly(r.abc)[0]
        if (tune.warnings && tune.warnings.length) fail(`${tag} abcjs warnings: ${tune.warnings.join(' | ').replace(/<[^>]+>/g, '')}`)
        if (tune.lines && tune.lines.length < 1) fail(`${tag} abcjs produced no lines`)
      }
    }
  }
}
console.log(`\n${total} hymns composed, max ${maxMs} ms each, ${relaxedCount} needed relaxed rules`)
console.log('abcjs parse check: on')

// ---- untrusted AI melody input ----
console.log('\nuntrusted AI melody tests:')
const sloppy: [string, unknown][] = [
  ['wrong line lengths', [[1, 2, 3], [5], [1, 3, 5, 6, 5, 3, 1, 2, 3, 4, 5, 6], [2, 1]]],
  ['out-of-range + floats + strings', [[0, 9, 15, -3, '4', 2.7, 99, 1], [5, 5, 5, 5, 5, 5, 5, 5], [1, 8, 1, 8, 1, 8, 1, 8], ['x', 1, 2, 3, 4, 5, 6, 7]]],
  ['monotone (rejected -> algorithmic)', [[3, 3, 3, 3, 3, 3, 3, 3], [3, 3, 3, 3, 3, 3, 3, 3], [3, 3, 3, 3, 3, 3, 3, 3], [3, 3, 3, 3, 3, 3, 3, 3]]],
  ['wrong number of lines', [[1, 2, 3, 4, 5, 6, 7, 8]]],
  ['not an array', 'banana'],
  ['null', null],
]
for (const [name, contour] of sloppy) {
  try {
    const r = composeHymn({ title: 'AI', lyrics: SAMPLES.english, language: 'english', key: 'G', contour })
    const ok = r.voices.length === 4 && r.chords[r.chords.length - 1] === 'I' && abcjs.parseOnly(r.abc)[0].warnings === undefined
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name} -> source=${r.source}${r.warnings.length ? ' | ' + r.warnings[0] : ''}`)
    if (!ok) fail(`sloppy contour: ${name}`)
  } catch (e) {
    fail(`sloppy contour threw: ${name}: ${(e as Error).message}`)
  }
}

async function fakeOpenAI(content: string) {
  const fake = { chat: { completions: { create: async () => ({ choices: [{ message: { content } }] }) } } }
  return proposeContour(fake as never, { title: 't', description: 'd', event: 'general', language: 'english', firstVerse: ['a', 'b', 'c', 'd'], counts: [8, 8, 8, 8] })
}
async function llmParsing() {
  const good = await fakeOpenAI(JSON.stringify({ key: 'F', tempo: 72, lines: [[1, 2, 3, 3, 4, 5, 5, 3], [5, 5, 6, 5, 4, 3, 2, 5], [1, 2, 3, 3, 4, 5, 6, 5], [5, 4, 3, 2, 3, 2, 2, 1]] }))
  if (!good || good.key !== 'F' || good.tempo !== 72) fail('proposeContour did not parse valid JSON')
  const bad = await fakeOpenAI('Sure! Here is your melody: 1 2 3')
  if (bad !== null) fail('proposeContour should return null for non-JSON')
  console.log('  ok   proposeContour: valid JSON parsed, prose rejected')
}
llmParsing().then(() => {
if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1) }
console.log('ALL CHECKS PASSED')
const demo = composeHymn({ title: 'How Great Thou Art', lyrics: SAMPLES.english, language: 'english', key: 'G' })
console.log('\n--- sample ABC ---\n' + demo.abc)
console.log('chords:', demo.chords.join(' '))
})