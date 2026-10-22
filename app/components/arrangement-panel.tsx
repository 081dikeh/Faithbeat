// app/components/arrangement-panel.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import abcjs from 'abcjs'
import 'abcjs/abcjs-audio.css'
import { Loader2, Music, Printer, RefreshCw } from 'lucide-react'

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

  useEffect(() => {
    const scoreEl = scoreRef.current
    if (!abc || !scoreEl) return
    let cancelled = false
    setAudioNote(null)

    const visual = abcjs.renderAbc(scoreEl, abc, { responsive: 'resize', add_classes: true })[0]
    const clear = () => scoreEl.querySelectorAll('.abcjs-highlight').forEach((n) => n.classList.remove('abcjs-highlight'))

    const audioEl = audioRef.current
    if (audioEl && visual) {
      if (abcjs.synth.supportsAudio()) {
        audioEl.innerHTML = ''
        const control = new abcjs.synth.SynthController()
        controlRef.current = control
        control.load(
          audioEl,
          {
            onEvent: (ev: abcjs.NoteTimingEvent) => {
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
            if (!cancelled) setAudioNote('Playback could not load its instrument sounds. Check your internet connection and reload.')
          })
      } else {
        setAudioNote('Audio playback is not supported in this browser.')
      }
    }
    return () => {
      cancelled = true
      try {
        controlRef.current?.pause()
      } catch {
        /* nothing playing */
      }
    }
  }, [abc])

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
      if (!res.ok || !data.abc) throw new Error(data.error || 'Could not compose music.')
      setAbc(data.abc)
      setMeta({ keyLabel: `${data.key} major`, tempo: data.tempo, source: data.source, warnings: data.warnings ?? [] })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not compose music.')
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

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl italic text-ink">Sheet music &amp; playback</h2>
        {abc && (
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-brass-soft/50 text-ink rounded-lg hover:border-brass transition-colors"
              title="Opens the print dialog; choose “Save as PDF” to download"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            {isOwner && (
              <button
                onClick={compose}
                disabled={busy}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-brass-soft/50 text-ink rounded-lg hover:border-brass disabled:opacity-50 transition-colors"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {busy ? 'Composing…' : 'Compose a new version'}
              </button>
            )}
          </div>
        )}
      </div>

      {!abc ? (
        <div className="bg-parchment-dim/60 rounded-lg p-6 text-center">
          <p className="text-ink-soft/70 mb-4">
            Turn these lyrics into a four-part (SATB) arrangement with sheet music you can play and print.
          </p>
          <button
            onClick={compose}
            disabled={busy}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-parchment rounded-lg hover:bg-ink/90 font-semibold disabled:opacity-60 transition-colors"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5 text-brass" />}
            {busy ? 'Composing your arrangement…' : 'Compose SATB arrangement'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-brass-soft/30 p-4">
          <div ref={audioRef} className="mb-3" />
          {audioNote && <p className="text-sm text-ink-soft/60 mb-3">{audioNote}</p>}
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
        <ul className="mt-3 text-sm text-ink-soft/70 list-disc pl-5">
          {meta.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}