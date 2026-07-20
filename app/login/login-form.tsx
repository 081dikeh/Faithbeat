// app/login/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Music, Mail, Lock, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await authClient.signIn.email({ email, password })

      if (error) {
        setError(error.message || 'Login failed')
        return
      }

      router.push(searchParams.get('redirectTo') || '/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-ink rounded-full mb-4">
          <Music className="w-8 h-8 text-brass" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-ink mb-2">
          Welcome Back
        </h1>
        <p className="text-ink-soft/70">Sign in to continue creating hymns</p>
      </div>

      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-brass-soft/40 p-8">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-wine/5 border border-wine/20 rounded-lg">
              <p className="text-sm text-wine">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-ink/10 rounded-lg focus:ring-2 focus:ring-brass focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-ink/10 rounded-lg focus:ring-2 focus:ring-brass focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-parchment flex items-center justify-center gap-2 ${
              isLoading ? 'bg-ink/40 cursor-not-allowed' : 'bg-ink hover:bg-ink/90'
            }`}
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft/70">
          Don't have an account?{' '}
          <Link href="/signup" className="text-brass hover:text-brass/80 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
