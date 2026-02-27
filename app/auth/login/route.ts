import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const form = await request.formData()
  const email = form.get('email') as string
  const password = form.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    // Redirect back to login with an error message
    const url = new URL('/login', request.url)
    url.searchParams.set('error', error?.message || 'Login failed')
    return NextResponse.redirect(url)
  }

  // successful login; cookies are automatically set by createClient
  return NextResponse.redirect(new URL('/dashboard', request.url))
}