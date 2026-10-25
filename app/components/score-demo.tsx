// app/components/score-demo.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { composeHymn } from '@/lib/music/compose'
import { ensureScoreFonts, scoreOptions } from '@/lib/score-fonts'

// A sample verse about choirs, with a hand-set tune. The four parts are
// produced by the same arranger that sets every hymn in the app.
const LYRICS = `When morning wakes the sleeping hill
And grateful hearts are rising still,
The low, the high, the soft, the strong
Together make a single song.`

const CONTOUR = [
  [1, 3, 5, 5, 6, 5, 3, 1],
  [3, 3, 5, 6, 5, 3, 3, 2],
  [5, 5, 6, 8, 6, 5, 3, 5],
  [5, 6, 5, 3, 3, 2, 2, 1],
]

export default function ScoreDemo() {
  const target = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ default: abcjs }] = await Promise.all([import('abcjs'), ensureScoreFonts()])
      if (cancelled || !target.current) return
      const { abc } = composeHymn({
        title: 'Morning Hymn',
        lyrics: LYRICS,
        language: 'english',
        key: 'F',
        tempo: 84,
        contour: CONTOUR,
      })
      abcjs.renderAbc(target.current, abc, scoreOptions(target.current))
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <figure>
      <div className="score-sheet relative border border-rule bg-sheet p-4 shadow-[0_1px_0_rgba(0,0,0,0.04),0_28px_44px_-30px_rgba(15,59,53,0.55)] sm:p-7">
        <div
          ref={target}
          role="img"
          aria-label="Sheet music: a four-part arrangement of the sample hymn “When morning wakes the sleeping hill”"
        />
        {!ready && (
          <div aria-hidden="true" className="staff staff-scan absolute inset-4 sm:inset-7" />
        )}
        <div className={ready ? '' : 'min-h-[24rem]'} />
      </div>
      <figcaption className="mt-3 max-w-md text-sm text-ink-2">
        A sample arrangement, drawn in your browser. Every hymn gets the same four parts: soprano, alto,
        tenor and bass.
      </figcaption>
    </figure>
  )
}