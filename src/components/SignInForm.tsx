//src/components/SignInForm.tsx

"use client"

import { useRef, useState } from "react"
import { FaTrashAlt } from "react-icons/fa"
import type { ScannedSignInItem, SignInResult } from "@/types"

export default function SignInForm() {
  const [itemCode, setItemCode] = useState("")
  const [scannedItems, setScannedItems] = useState<ScannedSignInItem[]>([])
  const [scanError, setScanError] = useState<string | null>(null)
  const [result, setResult] = useState<SignInResult | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const itemCodeInputRef = useRef<HTMLInputElement>(null)

  function refocusInput() {
    itemCodeInputRef.current?.focus()
  }

  async function handleItemCodeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const code = itemCode.trim()

    if (!code) return

    setScanError(null)
    setResult(null)
    setSubmitted(false)

    if (scannedItems.find((i) => i.code === code)) {
      setScanError("This item has already been scanned.")
      setItemCode("")
      refocusInput()
      return
    }

    const res = await fetch(`/api/items/code/${code}`)

    if (!res.ok) {
      setScannedItems((prev) => [
        ...prev,
        { code, error: "Item not found" }
      ])
      setItemCode("")
      refocusInput()
      return
    }

    const item = await res.json()

    if (!item.isSignedOut) {
      setScannedItems((prev) => [
        ...prev,
        {
          code,
          itemId: item.id,
          piece: item.catalogue.piece,
          size: item.size,
          condition: item.condition || "",
          error: "Not currently signed out",
        }
      ])
      setItemCode("")
      refocusInput()
      return
    }

    setScannedItems((prev) => [
      ...prev,
      {
        code,
        itemId: item.id,
        piece: item.catalogue.piece,
        size: item.size,
        condition: item.condition || "",
      }
    ])

    setItemCode("")
    refocusInput()
  }
  // async function handleItemCodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  //   if (e.key !== "Enter") return
  //   e.preventDefault()
  //   setScanError(null)
  //   setResult(null)
  //   setSubmitted(false)

  //   if (!itemCode.trim()) return

  //   if (scannedItems.find((i) => i.code === itemCode.trim())) {
  //     setScanError("This item has already been scanned.")
  //     setItemCode("")
  //     return
  //   }

  //   const res = await fetch(`/api/items/code/${itemCode.trim()}`)

  //   if (!res.ok) {
  //     setScannedItems((prev) => [...prev, { code: itemCode.trim(), error: "Item not found" }])
  //     setItemCode("")
  //     return
  //   }

  //   const item = await res.json()

  //   if (!item.isSignedOut) {
  //     setScannedItems((prev) => [...prev, {
  //       code: itemCode.trim(),
  //       itemId: item.id,
  //       piece: item.catalogue.piece,
  //       size: item.size,
  //       error: "Not currently signed out",
  //     }])
  //     setItemCode("")
  //     return
  //   }

  //   setScannedItems((prev) => [...prev, {
  //     code: itemCode.trim(),
  //     itemId: item.id,
  //     piece: item.catalogue.piece,
  //     size: item.size,
  //   }])
  //   setItemCode("")
  // }

  function removeItem(code: string) {
    setScannedItems((prev) => prev.filter((i) => i.code !== code))
  }

  async function handleSignIn() {
    setResult(null)
    setSubmitted(false)

    if (scannedItems.length === 0) return

    const succeeded: ScannedSignInItem[] = []
    const failed: ScannedSignInItem[] = [...scannedItems.filter((i) => i.error)]
    const toSignIn = scannedItems.filter((i) => !i.error)

    for (const item of toSignIn) {
      // Re-check item is still signed out
      const res = await fetch(`/api/items/code/${item.code}`)
      const data = await res.json()

      if (!data.isSignedOut) {
        failed.push({ ...item, error: "No longer signed out" })
        continue
      }

      // Get active signout
      const signOutRes = await fetch(`/api/signouts/active/${item.itemId}`)

      if (!signOutRes.ok) {
        failed.push({ ...item, error: "Could not find active sign out" })
        continue
      }

      const signOut = await signOutRes.json()

      const updateRes = await fetch(`/api/signouts/${signOut.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returned: true,
          signedInAt: new Date().toISOString(),
        })
      })

      if (!updateRes.ok) {
        failed.push({ ...item, error: "Failed to sign in" })
      } else {
        succeeded.push(item)
      }
    }

    setResult({ succeeded, failed })
    setSubmitted(true)
    setScannedItems([])
  }

  const goodItems = scannedItems.filter((i) => !i.error)
  const badItems = scannedItems.filter((i) => i.error)

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <h1>Sign In</h1>

      {/* <input
        type="text"
        placeholder="Scan item barcode..."
        value={itemCode}
        onChange={(e) => setItemCode(e.target.value)}
        onKeyDown={handleItemCodeKeyDown}
        className="border rounded p-2"
      /> */}
      <form onSubmit={handleItemCodeSubmit} className="flex gap-2">
        <input
          ref={itemCodeInputRef}
          type="text"
          placeholder="Scan item barcode..."
          value={itemCode}
          onChange={(e) => setItemCode(e.target.value)}
          className="border rounded p-2 flex-1"
          autoFocus
        />

        <button
          type="submit"
          className="flex items-center gap-2
                  bg-wmsc-blue hover:bg-wmsc-blue-hover text-white 
                  px-4 py-2 rounded 
                  shadow-[0_4px_0_0_#000c1f]
                  active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
                  transition-all duration-100"
          >
          Add
        </button>
      </form>

      {scanError && <p className="text-wmsc-red text-sm">{scanError}</p>}

      {/* Scanned items list */}
      {scannedItems.length > 0 && (
        <ul className="border rounded p-2 flex flex-col gap-2">
          {goodItems.map((item) => (
            <li key={item.code} className="flex justify-between items-center">
              <span>{item.piece} — {item.size} ({item.code}) - {item.condition}</span>
              <button onClick={() => removeItem(item.code)} className="text-wmsc-red ml-4">
                <span className="text-lg"><FaTrashAlt /></span>
              </button>
            </li>
          ))}
          {badItems.map((item) => (
            <li key={item.code} className="flex justify-between items-center">
              <span className="text-wmsc-red text-sm">
                {item.code} — {item.error}
              </span>
              <button onClick={() => removeItem(item.code)} className="text-wmsc-red ml-4">
                <span className="text-lg"><FaTrashAlt /></span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Results after submission */}
      {submitted && result && (
        <div className="flex flex-col gap-3">
          {result.succeeded.length > 0 && (
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">Successfully signed in:</p>
              <ul className="text-sm flex flex-col gap-1">
                {result.succeeded.map((item) => (
                  <li key={item.code} className="text-green-600">
                    ✓ {item.piece} — {item.size} ({item.code})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.failed.length > 0 && (
            <div>
              <p className="text-wmsc-red text-sm font-medium mb-1">Could not sign in:</p>
              <ul className="text-sm flex flex-col gap-1">
                {result.failed.map((item) => (
                  <li key={item.code} className="text-wmsc-red">
                    ✗ {item.code} — {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSignIn}
        className="
          bg-wmsc-blue hover:bg-wmsc-blue-hover
          text-white
          px-4 py-2 rounded
          shadow-[0_4px_0_0_#000c1f]
          active:translate-y-1
          active:shadow-[0_1px_0_0_#000c1f]
          transition-all duration-100
        "
      >
        Sign In Items
      </button>
    </div>
  )
}