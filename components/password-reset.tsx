'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PasswordReset() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recoveryMode = searchParams.get('mode') === 'update'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const supabase = createClient()
    if (recoveryMode) {
      if (password.length < 8 || password !== confirmation) {
        setSaving(false)
        setError('Use at least 8 characters and make both passwords match.')
        return
      }
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) setError('Unable to update your password. Please request a new reset link.')
      else router.replace('/login')
    } else {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password?mode=update')}`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (resetError) setError('Unable to request a reset link. Please try again.')
      else setSent(true)
    }
    setSaving(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f4f8f8] p-5"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-[#e1e8e8] bg-white p-8 shadow-xl"><h1 className="text-2xl font-extrabold text-[#26343c]">{recoveryMode ? 'Choose a new password' : 'Reset password'}</h1><p className="mt-2 text-sm text-[#849097]">{recoveryMode ? 'Choose a new password for your Farm Alert account.' : "We'll send a reset link if the account exists."}</p>{recoveryMode ? <><label className="mt-6 block text-xs font-bold">New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm" autoComplete="new-password" /></label><label className="mt-4 block text-xs font-bold">Confirm new password<input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm" autoComplete="new-password" /></label></> : <label className="mt-6 block text-xs font-bold">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm" required autoComplete="email" /></label>}{sent && <p className="mt-3 text-xs font-semibold text-[#25a878]">If the account exists, a reset link has been sent.</p>}{error && <p role="alert" className="mt-3 text-xs font-semibold text-[#c44857]">{error}</p>}<button disabled={saving} className="mt-6 h-11 w-full rounded-lg bg-[#176b71] text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : recoveryMode ? 'Update password' : 'Send reset link'}</button><Link href="/login" className="mt-4 block text-center text-xs font-bold text-[#176b71]">Back to sign in</Link></form></main>
}
