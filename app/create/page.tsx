// app/create/page.tsx
import type { Metadata } from 'next'
import HymnGenerator from '@/app/components/hymn-generator'
import SiteHeader from '@/app/components/site-header'
import SiteFooter from '@/app/components/site-footer'

export const metadata: Metadata = { title: 'Write a hymn' }

export default function CreateHymnPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader active="create" />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="display text-[3rem] sm:text-[4.4rem]">Write a hymn</h1>
        <p className="text-serif-body mt-3 max-w-2xl text-ink-2">
          Tell us what it is for. You will get four verses you can read, change your mind about, and save.
        </p>
        <div className="mt-10">
          <HymnGenerator />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}