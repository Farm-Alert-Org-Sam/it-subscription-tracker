import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { websiteUptimeStatus } from '@/lib/db/schema'

// n8n posts here directly; dashboard reads remain protected by the authenticated UI.
const defaultUserId = 'dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: 'GET, POST, OPTIONS' } })
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(websiteUptimeStatus).where(eq(websiteUptimeStatus.userId, defaultUserId)).orderBy(desc(websiteUptimeStatus.receivedAt))
  const latest = Array.from(new Map(rows.map((row) => [row.websiteUrl, row])).values()).sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  return NextResponse.json({ websites: latest }, { headers: { 'Cache-Control': 'no-store' } })
}

function optionalText(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  return String(value)
}

function optionalInteger(value: unknown) {
  if (value === undefined || value === null || value === '') return null
  const number = Number(value)
  return Number.isNaN(number) ? null : number
}

function getCauseDetails(error: unknown) {
  if (typeof error !== 'object' || error === null) return { message: 'Database write failed.', code: undefined }
  const cause = 'cause' in error && typeof error.cause === 'object' && error.cause !== null ? error.cause : error
  const details = cause as { message?: unknown; code?: unknown }
  return {
    message: typeof details.message === 'string' ? details.message : 'Database write failed.',
    code: typeof details.code === 'string' ? details.code : undefined,
  }
}

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const items = Array.isArray(body?.websites) ? body.websites : Array.isArray(body?.data) ? body.data : body?.site ? [body.site] : [body]
  if (!items.length) return NextResponse.json({ error: 'At least one website status is required.' }, { status: 400 })

  const values = []
  for (const item of items) {
    if (!item || typeof item !== 'object') return NextResponse.json({ error: 'Each website status must be an object.' }, { status: 400 })

    const websiteUrl = String(item.website_url ?? item.url ?? item.websiteUrl ?? '').trim()
    if (!websiteUrl) return NextResponse.json({ error: 'website_url is required.' }, { status: 400 })

    const status = String(item.status ?? '').trim().toLowerCase()
    if (status !== 'online' && status !== 'offline') {
      return NextResponse.json({ error: 'status must be either "online" or "offline".' }, { status: 400 })
    }

    const parsedCheckedAt = new Date(item.checked_at ?? item.checkedAt ?? new Date())
    values.push({
      userId: String(item.user_id ?? item.userId ?? defaultUserId).trim() || defaultUserId,
      websiteName: String(item.website_name ?? item.name ?? item.websiteName ?? websiteUrl).trim() || websiteUrl,
      websiteUrl,
      status,
      errorMessage: optionalText(item.error_message ?? item.errorMessage ?? item.error),
      httpStatus: optionalInteger(item.http_status ?? item.httpStatus),
      responseTimeMs: optionalInteger(item.response_time_ms ?? item.responseTimeMs),
      checkedAt: Number.isNaN(parsedCheckedAt.getTime()) ? new Date() : parsedCheckedAt,
    })
  }

  try {
    const saved = []
    for (const value of values) {
      const [row] = await db.insert(websiteUptimeStatus).values(value).onConflictDoUpdate({
        target: [websiteUptimeStatus.userId, websiteUptimeStatus.websiteUrl],
        set: {
          websiteName: value.websiteName,
          status: value.status,
          errorMessage: value.errorMessage,
          httpStatus: value.httpStatus,
          responseTimeMs: value.responseTimeMs,
          checkedAt: value.checkedAt,
          receivedAt: new Date(),
        },
      }).returning()
      saved.push(row)
    }
    return NextResponse.json({ ok: true, received: saved.length, websites: saved })
  } catch (error) {
    const details = getCauseDetails(error)
    console.error('[v0] uptime database write failed:', { message: details.message, code: details.code })
    return NextResponse.json({ error: details.message }, { status: 500 })
  }
}
