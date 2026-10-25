// app/error.tsx
'use client'

import Link from 'next/link'
import Logo from '@/app/components/logo'
import { primaryBtn, secondaryBtn } from '@/app/components/ui'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
        <Logo />
      </div>
      <main className="mx-auto max-w-6xl border-t border-rule px-5 py-16 sm:px-8 sm:py-24">
        <h1 className="display text-[3.2rem] sm:text-[5rem]">This page hit a problem.</h1>
        <p className="text-serif-body mt-5 max-w-xl text-ink-2">
          Nothing you wrote has been lost. Try again, and if it keeps happening, send us the code below so we can find
          the cause.
        </p>
        {error.digest && (
          <p className="mt-4 text-sm text-ink-3">
            Code: <code className="rounded bg-wash px-1.5 py-0.5">{error.digest}</code>
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-4">
          <button onClick={reset} className={primaryBtn}>Try again</button>
          <Link href="/" className={secondaryBtn}>Go home</Link>
        </div>
      </main>
    </div>
  )
}