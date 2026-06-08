//src/app/reset-password/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import wmscLogo from "../../../public/images/wmsclogo.jpg"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) setError("Invalid reset link.")
  }, [token])

  async function handleSubmit() {
    setError(null)

    if (!password || !confirm) {
      setError("Both fields are required.")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push("/login"), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-6">
      <Image src={wmscLogo} alt="WMSC Logo" className="h-16 w-auto" />
      <h1 className="text-2xl font-bold text-wmsc-blue">Reset Password</h1>

      {success ? (
        <p className="text-green-600 text-sm">Password reset successfully! Redirecting to login...</p>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <input
            type="password"
            placeholder="New password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="password"
            placeholder="Confirm new password..."
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="border rounded p-2"
          />

          {error && <p className="text-wmsc-red text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !token}
            className="
              bg-wmsc-blue hover:bg-wmsc-blue-hover
              text-white px-4 py-2 rounded
              shadow-[0_4px_0_0_#000c1f]
              active:translate-y-1
              active:shadow-[0_1px_0_0_#000c1f]
              transition-all duration-100
              disabled:opacity-50
            "
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  )
}