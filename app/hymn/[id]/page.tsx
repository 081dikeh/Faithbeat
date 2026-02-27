// app/hymn/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Music, Globe, Calendar, Download, Share2, Trash2 } from 'lucide-react'

export default async function HymnPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get the hymn
    const { data: hymn, error } = await supabase
        .from('hymns')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !hymn) {
        console.error('Hymn fetch failed', { error, paramsId: id })
        notFound()
    }

    // Check if user owns this hymn or if it's public
    if (hymn.user_id !== user.id && !hymn.is_public) {
        redirect('/dashboard')
    }

    const languageLabels: Record<string, string> = {
        english: 'English 🇬🇧',
        igbo: 'Igbo 🇳🇬',
        yoruba: 'Yoruba 🇳🇬',
        hausa: 'Hausa 🇳🇬'
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
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link
                        href="/my-hymns"
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to My Hymns
                    </Link>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Title Section */}
                    <div className="text-center mb-8 pb-8 border-b border-gray-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <Music className="w-8 h-8 text-purple-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {hymn.title}
                        </h1>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
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
                            <div className="text-gray-400">
                                Created {new Date(hymn.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        {hymn.theme && (
                            <div className="mt-4">
                                <span className="inline-block px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm">
                                    Theme: {hymn.theme}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Lyrics */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lyrics</h2>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <pre className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-lg">
                                {hymn.lyrics}
                            </pre>
                        </div>
                    </div>

                    {/* Audio Section (if available) */}
                    {hymn.audio_url && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Audio</h2>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <audio controls className="w-full">
                                    <source src={hymn.audio_url} type="audio/mpeg" />
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center gap-2">
                            <Download className="w-5 h-5" />
                            Download PDF
                        </button>
                        <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
                            <Music className="w-5 h-5" />
                            Generate Audio
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{hymn.plays_count || 0}</p>
                            <p className="text-sm text-gray-600">Plays</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {hymn.is_public ? 'Public' : 'Private'}
                            </p>
                            <p className="text-sm text-gray-600">Visibility</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {hymn.lyrics.split('\n').filter((line: string) => line.trim()).length}
                            </p>
                            <p className="text-sm text-gray-600">Lines</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}