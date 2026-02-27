// app/create/page.tsx
import HymnGenerator from '@/app/components/hymn-generator'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CreateHymnPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Hymn Generator */}
                <HymnGenerator />
            </div>
        </div>
    )
}