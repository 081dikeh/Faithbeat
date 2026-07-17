// app/page.tsx
import Link from 'next/link'
import { Music, Sparkles, Globe, Calendar, Feather } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Music className="w-7 h-7 text-brass" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl italic text-ink">Faithbeat</h1>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/create"
            className="px-4 py-2 text-sm text-ink-soft/70 hover:text-brass transition-colors"
          >
            Create Hymn 
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-ink-soft/70 hover:text-brass transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 bg-ink text-parchment text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 text-brass text-xs font-medium tracking-[0.18em] uppercase mb-5">
          <Feather className="w-3.5 h-3.5" />
          Hymns, written with you
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl italic text-ink mb-6 leading-tight">
          Write hymns your
          <br />
          congregation will carry
        </h2>
        <p className="text-lg sm:text-xl text-ink-soft/70 mb-10 max-w-2xl mx-auto">
          Generate original congregational hymns in Igbo, Yoruba, Hausa, and English —
          from a title and a description, built for African church worship.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-ink text-parchment text-lg rounded-xl hover:bg-ink/90 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-brass" />
            Try It Free Now
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-brass text-ink text-lg rounded-xl hover:bg-brass/10 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>

        <div className="staff-rule max-w-md mx-auto my-16" />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 bg-white/70 backdrop-blur rounded-2xl border border-brass-soft/40">
            <Globe className="w-10 h-10 text-brass mx-auto mb-4" />
            <h3 className="font-[family-name:var(--font-display)] text-xl italic text-ink mb-2">Local Languages</h3>
            <p className="text-ink-soft/70 text-[15px]">
              Generate hymns in Igbo, Yoruba, Hausa, & English
            </p>
          </div>

          <div className="p-8 bg-white/70 backdrop-blur rounded-2xl border border-brass-soft/40">
            <Sparkles className="w-10 h-10 text-brass mx-auto mb-4" />
            <h3 className="font-[family-name:var(--font-display)] text-xl italic text-ink mb-2">AI-Powered</h3>
            <p className="text-ink-soft/70 text-[15px]">
              Describe what you need — the AI writes lyrics that genuinely fit it
            </p>
          </div>

          <div className="p-8 bg-white/70 backdrop-blur rounded-2xl border border-brass-soft/40">
            <Calendar className="w-10 h-10 text-brass mx-auto mb-4" />
            <h3 className="font-[family-name:var(--font-display)] text-xl italic text-ink mb-2">Church Calendar</h3>
            <p className="text-ink-soft/70 text-[15px]">
              Special hymns for Christmas, Easter, Lent, and more
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-ink rounded-3xl p-12 text-parchment">
          <h3 className="font-[family-name:var(--font-display)] text-3xl italic mb-4">
            Ready to Write Your First Hymn?
          </h3>
          <p className="text-lg mb-8 text-parchment/70">
            Join worship leaders across the continent using Faithbeat
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brass text-ink text-lg rounded-xl hover:bg-brass-soft font-semibold transition-colors"
          >
            <Music className="w-5 h-5" />
            Start Creating Free
          </Link>
        </div>
      </main>
    </div>
  )
}
