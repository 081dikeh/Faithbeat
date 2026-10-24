// app/api/generate-hymn/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/lib/auth/server'
import { AI_NOT_CONFIGURED, aiErrorResponse } from '@/lib/ai/errors'
import { parseLyrics } from '@/lib/music/lyrics'
import { countSyllables } from '@/lib/music/syllables'
import { Language, normalizeLanguage } from '@/lib/music/types'
import { limitMessage, releaseUsage, reserveUsage, type Reservation } from '@/lib/usage'

const EVENTS = ['general', 'christmas', 'easter', 'lent', 'advent', 'pentecost']

const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  english: 'in English',
  igbo: 'in Igbo language (Nigerian indigenous language)',
  yoruba: 'in Yoruba language (Nigerian indigenous language)',
  hausa: 'in Hausa language (Nigerian indigenous language)',
}

const SYSTEM =
  'You are a Christian hymn writer with deep knowledge of African languages and church music traditions. You write lyrics that are directly grounded in the specific description the user gives you, not generic filler.'

function buildPrompt(title: string, description: string, language: Language, event: string): string {
  const eventContext =
    event !== 'general' ? `This hymn is for ${event}. Include appropriate biblical references and themes for this occasion.` : ''
  const titleLine = title
    ? `The hymn's title is "${title}". Write lyrics that genuinely fit this title.`
    : 'No title was given; the lyrics should still be specific to the description.'
  return `Create a Christian hymn ${LANGUAGE_INSTRUCTIONS[language]} with these specifications:

${titleLine}

What the hymn should be about (in the user's own words): "${description}"
Occasion: ${event}
${eventContext}

Requirements:
- The lyrics must clearly reflect the specific description above, not just a generic theme
- Write exactly 4 verses of exactly 4 lines each
- The hymn will be set to ONE tune sung to every verse, so every verse must use the same syllable pattern: line 1 of every verse has the same number of syllables, line 2 of every verse has the same number, and so on. Aim for 8 syllables per line (about 6-10 is acceptable)
- Traditional church hymn structure (AABB or ABAB rhyme scheme)
- Appropriate for congregational worship; biblical and theologically sound
- Use simple, singable language, culturally appropriate for an African church context
- If writing in Igbo, Yoruba or Hausa, use proper diacritical marks and correct grammar

Format exactly like this, with a blank line between verses and nothing else:
Verse 1:
[line 1]
[line 2]
[line 3]
[line 4]

Verse 2:
...`
}

/** Returns a list of problems; empty means the lyrics are structurally sound and singable to one tune. */
function checkLyrics(lyrics: string, language: Language): { structure: string[]; meter: string[] } {
  const structure: string[] = []
  const meter: string[] = []
  const verses = parseLyrics(lyrics)
  if (verses.length !== 4) structure.push(`it has ${verses.length} verses instead of 4`)
  verses.forEach((v, i) => {
    if (v.length !== 4) structure.push(`verse ${i + 1} has ${v.length} lines instead of 4`)
  })
  if (structure.length) return { structure, meter }
  for (let j = 0; j < 4; j++) {
    const counts = verses.map((v) => countSyllables(v[j], language))
    if (Math.max(...counts) - Math.min(...counts) > 2) {
      meter.push(`line ${j + 1} has ${counts.join(' / ')} syllables across the four verses; these must match`)
    }
  }
  return { structure, meter }
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Please sign in to generate hymns.' }, { status: 401 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(AI_NOT_CONFIGURED, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const title = String(body.title ?? '').trim().slice(0, 120)
  const description = String(body.description ?? body.theme ?? '').trim().slice(0, 800)
  const language = normalizeLanguage(body.language)
  const event = EVENTS.includes(String(body.churchEvent)) ? String(body.churchEvent) : 'general'

  if (!description) {
    return NextResponse.json({ error: 'Please describe what the hymn should be about.' }, { status: 400 })
  }

  let reservation: Reservation
  try {
    reservation = await reserveUsage(session.user.id, 'hymn')
  } catch (e) {
    console.error('Usage tracking failed (has migration 002 been run?):', e)
    return NextResponse.json({ error: 'The service is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }
  if (!reservation.ok) {
    return NextResponse.json({ error: limitMessage('hymn', reservation.limit), code: 'rate_limited' }, { status: 429 })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: buildPrompt(title, description, language, event) },
    ]
    const ask = async () => {
      const c = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages, temperature: 0.8, max_tokens: 1200 })
      return (c.choices[0]?.message?.content ?? '').trim()
    }

    let lyrics = await ask()
    let check = checkLyrics(lyrics, language)
    if (check.structure.length || check.meter.length) {
      // one corrective retry that tells the model exactly what was wrong
      messages.push({ role: 'assistant', content: lyrics })
      messages.push({
        role: 'user',
        content: `That draft has problems: ${[...check.structure, ...check.meter].join('; ')}. Rewrite the whole hymn fixing them, keeping the same format and subject.`,
      })
      const retry = await ask()
      const retryCheck = checkLyrics(retry, language)
      if (retryCheck.structure.length === 0) {
        lyrics = retry
        check = retryCheck
      }
    }
    if (check.structure.length) {
      await releaseUsage(reservation.id)
      return NextResponse.json({ error: 'The generated hymn was malformed. Please try again.', code: 'ai_malformed' }, { status: 502 })
    }

    let finalTitle = title
    if (!finalTitle) {
      const t = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Create a short, meaningful hymn title (3-6 words) in ${language === 'english' ? 'English' : language} for a hymn about: "${description}" for ${event}. Reply with ONLY the title, nothing else.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 30,
      })
      finalTitle = (t.choices[0]?.message?.content ?? '').trim().replace(/^["“]|["”]$/g, '') || 'Untitled Hymn'
    }

    return NextResponse.json({
      title: finalTitle,
      lyrics,
      language,
      theme: description.split(' ').slice(0, 6).join(' '),
      description,
      churchEvent: event,
    })
  } catch (error) {
    await releaseUsage(reservation.id)
    return aiErrorResponse(error)
  }
}