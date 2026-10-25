// app/components/visibility-toggle.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Link2 } from 'lucide-react'
import { errorBox, secondaryBtn } from './ui'

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
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || 'Sharing could not be changed. Try again.')
      setIsPublic(!isPublic)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sharing could not be changed. Try again.')
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
      setError('The link could not be copied. Copy it from the address bar instead.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-5 border-y border-rule py-5">
        <div className="max-w-lg">
          <p className="font-medium">{isPublic ? 'Shared' : 'Private'}</p>
          <p className="mt-0.5 text-sm text-ink-2">
            {isPublic
              ? 'Anyone with the link can read, play and print this hymn, and it appears under Shared hymns.'
              : 'Only you can see this hymn. Turn on sharing to publish it for other choirs.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isPublic && (
            <button onClick={copyLink} className={secondaryBtn}>
              {copied ? <Check className="h-4 w-4" strokeWidth={1.75} /> : <Link2 className="h-4 w-4" strokeWidth={1.75} />}
              {copied ? 'Link copied' : 'Copy link'}
            </button>
          )}
          <label className="flex cursor-pointer items-center gap-3 text-[0.95rem] font-medium">
            Share publicly
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              aria-label="Share this hymn publicly"
              onClick={toggle}
              disabled={busy}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${isPublic ? 'bg-spruce' : 'bg-ink/25'}`}
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform motion-reduce:transition-none ${isPublic ? 'translate-x-5' : ''}`}
              />
            </button>
          </label>
        </div>
      </div>
      {error && (
        <p role="alert" className={`${errorBox} mt-4`}>
          {error}
        </p>
      )}
    </div>
  )
}