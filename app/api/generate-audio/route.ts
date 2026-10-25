// app/api/generate-audio/route.ts
// Reads a hymn's words aloud (text-to-speech). It is the lyrics, not the tune.
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { auth } from '@/lib/auth/server'
import { AI_NOT_CONFIGURED, aiErrorResponse } from '@/lib/ai/errors'
import { limitMessage, releaseUsage, reserveUsage, type Reservation } from '@/lib/usage'

type Voice = 'alloy' | 'echo' | 'nova' | 'shimmer'

const VOICES: Record<string, Voice> = {
  english: 'nova',
  igbo: 'alloy',
  yoruba: 'shimmer',
  hausa: 'echo',
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Please sign in to hear the words read aloud.' }, { status: 401 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(AI_NOT_CONFIGURED, { status: 503 })
  }

  let body: { lyrics?: unknown; language?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const lyrics = typeof body.lyrics === 'string' ? body.lyrics.trim() : ''
  if (!lyrics) return NextResponse.json({ error: 'There are no lyrics to read.' }, { status: 400 })
  if (lyrics.length > 3000) return NextResponse.json({ error: 'These lyrics are too long to read aloud.' }, { status: 413 })

  let reservation: Reservation
  try {
    reservation = await reserveUsage(session.user.id, 'audio')
  } catch (e) {
    console.error('Usage tracking failed (has migration 002 been run?):', e)
    return NextResponse.json({ error: 'The service is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }
  if (!reservation.ok) {
    return NextResponse.json({ error: limitMessage('audio', reservation.limit), code: 'rate_limited' }, { status: 429 })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: VOICES[String(body.language)] ?? 'nova',
      input: lyrics,
      speed: 0.9,
    })
    const buffer = Buffer.from(await mp3.arrayBuffer())
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': 'attachment; filename="hymn.mp3"',
      },
    })
  } catch (error) {
    await releaseUsage(reservation.id)
    return aiErrorResponse(error)
  }
}