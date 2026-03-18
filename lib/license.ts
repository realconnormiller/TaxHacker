import { prisma } from "@/lib/db"
import crypto from "crypto"

export function generateLicenseKey(): string {
  const segments = []
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(2).toString("hex").toUpperCase())
  }
  return segments.join("-")
}

export async function createLicenseKey(createdById: string, label?: string, maxUses: number = 1) {
  const key = generateLicenseKey()
  return prisma.licenseKey.create({
    data: {
      key,
      label: label || null,
      createdById,
      maxUses,
      isActive: true,
    },
  })
}

export async function validateLicenseKey(key: string): Promise<{ valid: boolean; error?: string }> {
  const license = await prisma.licenseKey.findUnique({
    where: { key },
  })

  if (!license) {
    return { valid: false, error: "Invalid license key" }
  }

  if (!license.isActive) {
    return { valid: false, error: "This license key has been deactivated" }
  }

  if (license.expiresAt && license.expiresAt < new Date()) {
    return { valid: false, error: "This license key has expired" }
  }

  if (license.currentUses >= license.maxUses) {
    return { valid: false, error: "This license key has already been used" }
  }

  return { valid: true }
}

export async function claimLicenseKey(key: string, userId: string) {
  return prisma.licenseKey.update({
    where: { key },
    data: {
      currentUses: { increment: 1 },
      claimedById: userId,
    },
  })
}

export async function getLicenseKeys(createdById: string) {
  return prisma.licenseKey.findMany({
    where: { createdById },
    orderBy: { createdAt: "desc" },
  })
}

export async function revokeLicenseKey(id: string, createdById: string) {
  return prisma.licenseKey.update({
    where: { id, createdById },
    data: { isActive: false },
  })
}

export async function deleteLicenseKey(id: string, createdById: string) {
  return prisma.licenseKey.delete({
    where: { id, createdById },
  })
}
