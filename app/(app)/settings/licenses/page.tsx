import { getCurrentUser } from "@/lib/auth"
import { getLicenseKeys } from "@/lib/license"
import { redirect } from "next/navigation"
import { LicenseKeyManager } from "@/components/settings/license-key-manager"

export default async function LicenseKeysSettingsPage() {
  const user = await getCurrentUser()

  if (!user.isAdmin) {
    redirect("/settings")
  }

  const keys = await getLicenseKeys(user.id)
  const serializedKeys = keys.map((k) => ({
    ...k,
    expiresAt: k.expiresAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }))

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-2">License Keys</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-prose">
        Generate license keys to give friends and colleagues access to register on this instance.
        Each key can be used once (or multiple times if you set a higher limit).
      </p>

      <LicenseKeyManager initialKeys={serializedKeys} />
    </div>
  )
}
