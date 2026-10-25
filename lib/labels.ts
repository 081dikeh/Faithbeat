// lib/labels.ts: display names shared across the interface
export const LANGUAGE_LABELS: Record<string, string> = {
  english: 'English',
  igbo: 'Igbo',
  yoruba: 'Yorùbá',
  hausa: 'Hausa',
}

export const EVENT_LABELS: Record<string, string> = {
  general: 'General worship',
  christmas: 'Christmas',
  easter: 'Easter',
  lent: 'Lent',
  advent: 'Advent',
  pentecost: 'Pentecost',
}

export const languageLabel = (v: string | null | undefined) => LANGUAGE_LABELS[v ?? ''] ?? (v || 'English')
export const eventLabel = (v: string | null | undefined) => EVENT_LABELS[v ?? ''] ?? 'General worship'

export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}