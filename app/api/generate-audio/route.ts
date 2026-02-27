// app/api/generate-audio/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { lyrics, language } = await request.json()

    if (!lyrics) {
      return NextResponse.json(
        { error: 'Lyrics are required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Choose voice based on language
    const voice = selectVoice(language)

    // Generate audio using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // or 'tts-1-hd' for higher quality
      voice: voice,
      input: lyrics,
      speed: 0.9 // Slightly slower for hymn singing
    })

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': 'attachment; filename="hymn.mp3"'
      }
    })

  } catch (error: any) {
    console.error('Audio generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    )
  }
}

function selectVoice(language: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
  // OpenAI TTS voices (choose based on preference)
  const voiceMap: Record<string, any> = {
    english: 'nova',    // Female, warm
    igbo: 'alloy',      // Neutral
    yoruba: 'shimmer',  // Female, clear
    hausa: 'echo'       // Male, deep
  }
  
  return voiceMap[language] || 'nova'
}