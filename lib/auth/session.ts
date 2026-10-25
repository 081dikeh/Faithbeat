// lib/auth/session.ts
// A sign-in hiccup must never take a page down. If the auth service is slow or
// unreachable, treat the visitor as signed out and log why.
import { unstable_rethrow } from 'next/navigation'
import { auth } from './server'

export async function getSessionSafe() {
  try {
    const { data } = await auth.getSession()
    return data ?? null
  } catch (error) {
    // Let Next.js's own signals through (for example "this page is dynamic because it reads cookies").
    // Swallowing those would freeze pages as signed-out at build time.
    unstable_rethrow(error)
    console.error('auth.getSession() failed; treating visitor as signed out:', error)
    return null
  }
}