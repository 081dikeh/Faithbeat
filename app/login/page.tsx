// app/login/page.tsx
import { Suspense } from 'react'
import LoginForm from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
