import { getCurrentUser } from "@/lib/auth"
import { deleteLicenseKey, revokeLicenseKey } from "@/lib/license"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await params
  const key = await revokeLicenseKey(id, user.id)
  return NextResponse.json(key)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { id } = await params
  await deleteLicenseKey(id, user.id)
  return NextResponse.json({ success: true })
}
