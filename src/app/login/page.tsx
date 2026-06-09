//src/app/login/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import wmscLogo from "../../../public/images/wmsclogo.jpg"

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push("/")
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") await handleSubmit()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-6 px-4">
      <Image src={wmscLogo} alt="WMSC Logo" className="h-16 w-auto" />
      <h1 className="text-2xl font-bold text-wmsc-blue">Uniform Manager</h1>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="password"
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border rounded p-2"
        />

        {error && <p className="text-wmsc-red text-sm">{error}</p>}

        {/* UNCOMMENT WHEN SETTING UP FORGOT PASSWORD FUNCTIONALITY!!
        <button
          onClick={async () => {
            await fetch("/api/auth/forgot-password", { method: "POST" })
            alert("If an account exists, a reset link has been sent to info@wmsc.info")
          }}
          className="text-sm text-gray-500 hover:text-wmsc-blue text-left"
        >
          Forgot password?
        </button>
        */}

        <button
          onClick={handleSubmit}
          disabled={loading}
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
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  )
}