import { getCurrentUser } from "@/lib/auth"
import { createLicenseKey, getLicenseKeys } from "@/lib/license"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const keys = await getLicenseKeys(user.id)
  return NextResponse.json(keys)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const body = await request.json()
  const key = await createLicenseKey(user.id, body.label, body.maxUses || 1)
  return NextResponse.json(key)
}
