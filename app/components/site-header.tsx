// app/components/site-header.tsx (server component)
import Link from 'next/link'
import { getSessionSafe } from '@/lib/auth/session'
import Logo from './logo'
import SignOutButton from './sign-out-button'

type Active = 'create' | 'library' | 'discover'

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`px-1 py-0.5 text-[0.95rem] ${active ? 'hl text-ink font-medium' : 'text-ink-2 hover:text-ink'}`}
    >
      {label}
    </Link>
  )
}

export default async function SiteHeader({ active }: { active?: Active }) {
  const session = await getSessionSafe()
  const user = session?.user
  const firstName = user?.name?.split(' ')[0] || user?.email

  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          <NavLink href="/discover" label="Shared hymns" active={active === 'discover'} />
          {user && <NavLink href="/my-hymns" label="Your hymns" active={active === 'library'} />}
          {user ? (
            <span className="flex items-center gap-4 border-l border-rule pl-6">
              <Link href="/dashboard" className="text-sm text-ink-2 hover:text-ink">
                {firstName}
              </Link>
              <SignOutButton />
            </span>
          ) : (
            <Link href="/login" className="text-[0.95rem] text-ink-2 hover:text-ink">
              Sign in
            </Link>
          )}
          <Link
            href="/create"
            className="rounded-md bg-spruce px-4 py-2 text-[0.95rem] font-medium text-white hover:bg-spruce-2"
          >
            Write a hymn
          </Link>
        </nav>

        {/* Small screens: native disclosure, no JavaScript needed */}
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-rule px-3 py-1.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-rule bg-sheet p-2 shadow-[0_16px_32px_-20px_rgba(15,59,53,0.5)]">
            <Link href="/create" className="block rounded px-3 py-2 font-medium hover:bg-wash">Write a hymn</Link>
            <Link href="/discover" className="block rounded px-3 py-2 hover:bg-wash">Shared hymns</Link>
            {user && <Link href="/my-hymns" className="block rounded px-3 py-2 hover:bg-wash">Your hymns</Link>}
            {user && <Link href="/dashboard" className="block rounded px-3 py-2 hover:bg-wash">Home</Link>}
            <div className="mt-1 border-t border-rule px-3 py-2">
              {user ? <SignOutButton /> : <Link href="/login" className="text-sm underline underline-offset-4">Sign in</Link>}
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}