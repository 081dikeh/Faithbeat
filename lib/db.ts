// lib/db.ts
// Thin Postgres helper over Neon's serverless driver. Use sql`...` tagged
// templates for parameterized queries anywhere Supabase's .from() used to be.
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set — database calls will fail.')
}

export const sql = neon(process.env.DATABASE_URL!)
