// app/api/hymns/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: session } = await auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
    }

    const result = await sql`
      delete from hymns where id = ${id} and user_id = ${session.user.id}
      returning id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Hymn not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete hymn' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: session } = await auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 })
    }

    const body = await request.json()
    const title = body.title ?? null
    const lyrics = body.lyrics ?? null
    const isPublic = typeof body.is_public === 'boolean' ? body.is_public : null

    const [hymn] = await sql`
      update hymns set
        title = coalesce(${title}, title),
        lyrics = coalesce(${lyrics}, lyrics),
        is_public = coalesce(${isPublic}, is_public)
      where id = ${id} and user_id = ${session.user.id}
      returning *
    `

    if (!hymn) {
      return NextResponse.json({ error: 'Hymn not found' }, { status: 404 })
    }

    return NextResponse.json({ hymn, success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update hymn' }, { status: 500 })
  }
}
