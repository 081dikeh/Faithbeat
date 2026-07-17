// components/hymn-actions.tsx
'use client'

import { Download, Printer, Share2, Trash2, Music } from 'lucide-react'
import { downloadHymnPDF, printHymnPDF } from '@/lib/utils/pdf-export'
import { downloadSheetMusicPDF, printSheetMusic } from '@/lib/utils/sheet-music-export'
import { useState } from 'react'

interface HymnActionsProps {
  hymn: {
    id: string
    title: string
    lyrics: string
    language: string
    church_event?: string
    theme?: string
  }
  arrangement?: {
    voices: {
      part: 'soprano' | 'alto' | 'tenor' | 'bass'
      notation: string
    }[]
    keySignature?: string
    timeSignature?: string
    tempoBpm?: number
  }
}

export default function HymnActions({ hymn, arrangement }: HymnActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDownloadPDF = () => {
    downloadHymnPDF({
      title: hymn.title,
      lyrics: hymn.lyrics,
      language: hymn.language,
      churchEvent: hymn.church_event,
      theme: hymn.theme
    })
  }

  const handleDownloadSheetMusic = () => {
    if (!arrangement) {
      alert('Sheet music arrangement not available')
      return
    }

    downloadSheetMusicPDF({
      title: hymn.title,
      language: hymn.language,
      theme: hymn.theme,
      voices: arrangement.voices,
      keySignature: arrangement.keySignature,
      timeSignature: arrangement.timeSignature,
      tempoBpm: arrangement.tempoBpm
    })
  }

  const handlePrintSheetMusic = () => {
    if (!arrangement) {
      alert('Sheet music arrangement not available')
      return
    }

    printSheetMusic({
      title: hymn.title,
      language: hymn.language,
      theme: hymn.theme,
      voices: arrangement.voices,
      keySignature: arrangement.keySignature,
      timeSignature: arrangement.timeSignature,
      tempoBpm: arrangement.tempoBpm
    })
  }

  const handlePrint = () => {
    printHymnPDF({
      title: hymn.title,
      lyrics: hymn.lyrics,
      language: hymn.language,
      churchEvent: hymn.church_event,
      theme: hymn.theme
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: hymn.title,
          text: `Check out this hymn: ${hymn.title}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: Copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this hymn? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/hymns/${hymn.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Hymn deleted successfully')
        window.location.href = '/my-hymns'
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      alert('Failed to delete hymn')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-2 py-3 bg-ink text-parchment rounded-lg hover:bg-ink/90 font-semibold transition-colors"
        >
          <Download className="w-5 h-5 text-brass" />
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 py-3 bg-white border border-brass-soft/50 text-ink rounded-lg hover:border-brass font-semibold transition-colors"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
      </div>

      {/* Sheet Music Export - Only show if arrangement available */}
      {arrangement && (
        <div className="grid grid-cols-2 gap-4 border-t border-brass-soft/30 pt-4">
          <button
            onClick={handleDownloadSheetMusic}
            className="flex items-center justify-center gap-2 py-3 bg-sage text-white rounded-lg hover:bg-sage/90 font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            Sheet Music PDF
          </button>
          <button
            onClick={handlePrintSheetMusic}
            className="flex items-center justify-center gap-2 py-3 bg-sage/80 text-white rounded-lg hover:bg-sage/70 font-semibold transition-colors"
          >
            <Printer className="w-5 h-5" />
            Print Sheet Music
          </button>
        </div>
      )}

      {/* Secondary Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-brass-soft/50 text-ink-soft/70 rounded-lg hover:border-brass transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-wine/30 text-wine rounded-lg hover:bg-wine/5 disabled:opacity-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}