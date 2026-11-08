import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!email || !/^\d{6}$/.test(code) || password.length < 8) return NextResponse.json({ error: 'Enter a valid code and a password of at least 8 characters.' }, { status: 400 })
  const supabase = createAdminClient()
  const { data: otp } = await supabase.from('password_reset_otps').select('id, code_hash, expires_at, attempts').eq('email', email).is('consumed_at', null).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!otp || new Date(otp.expires_at).getTime() < Date.now() || otp.attempts >= 5) return NextResponse.json({ error: 'That code is invalid or expired.' }, { status: 400 })
  const supplied = createHash('sha256').update(code).digest('hex')
  const valid = timingSafeEqual(Buffer.from(supplied), Buffer.from(otp.code_hash))
  if (!valid) {
    await supabase.from('password_reset_otps').update({ attempts: otp.attempts + 1 }).eq('id', otp.id)
    return NextResponse.json({ error: 'That code is invalid or expired.' }, { status: 400 })
  }
  const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const user = users?.users.find((candidate) => candidate.email?.toLowerCase() === email)
  if (!user) return NextResponse.json({ error: 'That code is invalid or expired.' }, { status: 400 })
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password })
  if (updateError) return NextResponse.json({ error: 'Unable to update your password. Please try again.' }, { status: 500 })
  await supabase.from('password_reset_otps').update({ consumed_at: new Date().toISOString() }).eq('id', otp.id)
  return NextResponse.json({ success: true })
}
