"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, Copy, Plus, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface LicenseKey {
  id: string
  key: string
  label: string | null
  maxUses: number
  currentUses: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export function LicenseKeyManager({ initialKeys }: { initialKeys: LicenseKey[] }) {
  const [keys, setKeys] = useState<LicenseKey[]>(initialKeys)
  const [newLabel, setNewLabel] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()

  const createKey = async () => {
    setIsCreating(true)
    try {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel || undefined }),
      })
      const key = await res.json()
      setKeys([key, ...keys])
      setNewLabel("")
      router.refresh()
    } finally {
      setIsCreating(false)
    }
  }

  const revokeKey = async (id: string) => {
    await fetch(`/api/licenses/${id}`, { method: "PATCH" })
    setKeys(keys.map((k) => (k.id === id ? { ...k, isActive: false } : k)))
    router.refresh()
  }

  const deleteKey = async (id: string) => {
    await fetch(`/api/licenses/${id}`, { method: "DELETE" })
    setKeys(keys.filter((k) => k.id !== id))
    router.refresh()
  }

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">Label (optional)</label>
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. For John, For Sarah..."
          />
        </div>
        <Button onClick={createKey} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Key
        </Button>
      </div>

      {keys.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    {key.key}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyKey(key.id, key.key)}
                    >
                      {copiedId === key.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{key.label || "—"}</TableCell>
                <TableCell>
                  {key.currentUses} / {key.maxUses}
                </TableCell>
                <TableCell>
                  {key.isActive ? (
                    key.currentUses >= key.maxUses ? (
                      <span className="text-yellow-600">Used</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )
                  ) : (
                    <span className="text-red-500">Revoked</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(key.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {key.isActive && (
                      <Button variant="ghost" size="icon" onClick={() => revokeKey(key.id)} title="Revoke">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteKey(key.id)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {keys.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No license keys yet. Generate one to share with a friend.
        </p>
      )}
    </div>
  )
}
