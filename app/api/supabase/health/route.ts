import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminClient()
  const { count, error } = await supabase.from('notification_settings').select('id', { count: 'exact', head: true })
  if (error) return NextResponse.json({ status: 'error', error: 'Supabase database is unavailable.' }, { status: 503 })
  return NextResponse.json({ status: 'ok', database: 'supabase', notificationSettingsRows: count ?? 0 })
}
