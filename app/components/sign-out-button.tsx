// app/components/sign-out-button.tsx
'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth/client'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-2 text-ink-soft/70 hover:text-wine"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  )
}
