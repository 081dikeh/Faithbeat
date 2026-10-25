// app/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth/client'
import AuthShell from '@/app/components/auth-shell'
import { errorBox, hintClass, inputClass, labelClass, primaryBtn } from '@/app/components/ui'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await authClient.signUp.email({ email, password, name: fullName })

      if (error) {
        setError(error.message || 'Could not create the account. Check the details and try again.')
        return
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell heading="Create an account" intro="An account keeps your hymns, music and shared links in one place.">
      <form onSubmit={handleSignUp} className="space-y-5">
        {error && (
          <p role="alert" className={errorBox}>
            {error}
          </p>
        )}

        <div>
          <label htmlFor="name" className={labelClass}>Your name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
            minLength={8}
          />
          <p className={hintClass}>At least 8 characters.</p>
        </div>

        <button type="submit" disabled={isLoading} className={`${primaryBtn} w-full`}>
          {isLoading ? 'Creating account' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-[0.95rem] text-ink-2">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}