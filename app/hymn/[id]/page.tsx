// app/hymn/[id]/page.tsx
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Music, Globe, Calendar } from 'lucide-react'
import HymnActions from '@/app/components/hymn-actions'

export const dynamic = 'force-dynamic'

export default async function HymnPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { data: session } = await auth.getSession()

    if (!session?.user) {
        redirect('/login')
    }

    const [hymn] = await sql`select * from hymns where id = ${id}` as any[]

    if (!hymn) {
        notFound()
    }

    if (hymn.user_id !== session.user.id && !hymn.is_public) {
        redirect('/dashboard')
    }

    const [arrangement] = await sql`
        select * from satb_arrangements
        where hymn_id = ${id} and status = 'ready'
        limit 1
    `

    const languageLabels: Record<string, string> = {
        english: 'English',
        igbo: 'Igbo',
        yoruba: 'Yoruba',
        hausa: 'Hausa'
    }

    const eventLabels: Record<string, string> = {
        general: 'General Worship',
        christmas: 'Christmas',
        easter: 'Easter',
        lent: 'Lent',
        advent: 'Advent',
        pentecost: 'Pentecost'
    }

    return (
        <div className="min-h-screen bg-parchment">
            {/* Header */}
            <header className="bg-white/70 backdrop-blur border-b border-brass-soft/30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link
                        href="/my-hymns"
                        className="flex items-center gap-2 text-ink-soft/60 hover:text-brass transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to My Hymns
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white/70 backdrop-blur rounded-2xl border border-brass-soft/40 p-8">
                    {/* Title Section */}
                    <div className="text-center mb-8 pb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-ink rounded-full mb-4">
                            <Music className="w-8 h-8 text-brass" />
                        </div>
                        <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-ink mb-4">
                            {hymn.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-ink-soft/60">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                {languageLabels[hymn.language] || hymn.language}
                            </div>
                            {hymn.church_event && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {eventLabels[hymn.church_event] || hymn.church_event}
                                </div>
                            )}
                            <div className="text-ink-soft/40">
                                Created {new Date(hymn.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {hymn.theme && (
                            <div className="mt-4">
                                <span className="inline-block px-4 py-2 bg-brass/10 text-ink rounded-full text-sm">
                                    Theme: {hymn.theme}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="staff-rule mb-8" />

                    {/* Lyrics */}
                    <div className="mb-8">
                        <h2 className="font-[family-name:var(--font-display)] text-xl italic text-ink mb-4">Lyrics</h2>
                        <div className="bg-parchment-dim/60 rounded-lg p-6">
                            <pre className="whitespace-pre-wrap font-[family-name:var(--font-display)] text-ink-soft leading-relaxed text-lg">
                                {hymn.lyrics}
                            </pre>
                        </div>
                    </div>

                    {/* Audio Section (if available) */}
                    {hymn.audio_url && (
                        <div className="mb-8">
                            <h2 className="font-[family-name:var(--font-display)] text-xl italic text-ink mb-4">Audio</h2>
                            <div className="bg-brass/10 rounded-lg p-4">
                                <audio controls className="w-full">
                                    <source src={hymn.audio_url} type="audio/mpeg" />
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <HymnActions
                        hymn={hymn}
                        arrangement={arrangement ? {
                            voices: arrangement.voices,
                            keySignature: arrangement.key_signature,
                            timeSignature: arrangement.time_signature,
                            tempoBpm: arrangement.tempo_bpm
                        } : undefined}
                    />

                    {/* Stats */}
                    <div className="mt-8 pt-8 border-t border-brass-soft/30 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-[family-name:var(--font-display)] text-ink">{hymn.plays_count || 0}</p>
                            <p className="text-sm text-ink-soft/60">Plays</p>
                        </div>
                        <div>
                            <p className="text-2xl font-[family-name:var(--font-display)] text-ink">
                                {hymn.is_public ? 'Public' : 'Private'}
                            </p>
                            <p className="text-sm text-ink-soft/60">Visibility</p>
                        </div>
                        <div>
                            <p className="text-2xl font-[family-name:var(--font-display)] text-ink">
                                {hymn.lyrics.split('\n').filter((line: string) => line.trim()).length}
                            </p>
                            <p className="text-sm text-ink-soft/60">Lines</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
