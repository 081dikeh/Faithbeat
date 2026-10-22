// lib/ai/errors.ts
import { NextResponse } from 'next/server'

/** Turn an OpenAI/SDK failure into an honest, user-facing error (never fake content). */
export function aiErrorResponse(error: unknown) {
  const e = error as { status?: number; code?: string } | null
  console.error('AI request failed:', error)
  if (e?.code === 'insufficient_quota' || e?.status === 429) {
    return NextResponse.json(
      { error: 'Generation is temporarily unavailable because the AI service is at capacity. Please try again in a little while.', code: 'ai_unavailable' },
      { status: 503 }
    )
  }
  if (e?.status === 401) {
    return NextResponse.json(
      { error: 'The AI service is not configured correctly on the server.', code: 'ai_misconfigured' },
      { status: 500 }
    )
  }
  return NextResponse.json(
    { error: 'Something went wrong while generating. Please try again.', code: 'ai_failed' },
    { status: 502 }
  )
}

export const AI_NOT_CONFIGURED = {
  error: 'AI generation is not configured on this server.',
  code: 'ai_not_configured',
} as const