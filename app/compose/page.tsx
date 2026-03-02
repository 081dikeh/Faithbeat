// app/compose/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import abcjs from 'abcjs'

export default function ComposePage() {
    const [theme, setTheme] = useState('')
    const [lyrics, setLyrics] = useState('')
    const [language, setLanguage] = useState('english')
    const [churchEvent, setChurchEvent] = useState('general')
    const [abc, setAbc] = useState('')
    const [loading, setLoading] = useState(false)
    const notationRef = useRef<HTMLDivElement>(null)
    const midiRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (notationRef.current && abc) {
            abcjs.renderAbc(notationRef.current, abc, { responsive: 'resize' })
        }
        if (midiRef.current && abc) {
            // render playback controls below notation (abcjs types vary; use any for safety)
            if ((abcjs as any).renderMidi) {
                ;(abcjs as any).renderMidi(midiRef.current, abc, { generateInline: true })
            }
        }
    }, [abc])

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/compose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme, lyrics, language, churchEvent })
            })
            const text = await res.text()
            let data
            try {
                data = JSON.parse(text)
            } catch (parseError) {
                console.error('Failed to parse JSON response from /api/compose', parseError, text)
                throw new Error('Invalid server response')
            }
            if (!res.ok) {
                const message = data.error || `Server returned ${res.status}`
                alert(`Compose API error: ${message}`)
                return
            }
            if (data.abc) {
                setAbc(data.abc)
            } else if (data.error) {
                alert(data.error)
            }
        } catch (err) {
            console.error('Compose request failed', err)
            let message = 'Unknown error'
            if (err instanceof Error) message = err.message
            else message = String(err)
            alert('Generation failed: ' + message)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!abc) return
        const supabase = createClient()
        const { data, error } = await supabase.from('satb_arrangements').insert({
            // store full ABC in the "notation" field of a dummy soprano voice
            voices: [
                { part: 'soprano', notation: abc }
            ],
            language,
            theme,
            time_signature: '4/4',
            status: 'ready'
        })

        if (error) {
            console.error('Save error', error)
            alert('Failed to save arrangement')
        } else {
            alert('Arrangement saved successfully!')
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-8">
            <h1 className="text-3xl font-bold">Compose Hymn / SATB</h1>

            <div className="space-y-4">
                <label className="block">
                    <span className="text-sm font-medium">Theme</span>
                    <input
                        type="text"
                        className="mt-1 block w-full border rounded-md p-2"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Lyrics (optional)</span>
                    <textarea
                        rows={4}
                        className="mt-1 block w-full border rounded-md p-2"
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                    />
                </label>

                <div className="flex gap-4">
                    <label className="flex-1">
                        <span className="text-sm font-medium">Language</span>
                        <select
                            className="mt-1 block w-full border rounded-md p-2"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="english">English</option>
                            <option value="igbo">Igbo</option>
                            <option value="yoruba">Yoruba</option>
                            <option value="hausa">Hausa</option>
                        </select>
                    </label>
                    <label className="flex-1">
                        <span className="text-sm font-medium">Occasion</span>
                        <select
                            className="mt-1 block w-full border rounded-md p-2"
                            value={churchEvent}
                            onChange={(e) => setChurchEvent(e.target.value)}
                        >
                            <option value="general">General</option>
                            <option value="christmas">Christmas</option>
                            <option value="easter">Easter</option>
                            <option value="lent">Lent</option>
                            <option value="advent">Advent</option>
                            <option value="pentecost">Pentecost</option>
                        </select>
                    </label>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !theme}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate Arrangement'}
                </button>
            </div>

            {abc && (
                <>
                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium">ABC Notation (editable)</span>
                            <textarea
                                rows={6}
                                className="mt-1 block w-full border rounded-md p-2 font-mono"
                                value={abc}
                                onChange={(e) => setAbc(e.target.value)}
                            />
                        </label>

                        <button
                            onClick={handleSave}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Save to Database
                        </button>
                    </div>

                    <div ref={notationRef} />
                    <div ref={midiRef} className="mt-4" />
                </>
            )}
        </div>
    )
}
