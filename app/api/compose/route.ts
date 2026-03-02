// app/api/compose/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const theme: string = body.theme || ''
    const lyrics: string = body.lyrics || ''
    const language: string = body.language || 'english'
    const churchEvent: string = body.churchEvent || 'general'

    console.log('Compose request', { theme, language, churchEvent, hasLyrics: !!lyrics })

    if (!theme) {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 })
    }

    // If the OpenAI key is missing we'll return a simple mock ABC
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, returning mock ABC')
      const mock = `X:1
T:Mock Hymn
M:4/4
K:C
|C C C C|
`
      return NextResponse.json({ abc: mock })
    }

    const prompt = `Generate a simple SATB hymn arrangement in ABC notation.
- Use four voices labeled [V:1] (Soprano), [V:2] (Alto), [V:3] (Tenor), [V:4] (Bass).
- Write the melody and harmony; each voice may contain lyrics if appropriate.
- Keep the style suitable for congregational worship; 4/4 time is fine unless you prefer otherwise.
- Do not include any explanatory text, only the raw ABC notation starting with an X: header.

Theme: ${theme}
Language: ${language}
Occasion: ${churchEvent}

Lyrics:
${lyrics}`

    console.log('Sending prompt to OpenAI', prompt.slice(0, 300))

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert choral composer familiar with ABC music notation. Output valid ABC for SATB arrangements.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })

      let abc: string = completion.choices[0].message.content || ''
      // strip ``` wrappers if any
      abc = abc.replace(/```abc\n?/, '').replace(/```/g, '').trim()

      console.log('AI returned ABC length', abc.length)
      return NextResponse.json({ abc })
    } catch (err: any) {
      console.error('Compose AI error', err)
      if (err.code === 'insufficient_quota' || err.status === 429) {
        console.warn('OpenAI quota exceeded while composing, returning mock ABC')
        const mock = `X:1
T:Mock Hymn
M:4/4
K:C
|C C C C|
`
        return NextResponse.json({ abc: mock, note: 'Generated with mock data (quota)' })
      }
      return NextResponse.json({ error: 'Failed to generate ABC' }, { status: 500 })
    }
  } catch (error) {
    console.error('Compose API error:', error)
    return NextResponse.json({ error: 'Failed to generate ABC' }, { status: 500 })
  }
}
