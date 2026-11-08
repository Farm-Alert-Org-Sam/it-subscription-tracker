'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'

export function PasswordReset() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function requestCode(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setSaving(true)
    const response = await fetch('/api/auth/password-reset/request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) { setError(data.error ?? 'Unable to send a verification code.'); return }
    setStep('code'); setMessage(data.message)
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault(); setError(''); setSaving(true)
    const response = await fetch('/api/auth/password-reset/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, code, password }) })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) { setError(data.error ?? 'Unable to reset your password.'); return }
    setStep('done')
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f4f8f8] p-5"><form onSubmit={step === 'email' ? requestCode : verifyCode} className="w-full max-w-md rounded-2xl border border-[#e1e8e8] bg-white p-8 shadow-xl"><h1 className="text-2xl font-extrabold text-[#26343c]">{step === 'done' ? 'Password updated' : 'Reset password'}</h1><p className="mt-2 text-sm text-[#849097]">{step === 'email' ? 'Enter your account email and we will send a verification code.' : step === 'code' ? 'Enter the 6-digit code from your email and choose your new password.' : 'Your new password is active from now on.'}</p>{step === 'email' && <label className="mt-6 block text-xs font-bold">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm" required autoComplete="email" /></label>}{step === 'code' && <><label className="mt-6 block text-xs font-bold">Verification code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm tracking-[0.4em]" required autoComplete="one-time-code" /></label><label className="mt-4 block text-xs font-bold">New password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dce3e6] px-3 text-sm" required autoComplete="new-password" /></label></>}{message && <p className="mt-3 text-xs font-semibold text-[#25a878]">{message}</p>}{error && <p role="alert" className="mt-3 text-xs font-semibold text-[#c44857]">{error}</p>}{step !== 'done' && <button disabled={saving} className="mt-6 h-11 w-full rounded-lg bg-[#176b71] text-sm font-bold text-white disabled:opacity-60">{saving ? 'Please wait...' : step === 'email' ? 'Send verification code' : 'Update password'}</button>}{step === 'done' ? <Link href="/login" className="mt-6 block text-center text-sm font-bold text-[#176b71]">Continue to sign in</Link> : step === 'code' && <button type="button" onClick={() => { setStep('email'); setMessage(''); setError('') }} className="mt-4 w-full text-center text-xs font-bold text-[#176b71]">Use a different email</button>}</form></main>
}
