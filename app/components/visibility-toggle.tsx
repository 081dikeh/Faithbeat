// app/components/visibility-toggle.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Globe, Lock } from 'lucide-react'

export default function VisibilityToggle({ hymnId, initialPublic }: { hymnId: string; initialPublic: boolean }) {
  const router = useRouter()
  const [isPublic, setIsPublic] = useState(initialPublic)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const toggle = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/hymns/${hymnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !isPublic }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Could not update visibility.')
      setIsPublic(!isPublic)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update visibility.')
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy the link. Copy it from the address bar instead.')
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-brass-soft/40 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isPublic ? <Globe className="w-5 h-5 text-brass" /> : <Lock className="w-5 h-5 text-ink-soft/60" />}
          <div>
            <p className="font-semibold text-ink">{isPublic ? 'Shared on Discover' : 'Only you can see this hymn'}</p>
            <p className="text-sm text-ink-soft/60">
              {isPublic ? 'Anyone with the link can view, play and print it.' : 'Share it to let others find and play it.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isPublic && (
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-brass-soft/50 text-ink rounded-lg hover:border-brass transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          )}
          <button
            onClick={toggle}
            disabled={busy}
            className="px-4 py-2 text-sm bg-ink text-parchment rounded-lg hover:bg-ink/90 disabled:opacity-50 transition-colors"
          >
            {busy ? 'Saving…' : isPublic ? 'Make private' : 'Share publicly'}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}