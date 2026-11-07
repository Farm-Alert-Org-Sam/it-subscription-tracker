import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspaceMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const publicPaths = ["/login", "/reset-password", "/change-password", "/api/auth", "/api/account/password-status", "/api/uptime", "/branding-request", "/api/branding-requests", "/api/onboarding/public"]
const pageAccess: Record<string, string> = {
  "/": "Dashboard", "/structure": "Admin center", "/api/workspace-members": "Admin center", "/api/catalog": "Catalog Manager", "/api/onboarding": "Onboarding Page Manager", "/subscriptions": "Subscriptions", "/cameras": "Camera status", "/backups": "Backup & recovery", "/uptime": "Website uptime", "/branding-requests": "Branding requests", "/onboarding": "Onboarding Page Manager", "/catalog-manager": "Catalog Manager", "/admin": "Admin center", "/attendance": "Employee Attendance Sign-In", "/settings": "Settings",
}

function requiredPage(path: string) { return Object.entries(pageAccess).find(([route]) => route === "/" ? path === route : path === route || path.startsWith(`${route}/`))?.[1] }

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (publicPaths.some((item) => path === item || path.startsWith(`${item}/`))) return NextResponse.next()
  const sessionCookie = request.cookies.get("better-auth.session_token") ?? request.cookies.get("__Secure-better-auth.session_token") ?? request.cookies.get("better-auth.session-token")
  if (!sessionCookie) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, request.url))
  const required = requiredPage(path)
  if (required) {
    const session = await auth.api.getSession({ headers: request.headers })
    const email = session?.user?.email?.trim().toLowerCase()
    if (email) {
      const [member] = await db.select({ role: workspaceMembers.role, accessPages: workspaceMembers.accessPages }).from(workspaceMembers).where(eq(workspaceMembers.email, email)).limit(1)
      const accessPages = Array.isArray(member?.accessPages) ? member.accessPages.filter((page): page is string => typeof page === "string") : []
      const hasExplicitAccess = Boolean(member && member.role !== "Admin" && accessPages.length > 0 && !accessPages.includes(required))
      if (hasExplicitAccess) return NextResponse.redirect(new URL(`/no-access?page=${encodeURIComponent(required)}`, request.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|farm-alert-logo\.png|icon\.png|apple-icon\.png|branding-request(?:/.*)?|api/branding-requests(?:/.*)?|onboarding/[^/]+|api/onboarding/public(?:/.*)?|catalog(?:/.*)?|api/catalog/public(?:/.*)?).*)"] }
