// app/api/save-hymn/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    
    // Create Supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth check:', { user: user?.id, authError }) // Debug log
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { title, lyrics, theme, language, churchEvent } = await request.json()

    if (!title || !lyrics) {
      return NextResponse.json(
        { error: 'Title and lyrics are required' },
        { status: 400 }
      )
    }

    // Save hymn to database
    const { data, error } = await supabase
      .from('hymns')
      .insert([
        {
          user_id: user.id,
          title,
          lyrics,
          theme,
          language,
          church_event: churchEvent,
          is_public: false
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save hymn: ' + error.message },
        { status: 500 }
      )
    }

    console.log('Hymn saved successfully:', data.id) // Debug log

    return NextResponse.json({ hymn: data, success: true })
  } catch (error: any) {
    console.error('Save hymn error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save hymn' },
      { status: 500 }
    )
  }
}