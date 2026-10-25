// app/components/sign-out-button.tsx
'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/client'

export default function SignOutButton({ className = '' }: { className?: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className={`text-sm text-ink-2 underline decoration-rule underline-offset-4 hover:text-ink hover:decoration-ink ${className}`}
    >
      Sign out
    </button>
  )
}