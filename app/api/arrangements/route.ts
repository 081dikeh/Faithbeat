// app/api/arrangements/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { data: session } = await auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
    }

    const { hymnId, voices, language, theme, timeSignature, status } = await request.json()

    const [arrangement] = await sql`
      insert into satb_arrangements (hymn_id, voices, language, theme, time_signature, status)
      values (${hymnId ?? null}, ${JSON.stringify(voices)}, ${language}, ${theme}, ${timeSignature ?? '4/4'}, ${status ?? 'ready'})
      returning *
    `

    return NextResponse.json({ arrangement, success: true })
  } catch (error: any) {
    console.error('Save arrangement error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save arrangement' }, { status: 500 })
  }
}
