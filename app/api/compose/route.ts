// app/api/compose/route.ts
// Turns a saved hymn's lyrics into a validated SATB arrangement (ABC + voices)
// and stores it. The model proposes the melody; code guarantees it is singable.
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'
import { proposeContour } from '@/lib/ai/melody'
import { analyzeLyrics } from '@/lib/music/lyrics'
import { composeHymn } from '@/lib/music/compose'
import { isKeyName, normalizeLanguage } from '@/lib/music/types'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const maxDuration = 60

export async function POST(request: Request) {
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Please sign in to compose music.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const hymnId = typeof body.hymnId === 'string' ? body.hymnId : ''
  if (!UUID.test(hymnId)) {
    return NextResponse.json({ error: 'A valid hymn is required.' }, { status: 400 })
  }

  const [hymn] = (await sql`
    select id, title, lyrics, language, theme, description, church_event
    from hymns where id = ${hymnId} and user_id = ${session.user.id}
  `) as {
    id: string; title: string; lyrics: string; language: string
    theme: string | null; description: string | null; church_event: string | null
  }[]
  if (!hymn) return NextResponse.json({ error: 'Hymn not found.' }, { status: 404 })

  const language = normalizeLanguage(hymn.language)
  const warnings: string[] = []

  let analysis
  try {
    analysis = analyzeLyrics(hymn.lyrics, language)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'These lyrics cannot be set to music.' }, { status: 422 })
  }

  let contour: unknown
  let tempo: number | undefined
  let key = isKeyName(body.key) ? body.key : undefined
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const proposal = await proposeContour(openai, {
        title: hymn.title,
        description: hymn.description || hymn.theme || '',
        event: hymn.church_event || 'general',
        language,
        firstVerse: analysis.verses[0],
        counts: analysis.counts,
      })
      if (proposal) {
        contour = proposal.contour
        tempo = proposal.tempo
        if (!key && isKeyName(proposal.key)) key = proposal.key
      }
    } catch (e) {
      console.error('Melody proposal failed, falling back to algorithmic melody:', e)
      warnings.push('The AI service was unavailable, so the melody was generated algorithmically.')
    }
  } else {
    warnings.push('AI is not configured, so the melody was generated algorithmically.')
  }

  let result
  try {
    result = composeHymn({ title: hymn.title, lyrics: hymn.lyrics, language, key, tempo, contour })
  } catch (e) {
    console.error('Compose failed:', e)
    return NextResponse.json({ error: 'Could not compose music for these lyrics.' }, { status: 422 })
  }
  result.warnings.unshift(...warnings)

  const voices = JSON.stringify(result.voices)
  const keySig = `${result.key} major`
  const [existing] = (await sql`
    select id from satb_arrangements where hymn_id = ${hymnId} order by created_at desc limit 1
  `) as { id: string }[]

  if (existing) {
    await sql`
      update satb_arrangements set
        language = ${language}, theme = ${hymn.theme}, status = 'ready', key_signature = ${keySig},
        tempo_bpm = ${result.tempo}, time_signature = ${result.timeSignature}, voices = ${voices}::jsonb,
        abc_notation = ${result.abc}, error_message = null
      where id = ${existing.id}
    `
  } else {
    await sql`
      insert into satb_arrangements
        (hymn_id, language, theme, status, key_signature, tempo_bpm, time_signature, voices, abc_notation)
      values
        (${hymnId}, ${language}, ${hymn.theme}, 'ready', ${keySig}, ${result.tempo}, ${result.timeSignature}, ${voices}::jsonb, ${result.abc})
    `
  }

  return NextResponse.json({
    abc: result.abc,
    key: result.key,
    tempo: result.tempo,
    source: result.source,
    warnings: result.warnings,
  })
}