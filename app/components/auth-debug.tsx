// components/auth-debug.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthDebug() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      console.log('Auth Debug - User:', user)
    }
    checkAuth()
  }, [])

  if (loading) return <div className="text-xs text-gray-500">Checking auth...</div>

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-xs">
      <p className="font-bold mb-2">Auth Status:</p>
      {user ? (
        <>
          <p className="text-green-400">✅ Logged in</p>
          <p className="truncate">Email: {user.email}</p>
          <p className="truncate">ID: {user.id}</p>
        </>
      ) : (
        <p className="text-red-400">❌ Not logged in</p>
      )}
    </div>
  )
}