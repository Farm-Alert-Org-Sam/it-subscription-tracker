import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notificationSettings } from '@/lib/db/schema'

const validEmails = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((email): email is string => typeof email === 'string' && email.trim().includes('@')).map((email) => email.trim()))] : []
export async function POST(request: Request) { const session = await auth.api.getSession({ headers: request.headers }); if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const { email } = await request.json(); if (typeof email !== 'string' || !email.trim().includes('@')) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 }); const [settings] = await db.select({ id: notificationSettings.id, subscriptionAlertEmails: notificationSettings.subscriptionAlertEmails }).from(notificationSettings).orderBy(desc(notificationSettings.updatedAt)).limit(1); const emails = [...new Set([...validEmails(settings?.subscriptionAlertEmails), email.trim()])]; if (settings) await db.update(notificationSettings).set({ subscriptionAlertEmails: emails, updatedAt: new Date() }).where(eq(notificationSettings.id, settings.id)); else await db.insert(notificationSettings).values({ subscriptionAlertEmails: emails }); return NextResponse.json({ ok: true, subscriptionAlertEmails: emails }) }
