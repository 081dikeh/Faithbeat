// lib/usage.ts
// Rolling 24-hour cap on AI generations per user. The check and the insert are
// one SQL statement. Under a burst of simultaneous requests a few extra may slip
// through (each statement counts from its own snapshot), which is fine for cost
// control but not a hard guarantee.
import { sql } from '@/lib/db'

export type UsageKind = 'hymn' | 'compose' | 'audio'

const DEFAULTS: Record<UsageKind, number> = { hymn: 10, compose: 30, audio: 20 }
const ENV_KEYS: Record<UsageKind, string> = {
  hymn: 'HYMN_DAILY_LIMIT',
  compose: 'COMPOSE_DAILY_LIMIT',
  audio: 'AUDIO_DAILY_LIMIT',
}

export function dailyLimit(kind: UsageKind): number {
  const fromEnv = Number(process.env[ENV_KEYS[kind]])
  return Number.isFinite(fromEnv) && fromEnv > 0 ? Math.floor(fromEnv) : DEFAULTS[kind]
}

export type Reservation = { ok: true; id: string; limit: number } | { ok: false; limit: number }

export async function reserveUsage(userId: string, kind: UsageKind): Promise<Reservation> {
  const limit = dailyLimit(kind)
  const rows = (await sql`
    insert into generation_usage (user_id, kind)
    select ${userId}::uuid, ${kind}
    where (
      select count(*) from generation_usage
      where user_id = ${userId}::uuid and kind = ${kind} and created_at > now() - interval '24 hours'
    ) < ${limit}
    returning id
  `) as { id: string }[]

  if (Math.random() < 0.02) {
    // opportunistic housekeeping; rows older than a week are never consulted
    sql`delete from generation_usage where created_at < now() - interval '7 days'`.catch(() => {})
  }
  return rows[0] ? { ok: true, id: rows[0].id, limit } : { ok: false, limit }
}

/** Give the credit back when the AI call failed through no fault of the user. */
export async function releaseUsage(id: string): Promise<void> {
  try {
    await sql`delete from generation_usage where id = ${id}`
  } catch (e) {
    console.error('Failed to release usage reservation:', e)
  }
}

export function limitMessage(kind: UsageKind, limit: number): string {
  if (kind === 'hymn') return `You've reached today's limit of ${limit} generated hymns. Please try again tomorrow.`
  if (kind === 'audio') return `You've reached today's limit of ${limit} audio readings. Please try again tomorrow.`
  return `You've reached today's limit of ${limit} AI compositions.`
}