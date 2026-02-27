// app/api/generate-hymn/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  // declare these here so they can be referenced in the catch block
  // initialize with safe defaults to ensure they're defined in the catch block
  let theme: string = ''
  let language: string = 'english'
  let churchEvent: string = 'general'

  try {
    const body = await request.json()
    theme = body.theme || ''
    language = body.language || 'english'
    churchEvent = body.churchEvent || 'general'

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI key exists
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, using mock data')
      return generateMockResponse(theme, language, churchEvent)
    }

    // Generate with real AI
    const { title, lyrics } = await generateWithOpenAI(theme, language, churchEvent)

    return NextResponse.json({
      title,
      lyrics,
      language,
      theme,
      churchEvent
    })
  } catch (error: any) {
    console.error('Hymn generation error:', error)
    
    // Fallback to mock if AI fails
    if (error.code === 'insufficient_quota' || error.status === 429) {
      console.warn('OpenAI quota exceeded, using mock data')
      return generateMockResponse(theme, language, churchEvent)
    }
    
    return NextResponse.json(
      { error: 'Failed to generate hymn' },
      { status: 500 }
    )
  }
}

async function generateWithOpenAI(
  theme: string, 
  language: string, 
  event: string
): Promise<{ title: string; lyrics: string }> {
  
  const languageInstructions: Record<string, string> = {
    english: 'in English',
    igbo: 'in Igbo language (Nigerian indigenous language)',
    yoruba: 'in Yoruba language (Nigerian indigenous language)',
    hausa: 'in Hausa language (Nigerian indigenous language)'
  }

  const eventContext = event !== 'general' 
    ? `This hymn is for ${event}. Include appropriate biblical references and themes for this occasion.`
    : ''

  const prompt = `Create a Christian hymn ${languageInstructions[language]} with these specifications:

Theme: ${theme}
Occasion: ${event}
${eventContext}

Requirements:
- Write exactly 4 verses
- Each verse must have exactly 4 lines
- Traditional church hymn structure (AABB or ABAB rhyme scheme)
- Appropriate for congregational worship
- Biblical and theologically sound
- Use simple, singable language
- Include themes of faith, hope, and God's love
- Make it culturally appropriate for African church context

Format:
Verse 1:
[line 1]
[line 2]
[line 3]
[line 4]

Verse 2:
[continue same pattern]

Important: If writing in Igbo, Yoruba, or Hausa, use proper diacritical marks and ensure correct grammar.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cheaper and faster than gpt-4
    messages: [
      {
        role: 'system',
        content: 'You are a Christian hymn writer with deep knowledge of African languages and church music traditions. You create meaningful, biblically-based hymns suitable for worship.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.8,
    max_tokens: 1000
  })

  const lyrics = completion.choices[0].message.content || ''
  
  // Generate title
  const titlePrompt = `Create a short, meaningful title (3-6 words) for this hymn about "${theme}" for ${event}. Reply with ONLY the title, nothing else.`
  
  const titleCompletion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: titlePrompt }],
    temperature: 0.7,
    max_tokens: 20
  })

  const title = titleCompletion.choices[0].message.content?.trim() || generateMockTitle(theme, event)

  return { title, lyrics }
}

// Fallback mock data
function generateMockResponse(theme: string, language: string, event: string) {
  const title = generateMockTitle(theme, event)
  const lyrics = getMockLyrics(language)
  
  return NextResponse.json({
    title,
    lyrics,
    language,
    theme,
    churchEvent: event,
    note: 'Generated with mock data (AI unavailable)'
  })
}

function generateMockTitle(theme: string, event: string): string {
  const eventTitles: Record<string, string> = {
    christmas: 'A Christmas Carol of Joy',
    easter: 'Risen Lord, Our Victory',
    lent: 'In Humility We Seek',
    advent: 'Come, Emmanuel',
    pentecost: 'Spirit of the Living God',
    general: 'Hymn of Praise'
  }
  return eventTitles[event] || theme.split(' ').slice(0, 4).join(' ')
}

function getMockLyrics(language: string): string {
  const mockLyrics: Record<string, string> = {
    english: `Verse 1:
O Lord, our God, how great Thou art,
Your love flows from a gracious heart,
In every season, every day,
You guide us on our homeward way.

Verse 2:
When troubles come and storms arise,
We lift our hearts unto the skies,
Your mercy covers like the dawn,
In You our hope is firmly drawn.

Verse 3:
Through valleys deep and mountains high,
Your faithful hand is ever nigh,
In joy and sorrow, pain and praise,
We sing Your glory all our days.

Verse 4:
Now join together, voices raise,
In harmony we sing Your praise,
Forever more our song shall be,
O Lord, we worship, we are free!`,

    igbo: `Nkeji 1:
Chineke anyi, I di ukwu nke ukwu,
I huru anyi n'anya mgbe nile,
N'oge obula, ubochi obula,
I na-edu anyi n'uzo ezi okwu.

Nkeji 2:
Mgbe nsogbu bia, oké ifufe,
Anyi na-ebuli obi anyi elu,
Ebere Gi di ka chi owuwa anyanwu,
Na Gi ka olile anyi di siri ike.

Nkeji 3:
N'akuku ugwu na ndagwurugwu,
Aka Gi di nso mgbe nile,
N'onu, n'iru ihe, n'otuto,
Anyi na-eto Gi ubochi nile.

Nkeji 4:
Jikota onu, ebulie olu,
N'otu obi anyi na-eto Gi,
Rue mgbe ebighebi nke ebighebi,
Chineke, anyi na-efe Gi n'udo!`,

    yoruba: `Ẹsẹ 1:
Oluwa wa, O tobi ju gbogbo lọ,
Ifẹ Re nla julọ lailai,
Ni gbogbo akoko, gbogbo ọjọ,
O nto wa ni ọna ododo.

Ẹsẹ 2:
Nigbati wahala ba de tan,
A gbe okan wa soke si ọrun,
Aanu Re dabi ilẹ owurọ,
Ninu Re ni ireti wa wa.

Ẹsẹ 3:
Larin afonifoji ati oke nla,
Ọwọ Re wa pẹlu wa nigbagbogbo,
Ninu ayo ati ibanujẹ,
A nkorin iyin Re lojoojumọ.

Ẹsẹ 4:
Ẹ jọ wọn papọ, ẹ gbe ohun soke,
Lapapọ a nyin O loga pupo,
Titi lailai orin wa yoo jẹ,
Oluwa, a nsin O, a ni ominira!`,

    hausa: `Aya 1:
Ya Ubangiji, Kai babba ne sosai,
Ƙaunarka ta cika zukatanmu,
A kowane lokaci, kowace rana,
Kana jagorantar mu zuwa gida.

Aya 2:
Lokacin da matsaloli suka zo,
Muna ɗaga zukatanmu zuwa sama,
Jinƙanka ya rufe kamar safiya,
A cikin Ka ne begenmu yake.

Aya 3:
Ta cikin kwaruruka da duwatsu manya,
Hannunka yana kusa kullum,
Cikin farin ciki da baƙin ciki,
Muna rera yabonKa kullum.

Aya 4:
Ku haɗu tare, ku ɗaga murya,
Cikin haɗin gwiwa muna yabonKa,
Har abada waƙarmu zata kasance,
Ya Ubangiji, muna bauta muna da 'yanci!`
  }

  return mockLyrics[language] || mockLyrics.english
}