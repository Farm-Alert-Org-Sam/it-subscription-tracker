import { Suspense } from 'react'
import { PasswordReset } from '@/components/password-reset'

export default function Page() {
  return <Suspense fallback={null}><PasswordReset /></Suspense>
}
