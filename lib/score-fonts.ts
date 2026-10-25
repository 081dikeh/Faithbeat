// lib/score-fonts.ts
// abcjs measures text when it draws a score. Wait for the lyric font first,
// or syllables are spaced for a fallback font and crowd together.
export async function ensureScoreFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all([
      document.fonts.load('15px "Gentium Book Plus"'),
      document.fonts.load('bold 24px "Gentium Book Plus"'),
    ])
  } catch {
    /* fall back to whatever font is available */
  }
}

/** abcjs layout options: lay the score out at the width it will actually be shown at. */
export function scoreOptions(el: HTMLElement) {
  return {
    staffwidth: Math.max(320, Math.floor(el.clientWidth)),
    responsive: 'resize' as const,
    add_classes: true,
  }
}