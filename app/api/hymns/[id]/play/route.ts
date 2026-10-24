// app/api/hymns/[id]/play/route.ts
// Counts one play of a PUBLIC hymn. Called when a visitor (not the owner) starts playback.
import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const rows = await sql`
    update hymns set plays_count = plays_count + 1 where id = ${id} and is_public = true returning plays_count
  `
  return NextResponse.json({ ok: rows.length > 0 })
}