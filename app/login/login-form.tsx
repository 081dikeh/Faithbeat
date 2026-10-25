// app/login/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import AuthShell from '@/app/components/auth-shell'
import { errorBox, inputClass, labelClass, primaryBtn } from '@/app/components/ui'

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
        setError(error.message || 'Sign in failed. Check your email and password.')
        return
      }

      router.push(searchParams.get('redirectTo') || '/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell heading="Sign in" intro="Pick up where you left off with your hymns.">
      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <p role="alert" className={errorBox}>
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <button type="submit" disabled={isLoading} className={`${primaryBtn} w-full`}>
          {isLoading ? 'Signing in' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-[0.95rem] text-ink-2">
        New to Faithbeat?{' '}
        <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}