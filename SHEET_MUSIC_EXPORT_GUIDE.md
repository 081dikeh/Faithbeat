// SHEET MUSIC EXPORT IMPLEMENTATION GUIDE
// For FaithBeat - AI Hymn Composer

// ============================================
// 1. BASIC INTEGRATION IN YOUR HYMN PAGE
// ============================================

// In app/hymn/[id]/page.tsx, update the import:
import HymnActions from '@/components/hymn-actions'

// Pass arrangement data:
export default async function HymnPage({ params }: { params: Promise<{ id: string }> }) {
// ... existing code ...

    // Fetch SATB arrangement if available
    const { data: arrangement } = await supabase
        .from('satb_arrangements')
        .select('*')
        .eq('hymn_id', id)
        .eq('status', 'ready')
        .single()

    return (
        <HymnActions
            hymn={hymn}
            arrangement={arrangement ? {
                voices: arrangement.voices,
                keySignature: arrangement.keySignature,
                timeSignature: arrangement.timeSignature,
                tempoBpm: arrangement.tempoBpm
            } : undefined}
        />
    )

}

// ============================================
// 2. USING SHEET MUSIC EXPORT IN COMPONENTS
// ============================================

import { downloadSheetMusicPDF } from '@/lib/utils/sheet-music-export'

// Simple usage:
const handleExport = () => {
downloadSheetMusicPDF({
title: 'Amazing Grace',
language: 'english',
theme: 'general',
voices: [
{
part: 'soprano',
notation: 'do re mi fa sol...'
},
{
part: 'alto',
notation: 'do ti la sol...'
},
// ... etc
],
keySignature: 'G Major',
timeSignature: '4/4',
tempoBpm: 120
})
}

// ============================================
// 3. PROFESSIONAL SHEET MUSIC (Advanced)
// ============================================

// For better looking PDFs, use the VexFlow version:
import { downloadProfessionalSheetMusic } from '@/lib/utils/vexflow-sheet-music'

downloadProfessionalSheetMusic({
title: 'Amazing Grace',
keySignature: 'G Major',
timeSignature: '4/4',
tempoBpm: 120,
voices: arrangement.voices,
composer: 'John Newton'
})

// ============================================
// 4. STORING ARRANGEMENT DATA IN DATABASE
// ============================================

// Your database should have a satb_arrangements table:
/_
CREATE TABLE satb_arrangements (
id UUID PRIMARY KEY,
hymn_id UUID REFERENCES hymns(id),
user_id UUID REFERENCES users(id),
language TEXT,
theme TEXT,
status TEXT, -- 'pending', 'processing', 'ready', 'failed'
key_signature TEXT,
tempo_bpm INTEGER,
time_signature TEXT,
voices JSONB, -- Array of {part: string, notation: string}
music_xml TEXT, -- Optional: MusicXML format for advanced rendering
midi_url TEXT, -- Optional: MIDI file URL
pdf_url TEXT, -- Optional: Pre-generated PDF URL
audio_preview_url TEXT,
error_message TEXT,
created_at TIMESTAMP,
updated_at TIMESTAMP
);
_/

// ============================================
// 5. API ENDPOINT FOR ARRANGEMENT GENERATION
// ============================================

// Create app/api/arrangements/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
const { hymnId } = await req.json()
const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Create arrangement record with 'processing' status
    const { data: arrangement, error } = await supabase
        .from('satb_arrangements')
        .insert({
            hymn_id: hymnId,
            user_id: user.id,
            status: 'processing'
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Call OpenAI API to generate arrangement
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [{
                    role: 'user',
                    content: `Generate a SATB arrangement for this hymn. Return JSON with:
                    {
                      "keySignature": "G Major",
                      "timeSignature": "4/4",
                      "tempoBpm": 120,
                      "voices": [
                        {"part": "soprano", "notation": "..."},
                        {"part": "alto", "notation": "..."},
                        {"part": "tenor", "notation": "..."},
                        {"part": "bass", "notation": "..."}
                      ]
                    }`
                }]
            })
        })

        const result = await response.json()
        const arrangement_data = JSON.parse(result.choices[0].message.content)

        // Update with generated data
        await supabase
            .from('satb_arrangements')
            .update({
                status: 'ready',
                key_signature: arrangement_data.keySignature,
                time_signature: arrangement_data.timeSignature,
                tempo_bpm: arrangement_data.tempoBpm,
                voices: arrangement_data.voices
            })
            .eq('id', arrangement.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        await supabase
            .from('satb_arrangements')
            .update({
                status: 'failed',
                error_message: (error as Error).message
            })
            .eq('id', arrangement.id)

        return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }

}

// ============================================
// 6. OPTIONAL: ADD MusicXML SUPPORT
// ============================================

// Install: npm install musicxml-parser
// Then in your export function:

import { parseXml } from 'musicxml-parser'

export async function generateFromMusicXML(musicXmlString: string) {
// Parse MusicXML and extract parts
const parsed = parseXml(musicXmlString)
// ... generate PDF from parsed data
}

// ============================================
// 7. DEPENDENCIES TO INSTALL
// ============================================

// npm install jspdf
// npm install html2canvas (optional, for canvas rendering)
// npm install musicxml-parser (optional, for MusicXML support)
// npm install vexflow (optional, for professional rendering)
