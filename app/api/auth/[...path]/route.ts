// app/api/auth/[...path]/route.ts
// Handles all Neon Auth calls (sign-in, sign-up, sign-out, session refresh).
// Replaces the old /api/auth-check, /api/auth/session, /auth/callback,
// /auth/login, and /auth/signout Supabase routes.
import { auth } from '@/lib/auth/server'

export const { GET, POST } = auth.handler()
