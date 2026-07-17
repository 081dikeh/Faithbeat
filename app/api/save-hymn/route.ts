// app/api/save-hymn/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { data: session } = await auth.getSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { title, lyrics, theme, description, language, churchEvent } = await request.json()

    if (!title || !lyrics) {
      return NextResponse.json(
        { error: 'Title and lyrics are required' },
        { status: 400 }
      )
    }

    const [hymn] = await sql`
      insert into hymns (user_id, title, lyrics, theme, description, language, church_event, is_public)
      values (${session.user.id}, ${title}, ${lyrics}, ${theme}, ${description}, ${language}, ${churchEvent}, false)
      returning *
    `

    return NextResponse.json({ hymn, success: true })
  } catch (error: any) {
    console.error('Save hymn error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save hymn' },
      { status: 500 }
    )
  }
}
