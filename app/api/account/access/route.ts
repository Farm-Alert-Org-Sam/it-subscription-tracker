import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { workspaceMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const [member] = await db.select({ role: workspaceMembers.role, accessPages: workspaceMembers.accessPages }).from(workspaceMembers).where(eq(workspaceMembers.email, session.user.email.trim().toLowerCase())).limit(1)
  const role = member?.role?.trim().toLowerCase()
  if (!member || role === "admin" || role === "super_admin" || role === "superadmin" || !Array.isArray(member.accessPages) || member.accessPages.length === 0) return NextResponse.json({ allPages: true })
  return NextResponse.json({ allPages: false, pages: member.accessPages.filter((page): page is string => typeof page === "string") })
}
