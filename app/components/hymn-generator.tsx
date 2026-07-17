// components/hymn-generator.tsx
'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Music, Globe, Calendar, Download, Play, Pause, Feather } from 'lucide-react'
import type { Language, ChurchEventType } from '@/types'

interface HymnGeneratorProps {
  onGenerate?: (hymn: any) => void
}

const languages: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'igbo', label: 'Igbo' },
  { value: 'yoruba', label: 'Yoruba' },
  { value: 'hausa', label: 'Hausa' },
]

const events: { value: ChurchEventType; label: string }[] = [
  { value: 'general', label: 'General Worship' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'easter', label: 'Easter' },
  { value: 'lent', label: 'Lent' },
  { value: 'advent', label: 'Advent' },
  { value: 'pentecost', label: 'Pentecost' },
]

export default function HymnGenerator({ onGenerate }: HymnGeneratorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState<Language>('english')
  const [churchEvent, setChurchEvent] = useState<ChurchEventType>('general')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLyrics, setGeneratedLyrics] = useState('')
  const [resultTitle, setResultTitle] = useState('')
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const canGenerate = description.trim().length > 0 && !isGenerating

  const handleGenerate = async () => {
    if (!description.trim()) {
      setErrorMsg('Tell us what the hymn should be about before generating.')
      return
    }

    setErrorMsg(null)
    setIsGenerating(true)
    setGeneratedLyrics('')
    setAudioUrl(null)

    try {
      const response = await fetch('/api/generate-hymn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, language, churchEvent })
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      setGeneratedLyrics(data.lyrics)
      setResultTitle(data.title)

      if (onGenerate) onGenerate(data)
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to generate hymn. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!generatedLyrics) return
    setIsGeneratingAudio(true)

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: generatedLyrics, language })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Audio generation failed')
      }

      const blob = await response.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (error: any) {
      setErrorMsg(`Failed to generate audio: ${error.message}`)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const downloadAudio = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `${resultTitle || 'hymn'}.mp3`
    a.click()
  }

  const handleSaveHymn = async () => {
    if (!generatedLyrics || !resultTitle) {
      setErrorMsg('Generate a hymn before saving.')
      return
    }

    setIsSaving(true)
    setErrorMsg(null)

    try {
      const response = await fetch('/api/save-hymn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: resultTitle,
          lyrics: generatedLyrics,
          theme: description.split(' ').slice(0, 6).join(' '),
          description,
          language,
          churchEvent
        })
      })

      const data = await response.json()

      if (data.error) {
        if (response.status === 401) {
          window.location.href = '/login?redirectTo=/create'
          return
        }
        throw new Error(data.error)
      }
    } catch (error: any) {
      setErrorMsg(`Failed to save hymn: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/70 backdrop-blur rounded-3xl border border-brass-soft/40 shadow-[0_1px_0_0_rgba(176,141,87,0.25)] p-8 sm:p-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-brass text-xs font-medium tracking-[0.18em] uppercase mb-3">
            <Feather className="w-3.5 h-3.5" />
            Write a new hymn
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl text-ink italic">
            What should this hymn say?
          </h2>
          <p className="text-ink-soft/70 mt-2 text-[15px]">
            Give it a title and describe what you want it to carry — a scripture, an occasion,
            a feeling. The words below shape the verses directly.
          </p>
        </div>

        <div className="staff-rule mb-8" />

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Hymn title <span className="text-ink-soft/50 font-normal">(optional — we'll suggest one)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Song of the Rescued"
              className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none font-[family-name:var(--font-display)] text-lg text-ink placeholder:text-ink-soft/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Describe the hymn
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A hymn for a congregation walking through grief, holding on to the promise that God stays close even in silence. Reference Psalm 23."
              className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none resize-none text-ink placeholder:text-ink-soft/30"
              rows={4}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
                <Globe className="w-4 h-4" />
                Language
              </label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setLanguage(lang.value)}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      language === lang.value
                        ? 'border-brass bg-brass/10 text-ink'
                        : 'border-ink/10 text-ink-soft/70 hover:border-brass/50'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
                <Calendar className="w-4 h-4" />
                Occasion
              </label>
              <select
                value={churchEvent}
                onChange={(e) => setChurchEvent(e.target.value as ChurchEventType)}
                className="w-full h-full px-4 py-3 rounded-xl border border-ink/10 bg-white focus:ring-2 focus:ring-brass focus:border-transparent outline-none text-ink"
              >
                {events.map((event) => (
                  <option key={event.value} value={event.value}>{event.label}</option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-wine bg-wine/5 border border-wine/20 rounded-xl px-4 py-3">
              {errorMsg}
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              canGenerate
                ? 'bg-ink text-parchment hover:bg-ink/90 active:scale-[0.99]'
                : 'bg-ink/20 text-parchment/60 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Writing your hymn...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-brass" />
                Generate hymn
              </>
            )}
          </button>
        </div>

        {/* Generated Lyrics */}
        <AnimatePresence>
          {generatedLyrics && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-10"
            >
              <div className="staff-rule mb-8" />

              <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl italic text-ink mb-6 text-center">
                {resultTitle || 'Your hymn'}
              </h3>

              <div className="bg-parchment-dim/60 rounded-2xl p-6 sm:p-8 mb-6 border border-brass-soft/30">
                <pre className="whitespace-pre-wrap font-[family-name:var(--font-display)] text-[17px] leading-8 text-ink-soft">
                  {generatedLyrics}
                </pre>
              </div>

              {audioUrl && (
                <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4 border border-brass-soft/40">
                  <button
                    onClick={togglePlayPause}
                    className="w-11 h-11 shrink-0 rounded-full bg-ink text-parchment flex items-center justify-center hover:bg-ink/90"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">Audio preview</p>
                    <p className="text-xs text-ink-soft/60">Ready to play</p>
                  </div>
                  <button
                    onClick={downloadAudio}
                    className="px-4 py-2 rounded-lg border border-ink/10 hover:border-brass/50 flex items-center gap-2 text-sm text-ink-soft"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio || !!audioUrl}
                  className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 border transition-colors ${
                    isGeneratingAudio || audioUrl
                      ? 'border-ink/10 text-ink-soft/40 cursor-not-allowed'
                      : 'border-ink/15 text-ink hover:border-brass'
                  }`}
                >
                  {isGeneratingAudio ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating audio...</>
                  ) : audioUrl ? (
                    <><Music className="w-4 h-4" /> Audio ready</>
                  ) : (
                    <><Music className="w-4 h-4" /> Generate audio</>
                  )}
                </button>
                <button
                  onClick={handleSaveHymn}
                  disabled={isSaving}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                    isSaving
                      ? 'bg-sage/50 text-white cursor-not-allowed'
                      : 'bg-sage text-white hover:bg-sage/90'
                  }`}
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    'Save hymn'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
