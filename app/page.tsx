// app/page.tsx
import Link from 'next/link'
import { Music, Sparkles, Globe, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">FaithBeat</h1>
        </div>
        <nav className="flex gap-4">
          <Link 
            href="/create"
            className="px-4 py-2 text-gray-700 hover:text-purple-600"
          >
            Create Hymn
          </Link>
          <Link 
            href="/login" 
            className="px-4 py-2 text-gray-700 hover:text-purple-600"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          AI-Powered Hymn Composer
          <br />
          <span className="text-purple-600">for Local Choirs</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create custom hymns in Igbo, Yoruba, Hausa, and English. 
          Perfect for church choirs, worship leaders, and faith communities.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white text-lg rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Try It Free Now
          </Link>
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-purple-600 text-purple-600 text-lg rounded-lg hover:bg-purple-50 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Local Languages</h3>
            <p className="text-gray-600">
              Generate hymns in Igbo, Yoruba, Hausa, and English
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Advanced AI creates beautiful, meaningful hymns instantly
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <Calendar className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Church Calendar</h3>
            <p className="text-gray-600">
              Special hymns for Christmas, Easter, Lent, and more
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-purple-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Create Your First Hymn?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of worship leaders using FaithBeat
          </p>
          <Link 
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 text-lg rounded-lg hover:bg-gray-100 font-semibold"
          >
            <Music className="w-5 h-5" />
            Start Creating Free
          </Link>
        </div>
      </main>
    </div>
  )
}