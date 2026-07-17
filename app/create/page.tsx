// app/create/page.tsx
import HymnGenerator from '@/app/components/hymn-generator'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CreateHymnPage() {
    return (
        <div className="min-h-screen bg-parchment py-10 sm:py-16">
            <div className="container mx-auto px-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-ink-soft/60 hover:text-brass mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                <HymnGenerator />
            </div>
        </div>
    )
}
