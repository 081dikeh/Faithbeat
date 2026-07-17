// app/compose/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
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

        try {
            const res = await fetch('/api/arrangements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    voices: [{ part: 'soprano', notation: abc }],
                    language,
                    theme,
                    timeSignature: '4/4',
                    status: 'ready'
                })
            })
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 401) {
                    window.location.href = '/login?redirectTo=/compose'
                    return
                }
                throw new Error(data.error || 'Failed to save arrangement')
            }

            alert('Arrangement saved successfully!')
        } catch (err: any) {
            console.error('Save error', err)
            alert('Failed to save arrangement: ' + err.message)
        }
    }

    return (
        <div className="min-h-screen bg-parchment py-10 sm:py-16">
            <div className="max-w-3xl mx-auto px-4 space-y-8">
                <div>
                    <div className="inline-flex items-center gap-2 text-brass text-xs font-medium tracking-[0.18em] uppercase mb-3">
                        Compose & arrange
                    </div>
                    <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl italic text-ink">
                        Compose Hymn / SATB
                    </h1>
                </div>

                <div className="staff-rule" />

                <div className="bg-white/70 backdrop-blur rounded-2xl border border-brass-soft/40 p-6 sm:p-8 space-y-5">
                    <label className="block">
                        <span className="text-sm font-medium text-ink">Theme</span>
                        <input
                            type="text"
                            className="mt-1.5 block w-full border border-ink/10 rounded-xl p-3 bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        />
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-ink">Lyrics (optional)</span>
                        <textarea
                            rows={4}
                            className="mt-1.5 block w-full border border-ink/10 rounded-xl p-3 bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none resize-none"
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                        />
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex-1">
                            <span className="text-sm font-medium text-ink">Language</span>
                            <select
                                className="mt-1.5 block w-full border border-ink/10 rounded-xl p-3 bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none"
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
                            <span className="text-sm font-medium text-ink">Occasion</span>
                            <select
                                className="mt-1.5 block w-full border border-ink/10 rounded-xl p-3 bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none"
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
                        className="w-full sm:w-auto px-6 py-3 bg-ink text-parchment rounded-xl hover:bg-ink/90 disabled:opacity-40 transition-colors font-medium"
                    >
                        {loading ? 'Generating...' : 'Generate Arrangement'}
                    </button>
                </div>

                {abc && (
                    <>
                        <div className="bg-white/70 backdrop-blur rounded-2xl border border-brass-soft/40 p-6 sm:p-8 space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-ink">ABC Notation (editable)</span>
                                <textarea
                                    rows={6}
                                    className="mt-1.5 block w-full border border-ink/10 rounded-xl p-3 font-mono text-sm bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none"
                                    value={abc}
                                    onChange={(e) => setAbc(e.target.value)}
                                />
                            </label>

                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-sage text-white rounded-xl hover:bg-sage/90 transition-colors font-medium"
                            >
                                Save to Database
                            </button>
                        </div>

                        <div className="bg-white/70 backdrop-blur rounded-2xl border border-brass-soft/40 p-6 sm:p-8">
                            <div ref={notationRef} />
                            <div ref={midiRef} className="mt-4" />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
