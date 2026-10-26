// lib/ai/errors.ts
import { NextResponse } from 'next/server'

/** Turn an OpenAI/SDK failure into an honest, user-facing error (never fake content). */
export function aiErrorResponse(error: unknown) {
  const e = error as { status?: number; code?: string; type?: string; message?: string } | null

  // Out of credit: a billing problem on the OpenAI account, not a temporary busy signal.
  if (e?.code === 'insufficient_quota' || e?.type === 'insufficient_quota') {
    console.error(
      'OpenAI reports insufficient_quota: the account behind OPENAI_API_KEY has no credit left. ' +
        'Add credit at https://platform.openai.com/settings/organization/billing (API credit is separate from a ChatGPT subscription).'
    )
    return NextResponse.json(
      {
        error:
          'Hymns cannot be written right now because the AI account behind Faithbeat has run out of credit. If you run this site, add credit in your OpenAI billing settings.',
        code: 'ai_out_of_credit',
      },
      { status: 503 }
    )
  }

  // A real rate limit: too many requests in a short time. Waiting fixes it.
  if (e?.status === 429) {
    console.error('OpenAI rate limit (429):', e.message ?? error)
    return NextResponse.json(
      { error: 'The AI service is busy right now. Wait a minute and try again.', code: 'ai_busy' },
      { status: 503 }
    )
  }

  if (e?.status === 401) {
    console.error('OpenAI rejected the API key (401). Check OPENAI_API_KEY in .env.local and restart the server.')
    return NextResponse.json(
      { error: 'The AI service is not configured correctly on the server.', code: 'ai_misconfigured' },
      { status: 500 }
    )
  }

  console.error('AI request failed:', error)
  return NextResponse.json(
    { error: 'Something went wrong while generating. Please try again.', code: 'ai_failed' },
    { status: 502 }
  )
}

export const AI_NOT_CONFIGURED = {
  error: 'AI generation is not configured on this server.',
  code: 'ai_not_configured',
} as const