'use client'

import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import 'abcjs/abcjs-audio.css'
import { Loader2, Music, Printer, RefreshCw } from 'lucide-react'
import { ensureScoreFonts, scoreOptions } from '@/lib/score-fonts'

interface Props {
  hymnId: string
  isOwner: boolean
  initial: { abc: string; keySignature?: string | null; tempo?: number | null } | null
}

interface Meta {
  keyLabel?: string
  tempo?: number
  source?: 'ai' | 'algorithmic'
  warnings: string[]
}

export default function ArrangementPanel({ hymnId, isOwner, initial }: Props) {
  const [abc, setAbc] = useState(initial?.abc ?? '')
  const [meta, setMeta] = useState<Meta>({
    keyLabel: initial?.keySignature ?? undefined,
    tempo: initial?.tempo ?? undefined,
    warnings: [],
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioNote, setAudioNote] = useState<string | null>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLDivElement>(null)
  const controlRef = useRef<abcjs.SynthObjectController | null>(null)
  const countedPlayRef = useRef(false)

  useEffect(() => {
    const scoreEl = scoreRef.current
    if (!abc || !scoreEl) return

    let cancelled = false
    setAudioNote(null)

    ;(async () => {
      await ensureScoreFonts()
      if (cancelled) return

      const visual = abcjs.renderAbc(scoreEl, abc, scoreOptions(scoreEl))[0]
      const clear = () => scoreEl.querySelectorAll('.abcjs-highlight').forEach((n) => n.classList.remove('abcjs-highlight'))

      const audioEl = audioRef.current
      if (!audioEl || !visual) return
      if (!abcjs.synth.supportsAudio()) {
        setAudioNote('This browser cannot play audio. You can still read and print the score.')
        return
      }

      audioEl.innerHTML = ''
      const control = new abcjs.synth.SynthController()
      controlRef.current = control
      control.load(
        audioEl,
        {
          onEvent: (ev: abcjs.NoteTimingEvent) => {
            if (!isOwner && !countedPlayRef.current) {
              countedPlayRef.current = true
              fetch(`/api/hymns/${hymnId}/play`, { method: 'POST' }).catch(() => {})
            }
            clear()
            const els = ev.elements as unknown as Element[][] | undefined
            els?.forEach((group) => group.forEach((n) => n.classList.add('abcjs-highlight')))
          },
          onFinished: clear,
        },
        { displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true }
      )

      const synth = new abcjs.synth.CreateSynth()
      synth
        .init({ visualObj: visual })
        .then(() => control.setTune(visual, false))
        .catch(() => {
          if (!cancelled) {
            setAudioNote('The instrument sounds could not load. Check your connection and reload the page to play it.')
          }
        })
    })()

    return () => {
      cancelled = true
      try {
        controlRef.current?.pause()
      } catch {
        // nothing playing
      }
    }
  }, [abc, hymnId, isOwner])

  const compose = async () => {
    setBusy(true)
    setError(null)

    try {
      const res = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hymnId }),
      })

      const data = await res.json()
      if (res.status === 401) {
        window.location.href = `/login?redirectTo=/hymn/${hymnId}`
        return
      }
      if (!res.ok || !data.abc) throw new Error(data.error || 'The music could not be composed. Try again.')

      setAbc(data.abc)
      setMeta({
        keyLabel: `${data.key} major`,
        tempo: data.tempo,
        source: data.source,
        warnings: data.warnings ?? [],
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The music could not be composed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!abc && !isOwner) return null

  return (
    <div className="mb-8">
      <style>{`
        .abcjs-highlight { fill: #b8860b; }
        @media print {
          body * { visibility: hidden; }
          #faithbeat-score, #faithbeat-score * { visibility: visible; }
          #faithbeat-score { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl italic text-ink">Sheet music &amp; playback</h2>
        {abc && (
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border border-brass-soft/50 bg-white px-3 py-2 text-sm text-ink transition-colors hover:border-brass"
              title="Opens the print dialog; choose “Save as PDF” to download"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
            {isOwner && (
              <button
                onClick={compose}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg border border-brass-soft/50 bg-white px-3 py-2 text-sm text-ink transition-colors hover:border-brass disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {busy ? 'Composing…' : 'Compose a new version'}
              </button>
            )}
          </div>
        )}
      </div>

      {!abc ? (
        <div className="rounded-lg bg-parchment-dim/60 p-6 text-center">
          <p className="mb-4 text-ink-soft/70">
            Turn these lyrics into a four-part (SATB) arrangement with sheet music you can play and print.
          </p>
          <button
            onClick={compose}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3 font-semibold text-parchment transition-colors hover:bg-ink/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Music className="h-5 w-5 text-brass" />}
            {busy ? 'Composing your arrangement…' : 'Compose SATB arrangement'}
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-brass-soft/30 bg-white p-4">
          <div ref={audioRef} className="mb-3" />
          {audioNote && <p className="mb-3 text-sm text-ink-soft/60">{audioNote}</p>}
          <div id="faithbeat-score" ref={scoreRef} />
          <p className="mt-3 text-xs text-ink-soft/50">
            {[meta.keyLabel && `Key of ${meta.keyLabel.replace(' major', '')}`, meta.tempo && `♩ = ${meta.tempo}`]
              .filter(Boolean)
              .join(' · ')}
            {meta.source === 'ai' && ' · Melody composed by AI, harmonised by rule-based voice-leading'}
            {meta.source === 'algorithmic' && ' · Algorithmic melody'}
          </p>
        </div>
      )}

      {meta.warnings.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-ink-soft/70">
          {meta.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}
