import Link from 'next/link'
import Logo from './logo'

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div className="max-w-xl">
          <Logo />
          <p className="mt-4 text-[0.95rem] text-ink-2">
            Faithbeat drafts hymns for you to review. Have a native speaker read any Igbo, Yorùbá or Hausa
            lyrics before the hymn is sung in a service.
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm text-ink-2">
          <Link href="/create" className="hover:text-ink">Write a hymn</Link>
          <Link href="/discover" className="hover:text-ink">Shared hymns</Link>
          <Link href="/login" className="hover:text-ink">Sign in</Link>
        </nav>
      </div>
    </footer>
  )
}