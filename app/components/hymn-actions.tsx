// components/hymn-actions.tsx
'use client'

import { useState } from 'react'
import { Download, Link2, Printer } from 'lucide-react'
import { downloadHymnPDF, printHymnPDF } from '@/lib/utils/pdf-export'
import { secondaryBtn } from './ui'

interface HymnActionsProps {
  isOwner?: boolean
  hymn: {
    id: string
    title: string
    lyrics: string
    language: string
    church_event?: string
    theme?: string
  }
}

export default function HymnActions({ hymn, isOwner = false }: HymnActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState<{ text: string; bad?: boolean } | null>(null)

  const data = {
    title: hymn.title,
    lyrics: hymn.lyrics,
    language: hymn.language,
    churchEvent: hymn.church_event,
    theme: hymn.theme,
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: hymn.title, text: `${hymn.title}, a hymn on Faithbeat`, url: window.location.href })
      } catch {
        /* the person closed the share sheet */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setStatus({ text: 'Link copied.' })
    } catch {
      setStatus({ text: 'The link could not be copied. Copy it from the address bar.', bad: true })
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setStatus(null)
    try {
      const response = await fetch(`/api/hymns/${hymn.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('delete failed')
      window.location.href = '/my-hymns'
    } catch {
      setStatus({ text: 'The hymn was not deleted. Try again.', bad: true })
      setIsDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => downloadHymnPDF(data)} className={secondaryBtn}>
          <Download className="h-4 w-4" strokeWidth={1.75} /> Words as PDF
        </button>
        <button onClick={() => printHymnPDF(data)} className={secondaryBtn}>
          <Printer className="h-4 w-4" strokeWidth={1.75} /> Print the words
        </button>
        <button onClick={handleShare} className={secondaryBtn}>
          <Link2 className="h-4 w-4" strokeWidth={1.75} /> Share link
        </button>

        {isOwner &&
          (confirming ? (
            <span className="flex flex-wrap items-center gap-3 sm:ml-auto">
              <span className="text-[0.95rem]">Delete this hymn and its music? This cannot be undone.</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-alert px-4 py-2.5 text-[0.95rem] font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting' : 'Delete'}
              </button>
              <button onClick={() => setConfirming(false)} className="text-[0.95rem] underline underline-offset-4">
                Keep it
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-[0.95rem] text-alert underline underline-offset-4 sm:ml-auto"
            >
              Delete hymn
            </button>
          ))}
      </div>
      {status && (
        <p role="status" className={`mt-3 text-sm ${status.bad ? 'text-alert' : 'text-ink-2'}`}>
          {status.text}
        </p>
      )}
    </div>
  )
}