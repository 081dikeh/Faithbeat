// components/hymn-actions.tsx
'use client'

import { Download, Printer, Share2, Trash2, Music } from 'lucide-react'
import { downloadHymnPDF, printHymnPDF } from '@/lib/utils/pdf-export'
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
}

export default function HymnActions({ hymn }: HymnActionsProps) {
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
          className="flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex gap-4">
        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}