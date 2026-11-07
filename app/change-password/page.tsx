'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!currentPassword || password.length < 8 || password !== confirmation) { setError('Use at least 8 characters and make both passwords match.'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setSaving(false); setError('Your session has expired. Please sign in again.'); return }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (signInError) { setSaving(false); setError('We could not change your password. Please sign in again and try once more.'); return }
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setSaving(false); setError('We could not change your password. Please try again.'); return }
    await fetch('/api/account/password-status', { method: 'PATCH' })
    router.replace('/')
    router.refresh()
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#092f35] p-5"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-8 shadow-2xl"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#176b71] text-lg font-black text-white">FA</div><h1 className="mt-5 text-center text-2xl font-extrabold text-[#183b3b]">Choose a new password</h1><p className="mt-2 text-center text-sm text-[#718089]">For security, replace the temporary password before continuing. Enter the temporary password once, then choose your own.</p><label className="mt-7 block text-sm font-bold text-[#26343c]">Temporary password<input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#dfe7e8] px-4" autoComplete="current-password" /></label><label className="mt-4 block text-sm font-bold text-[#26343c]">New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#dfe7e8] px-4" autoComplete="new-password" /></label><label className="mt-4 block text-sm font-bold text-[#26343c]">Confirm new password<input required minLength={8} type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#dfe7e8] px-4" autoComplete="new-password" /></label>{error && <p role="alert" className="mt-3 text-sm font-semibold text-[#c44857]">{error}</p>}<button disabled={saving} className="mt-6 h-12 w-full rounded-xl bg-[#176b71] text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Set new password'}</button></form></main>
}
