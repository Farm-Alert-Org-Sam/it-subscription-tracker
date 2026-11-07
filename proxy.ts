import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { db } from "@/lib/db"
import { workspaceMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const publicPaths = ["/login", "/reset-password", "/change-password", "/auth/callback", "/api/account/password-status", "/api/uptime", "/branding-request", "/api/branding-requests", "/api/onboarding/public"]
const pageAccess: Record<string, string> = {
  "/": "Dashboard", "/structure": "Admin center", "/api/workspace-members": "Admin center", "/api/catalog": "Catalog Manager", "/api/onboarding": "Onboarding Page Manager", "/subscriptions": "Subscriptions", "/cameras": "Camera status", "/backups": "Backup & recovery", "/uptime": "Website uptime", "/branding-requests": "Branding requests", "/onboarding": "Onboarding Page Manager", "/catalog-manager": "Catalog Manager", "/admin": "Admin center", "/attendance": "Employee Attendance Sign-In", "/settings": "Settings",
}

function requiredPage(path: string) { return Object.entries(pageAccess).find(([route]) => route === "/" ? path === route : path === route || path.startsWith(`${route}/`))?.[1] }

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (publicPaths.some((item) => path === item || path.startsWith(`${item}/`))) return NextResponse.next()

  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: (values) => values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, request.url))

  const required = requiredPage(path)
  if (required && user.email) {
    const [member] = await db.select({ role: workspaceMembers.role, accessPages: workspaceMembers.accessPages }).from(workspaceMembers).where(eq(workspaceMembers.email, user.email.trim().toLowerCase())).limit(1)
    const accessPages = Array.isArray(member?.accessPages) ? member.accessPages.filter((page): page is string => typeof page === "string") : []
    const hasExplicitAccess = Boolean(member && member.role !== "Admin" && accessPages.length > 0 && !accessPages.includes(required))
    if (hasExplicitAccess) return NextResponse.redirect(new URL(`/no-access?page=${encodeURIComponent(required)}`, request.url))
  }
  return response
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|farm-alert-logo\\.png|icon\\.png|apple-icon\\.png|branding-request(?:/.*)?|api/branding-requests(?:/.*)?|onboarding/[^/]+|api/onboarding/public(?:/.*)?|catalog(?:/.*)?|api/catalog/public(?:/.*)?).*)"] }
