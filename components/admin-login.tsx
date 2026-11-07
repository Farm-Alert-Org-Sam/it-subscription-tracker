"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState("FA-Tech-Team")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    const normalizedUsername = username.trim()
    const email = normalizedUsername.toLowerCase() === "fa-tech-team" ? "sammyfemi18@gmail.com" : normalizedUsername.toLowerCase()
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError("Invalid admin credentials.")
      return
    }
    const statusResponse = await fetch('/api/account/password-status', { cache: 'no-store' })
    const status = statusResponse.ok ? await statusResponse.json() : { mustChangePassword: false }
    router.replace(status.mustChangePassword ? '/change-password' : '/')
    router.refresh()
  }

  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#092f35] p-5"><div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-[#44c985]/25 blur-3xl" /><div className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-[#176b71]/50 blur-3xl" /><form onSubmit={submit} className="relative w-full max-w-md rounded-[2rem] border border-white/20 bg-white/10 p-8 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#176b71] text-white"><span className="text-lg font-black">FA</span></div><h1 className="mt-5 text-center text-2xl font-extrabold text-[#26343c]">Admin sign in</h1><p className="mt-2 text-center text-sm text-white/70">Sign in to access the farm alert IT dashboard.</p><label className="mt-6 block text-xs font-bold text-white/85">Username or email<input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/30 bg-white/90 px-4 text-sm text-[#183b3b] shadow-inner outline-none transition focus:border-[#61d89d] focus:ring-4 focus:ring-[#61d89d]/20" autoComplete="username" required /></label><label className="mt-4 block text-xs font-bold text-[#26343c]">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 h-12 w-full rounded-xl border border-white/30 bg-white/90 px-4 text-sm text-[#183b3b] shadow-inner outline-none transition focus:border-[#61d89d] focus:ring-4 focus:ring-[#61d89d]/20" autoComplete="current-password" required /></label>{error && <p role="alert" className="mt-3 text-xs font-semibold text-[#c44857]">{error}</p>}<button disabled={loading} className="tactile-control mt-6 h-12 w-full rounded-xl bg-[#176b71] text-sm font-bold text-white disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button><Link href="/reset-password" className="mt-4 block text-center text-xs font-bold text-[#8de0ae] hover:underline">Forgot password?</Link></form></main>
}
