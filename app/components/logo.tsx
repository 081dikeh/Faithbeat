import Link from 'next/link'

/** Two beamed eighth notes: the mark. */
export function LogoMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <ellipse cx="6.4" cy="18" rx="3.3" ry="2.4" transform="rotate(-22 6.4 18)" />
      <ellipse cx="16.4" cy="16" rx="3.3" ry="2.4" transform="rotate(-22 16.4 16)" />
      <rect x="8.7" y="4.6" width="1.7" height="13.2" />
      <rect x="18.7" y="2.6" width="1.7" height="13.2" />
      <polygon points="8.7,4.6 20.4,2.6 20.4,5.7 8.7,7.7" />
    </svg>
  )
}

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="Faithbeat home">
      <LogoMark />
      <span className="heading text-[1.35rem] font-bold leading-none">Faithbeat</span>
    </Link>
  )
}