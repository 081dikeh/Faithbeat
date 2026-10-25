// components/hymn-generator.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Pause, Play, Volume2 } from 'lucide-react'
import { parseLyrics } from '@/lib/music/lyrics'
import { errorBox, hintClass, inputClass, labelClass, primaryBtn, secondaryBtn } from './ui'
import type { Language, ChurchEventType } from '@/types'

interface HymnGeneratorProps {
  onGenerate?: (hymn: unknown) => void
}

const languages: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'igbo', label: 'Igbo' },
  { value: 'yoruba', label: 'Yorùbá' },
  { value: 'hausa', label: 'Hausa' },
]

const events: { value: ChurchEventType; label: string }[] = [
  { value: 'general', label: 'General worship' },
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
  const sheetRef = useRef<HTMLDivElement>(null)

  const canGenerate = description.trim().length > 0 && !isGenerating

  useEffect(() => {
    if (generatedLyrics && window.matchMedia('(max-width: 1023px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      sheetRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    }
  }, [generatedLyrics])

  const handleGenerate = async () => {
    if (!description.trim()) {
      setErrorMsg('Describe what the hymn should be about, then try again.')
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
        body: JSON.stringify({ title, description, language, churchEvent }),
      })

      const data = await response.json()

      if (response.status === 401) {
        window.location.href = '/login?redirectTo=/create'
        return
      }
      if (!response.ok || data.error) throw new Error(data.error || 'The hymn could not be written. Try again.')

      setGeneratedLyrics(data.lyrics)
      setResultTitle(data.title)

      if (onGenerate) onGenerate(data)
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'The hymn could not be written. Try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!generatedLyrics) return
    setIsGeneratingAudio(true)
    setErrorMsg(null)

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lyrics: generatedLyrics, language }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'The audio could not be made.')
      }

      const blob = await response.blob()
      setAudioUrl(URL.createObjectURL(blob))
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'The audio could not be made.')
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
      setErrorMsg('Write a hymn before saving.')
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
          churchEvent,
        }),
      })

      const data = await response.json()

      if (data.error) {
        if (response.status === 401) {
          window.location.href = '/login?redirectTo=/create'
          return
        }
        throw new Error(data.error)
      }

      // The hymn page is where the four-part music is composed.
      window.location.href = `/hymn/${data.hymn.id}`
    } catch (error: unknown) {
      setErrorMsg(`The hymn was not saved. ${error instanceof Error ? error.message : 'Try again.'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const verses = generatedLyrics ? parseLyrics(generatedLyrics) : []

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      {/* The request */}
      <div className="lg:col-span-5">
        <div className="space-y-7 lg:sticky lg:top-8">
          <div>
            <label htmlFor="title" className={labelClass}>Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song of the Rescued"
              className={`${inputClass} heading text-[1.2rem]`}
            />
            <p className={hintClass}>Optional. Leave it blank and Faithbeat will suggest one.</p>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>What is the hymn about?</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thanks for the harvest, for a congregation that has had a hard year. Mention Psalm 126."
              className={`${inputClass} resize-none font-serif text-[1.1rem] leading-relaxed`}
              rows={5}
            />
            <p className={hintClass}>Name a scripture, an occasion or a feeling. The more specific, the closer the words.</p>
          </div>

          <fieldset>
            <legend className={labelClass}>Language</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {languages.map((lang) => (
                <label key={lang.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang.value}
                    checked={language === lang.value}
                    onChange={() => setLanguage(lang.value)}
                    className="peer sr-only"
                  />
                  <span className="inline-block border-b-2 border-transparent px-1 py-1 text-[1.05rem] text-ink-2 peer-checked:hl peer-checked:font-medium peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-spruce hover:text-ink">
                    {lang.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="occasion" className={labelClass}>Church season or occasion</label>
            <select
              id="occasion"
              value={churchEvent}
              onChange={(e) => setChurchEvent(e.target.value as ChurchEventType)}
              className={inputClass}
            >
              {events.map((event) => (
                <option key={event.value} value={event.value}>{event.label}</option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <p role="alert" className={errorBox}>
              {errorMsg}
            </p>
          )}

          <button onClick={handleGenerate} disabled={!canGenerate} aria-busy={isGenerating} className={`${primaryBtn} w-full py-3.5`}>
            {isGenerating ? 'Writing the hymn' : 'Write the hymn'}
          </button>
        </div>
      </div>

      {/* The result */}
      <div className="lg:col-span-7" ref={sheetRef} aria-live="polite">
        {isGenerating ? (
          <div className="border border-rule bg-sheet p-8 sm:p-10">
            <div className="staff staff-scan h-[17.5rem]" />
            <p className="heading mt-6 text-[1.4rem]">Writing four verses</p>
            <p className="text-serif-body mt-1 text-ink-2">This can take up to half a minute.</p>
          </div>
        ) : generatedLyrics ? (
          <article className="border border-rule bg-sheet p-8 shadow-[0_1px_0_rgba(0,0,0,0.04),0_28px_44px_-30px_rgba(15,59,53,0.55)] sm:p-10">
            <h2 className="display text-[2.6rem] sm:text-[3.4rem]">{resultTitle || 'Your hymn'}</h2>

            <ol className="lyrics mt-8 space-y-7">
              {(verses.length > 0 ? verses : [generatedLyrics.split('\n')]).map((lines, i) => (
                <li key={i} className="grid grid-cols-[2rem_1fr] gap-x-2">
                  <span className="pt-[0.5rem] font-sans text-sm text-ink-3">{i + 1}</span>
                  <p className="whitespace-pre-line">{lines.join('\n')}</p>
                </li>
              ))}
            </ol>

            {audioUrl && (
              <div className="mt-8 flex items-center gap-4 border-t border-rule pt-6">
                <button
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play the words aloud'}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-spruce text-white hover:bg-spruce-2"
                >
                  {isPlaying ? <Pause className="h-5 w-5" strokeWidth={1.75} /> : <Play className="ml-0.5 h-5 w-5" strokeWidth={1.75} />}
                </button>
                <p className="min-w-0 flex-1 text-sm text-ink-2">The words, read aloud</p>
                <button onClick={downloadAudio} className={secondaryBtn}>
                  <Download className="h-4 w-4" strokeWidth={1.75} /> Download
                </button>
                <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-rule pt-6 sm:flex-row sm:items-center">
              <button onClick={handleSaveHymn} disabled={isSaving} className={primaryBtn}>
                {isSaving ? 'Saving' : 'Save to your hymns'}
              </button>
              <button onClick={handleGenerateAudio} disabled={isGeneratingAudio || !!audioUrl} className={secondaryBtn}>
                <Volume2 className="h-4 w-4" strokeWidth={1.75} />
                {isGeneratingAudio ? 'Preparing audio' : audioUrl ? 'Audio ready' : 'Hear the words'}
              </button>
            </div>
            <p className="mt-4 max-w-md text-sm text-ink-3">
              Saving takes you to the hymn, where Faithbeat composes the tune and four parts. “Hear the words” only reads the
              lyrics aloud.
            </p>
          </article>
        ) : (
          <div className="staff border border-rule bg-sheet/60 p-8 sm:p-10">
            <div className="max-w-md border border-rule bg-sheet p-5">
              <p className="heading text-[1.5rem]">Your hymn will appear here</p>
              <p className="text-serif-body mt-2 text-ink-2">
                Four verses of four lines, all on the same syllable pattern, so one tune fits every verse.
              </p>
            </div>
            <div className="h-48" />
          </div>
        )}
      </div>
    </div>
  )
}