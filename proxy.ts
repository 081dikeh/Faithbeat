// proxy.ts (replaces middleware.ts on Next.js 16)
import { auth } from '@/lib/auth/server'

export default auth.middleware({
  loginUrl: '/login',
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my-hymns/:path*',
    '/hymn/:path*',
  ],
}
