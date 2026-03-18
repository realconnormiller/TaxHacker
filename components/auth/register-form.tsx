"use client"

import { FormError } from "@/components/forms/error"
import { FormInput } from "@/components/forms/simple"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function RegisterForm({ requireLicenseKey }: { requireLicenseKey: boolean }) {
  const [email, setEmail] = useState("")
  const [licenseKey, setLicenseKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, licenseKey: licenseKey || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/enter"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-green-600">Account created!</p>
        <p className="text-muted-foreground">Redirecting you to login...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <FormInput
        title="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {requireLicenseKey && (
        <FormInput
          title="License Key"
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          required
        />
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      {error && <FormError className="text-center">{error}</FormError>}

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <a href="/enter" className="underline">
          Log in
        </a>
      </p>
    </form>
  )
}
