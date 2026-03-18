import { validateLicenseKey } from "@/lib/license"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { key } = await request.json()

  if (!key) {
    return NextResponse.json({ valid: false, error: "License key is required" })
  }

  const result = await validateLicenseKey(key)
  return NextResponse.json(result)
}
