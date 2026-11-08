import { NextResponse } from 'next/server'
import { createHash, randomInt } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendResendEmail } from '@/lib/resend'

const genericResponse = { message: 'If an account exists for that email, a verification code has been sent.' }

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || !email.includes('@')) return NextResponse.json(genericResponse)
  const supabase = createAdminClient()
  const now = new Date()
  const { data: recent } = await supabase.from('password_reset_otps').select('created_at').eq('email', email).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (recent && Date.now() - new Date(recent.created_at).getTime() < 60_000) return NextResponse.json(genericResponse)
  const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (!users?.users.some((user) => user.email?.toLowerCase() === email)) return NextResponse.json(genericResponse)
  const code = String(randomInt(100000, 1000000))
  const { error: insertError } = await supabase.from('password_reset_otps').insert({ email, code_hash: createHash('sha256').update(code).digest('hex'), expires_at: new Date(Date.now() + 10 * 60_000).toISOString(), request_ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null })
  if (insertError) return NextResponse.json({ error: 'Unable to send a verification code.' }, { status: 500 })
  try {
    await sendResendEmail({ to: [email], subject: 'Farm Alert password reset code', html: `<p>Your Farm Alert verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>` })
  } catch {
    return NextResponse.json({ error: 'Unable to send a verification code.' }, { status: 503 })
  }
  return NextResponse.json(genericResponse)
}
