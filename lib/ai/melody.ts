// lib/ai/melody.ts
// Ask the model for a melody *contour* (scale degrees per syllable). The result
// is untrusted: lib/music/melody.ts validates and repairs it before use.
import type OpenAI from 'openai'
import { KEY_NAMES } from '@/lib/music/types'

export interface MelodyProposal {
  contour: unknown
  tempo?: number
  key?: string
}

export async function proposeContour(
  openai: OpenAI,
  args: { title: string; description: string; event: string; language: string; firstVerse: string[]; counts: number[] }
): Promise<MelodyProposal | null> {
  const lineSpec = args.counts
    .map((n, i) => `Line ${i + 1} (${n} notes): "${args.firstVerse[i] ?? ''}"`)
    .join('\n')

  const prompt = `Compose the tune for a congregational hymn.

Title: ${args.title}
Subject: ${args.description || 'general worship'}
Occasion: ${args.event}
Language of the words: ${args.language}

The same tune is sung to every verse. Each line has exactly one note per syllable:
${lineSpec}

Write the melody as MAJOR-scale degrees: 1 = tonic, 2 = supertonic ... 7 = leading tone, 8 = the tonic an octave higher.
Rules:
- lines[i] must contain exactly the number of notes given for line i, each an integer from 1 to 8
- move mostly by step; leaps larger than a third should be rare and never larger than a fifth
- line 1 starts on 1, 3 or 5; the second-to-last line ends on 5 (a half-close); the last line ends on 1, approached from 2
- lines 1 and 3 should share a recognisable motif; place the highest note (usually 5, 6 or 8) near the end of line 3
- the mood should fit the subject (joyful = brighter, faster; solemn = slower, lower)
- choose the key from: ${KEY_NAMES.join(', ')}; tempo between 66 and 100 BPM

Reply with ONLY JSON: {"key":"G","tempo":80,"lines":[[...],[...],...]}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a skilled hymn-tune composer. You reply with JSON only.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.9,
    max_tokens: 700,
  })

  try {
    const parsed = JSON.parse(completion.choices[0]?.message?.content ?? '')
    if (!parsed || typeof parsed !== 'object') return null
    return {
      contour: (parsed as { lines?: unknown }).lines,
      tempo: typeof (parsed as { tempo?: unknown }).tempo === 'number' ? (parsed as { tempo: number }).tempo : undefined,
      key: typeof (parsed as { key?: unknown }).key === 'string' ? (parsed as { key: string }).key : undefined,
    }
  } catch {
    return null
  }
}