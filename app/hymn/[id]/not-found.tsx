// app/hymn/[id]/not-found.tsx
import Link from 'next/link'
import SiteHeader from '@/app/components/site-header'
import { primaryBtn, secondaryBtn } from '@/app/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="display text-[3.2rem] sm:text-[5rem]">That hymn is not here.</h1>
        <p className="text-serif-body mt-5 max-w-xl text-ink-2">
          It may have been deleted, or its owner may have made it private. Check the link, or look through the hymns
          people have shared.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/discover" className={primaryBtn}>Browse shared hymns</Link>
          <Link href="/my-hymns" className={secondaryBtn}>Your hymns</Link>
        </div>
      </main>
    </div>
  )
}