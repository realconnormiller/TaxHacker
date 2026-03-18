import config from "@/lib/config"
import { prisma } from "@/lib/db"
import { claimLicenseKey, validateLicenseKey } from "@/lib/license"
import { createUserDefaults } from "@/models/defaults"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { email, licenseKey } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 400 })
  }

  // Check if this is the first user (they become admin, no key needed)
  const userCount = await prisma.user.count()
  const isFirstUser = userCount === 0

  if (!isFirstUser && config.auth.requireLicenseKey) {
    if (!licenseKey) {
      return NextResponse.json({ error: "A license key is required to register" }, { status: 400 })
    }

    const validation = await validateLicenseKey(licenseKey)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
  }

  // Create the user
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: normalizedEmail.split("@")[0],
      isAdmin: isFirstUser,
      licenseKey: isFirstUser ? null : licenseKey || null,
      membershipPlan: "unlimited",
      storageLimit: -1,
      aiBalance: -1,
    },
  })

  // Create defaults
  await createUserDefaults(user.id)

  // Claim the license key
  if (!isFirstUser && licenseKey) {
    await claimLicenseKey(licenseKey, user.id)
  }

  return NextResponse.json({ success: true, isAdmin: isFirstUser })
}
