// app/api/auth/session/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { session } = await request.json()

    // This helper wraps the incoming cookies and will update them
    // after we call `supabase.auth.setSession`.  In other words the
    // client posts the new session from the browser after successfully
    // signing in, and the server writes the corresponding auth cookies.
    const supabase = createRouteHandlerClient({ cookies })

    await supabase.auth.setSession(session)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}