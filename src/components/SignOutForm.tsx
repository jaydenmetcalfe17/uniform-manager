// src/components/SignOutForm.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { FaTrashAlt } from "react-icons/fa"
import type { Employee, ScannedSignOutItem, SignOutResult } from "@/types"



export default function SignOutForm() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [itemCode, setItemCode] = useState("")
  const [scannedItems, setScannedItems] = useState<ScannedSignOutItem[]>([])
  const [scanError, setScanError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<SignOutResult | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const itemCodeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchEmployees() {
      const res = await fetch("/api/employees")
      const data = await res.json()
      setEmployees(data)
    }
    fetchEmployees()
  }, [])

  function refocusInput() {
    itemCodeInputRef.current?.focus()
  }

  async function handleItemCodeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const code = itemCode.trim()

    if (!code) return

    setScanError(null)
    setSubmitError(null)
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

    if (item.isSignedOut) {
      setScannedItems((prev) => [
        ...prev,
        {
          code,
          itemId: item.id,
          piece: item.catalogue.piece,
          size: item.size,
          condition: item.condition || "",
          error: "Already signed out to someone",
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

  function removeItem(code: string) {
    setScannedItems((prev) => prev.filter((i) => i.code !== code))
  }

  async function handleSubmit() {
    setSubmitError(null)
    setResult(null)
    setSubmitted(false)

    if (!selectedEmployeeId) {
      setSubmitError("Please select an employee before signing out.")
      return
    }

    const toSignOut = scannedItems.filter((i) => !i.error)

    if (toSignOut.length === 0 && scannedItems.length === 0) {
      setSubmitError("Please scan at least one item.")
      return
    }

    const succeeded: ScannedSignOutItem[] = []
    const failed: ScannedSignOutItem[] = [...scannedItems.filter((i) => i.error)]

    // Double-check each item is still available
    for (const item of toSignOut) {
      const res = await fetch(`/api/items/code/${item.code}`)

      if (!res.ok) {
        failed.push({ ...item, error: "Item no longer found" })
        continue
      }

      const data = await res.json()

      if (data.isSignedOut) {
        failed.push({ ...item, error: "Already signed out to someone" })
        continue
      }

      const signOutRes = await fetch("/api/signouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: Number(selectedEmployeeId),
          itemId: item.itemId,
          returned: false,
        }),
      })

      if (!signOutRes.ok) {
        failed.push({ ...item, error: "Failed to sign out" })
      } else {
        succeeded.push(item)
      }
    }

    setResult({ succeeded, failed })
    setSubmitted(true)
    setScannedItems([])

    if (succeeded.length > 0) setSelectedEmployeeId("")
    
    refocusInput()
  }

  const goodItems = scannedItems.filter((i) => !i.error)
  const badItems = scannedItems.filter((i) => i.error)

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <h1>Sign Out</h1>

      <select
        value={selectedEmployeeId}
        onChange={(e) => setSelectedEmployeeId(e.target.value)}
        className="border rounded p-2"
      >
        <option value="">Select an employee...</option>
        {[...employees]
          .sort((a, b) =>
            a.lastName.localeCompare(b.lastName) ||
            a.firstName.localeCompare(b.firstName)
          )
          .map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
      </select>

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

      {scanError && (
        <p className="text-wmsc-red text-sm">{scanError}</p>
      )}

      {scannedItems.length > 0 && (
        <ul className="border rounded p-2 flex flex-col gap-2">
          {goodItems.map((item) => (
            <li key={item.code} className="flex justify-between items-center">
              <span>{item.piece} — {item.size} ({item.code}) - {item.condition}</span>
              <button
                onClick={() => removeItem(item.code)}
                className="text-wmsc-red ml-4"
              >
                <span className="text-lg"><FaTrashAlt /></span>
              </button>
            </li>
          ))}

          {badItems.map((item) => (
            <li key={item.code} className="flex justify-between items-center">
              <span className="text-wmsc-red text-sm">
                {item.piece
                  ? `${item.piece} — ${item.size} (${item.code})`
                  : item.code} — {item.error}
              </span>
              <button
                onClick={() => removeItem(item.code)}
                className="text-wmsc-red ml-4"
              >
                <span className="text-lg"><FaTrashAlt /></span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {submitError && (
        <p className="text-wmsc-red text-sm">{submitError}</p>
      )}

      {submitted && result && (
        <div className="flex flex-col gap-3">
          {result.succeeded.length > 0 && (
            <div>
              <p className="text-green-600 text-sm font-medium mb-1">
                Successfully signed out:
              </p>
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
              <p className="text-wmsc-red text-sm font-medium mb-1">
                Could not sign out:
              </p>
              <ul className="text-sm flex flex-col gap-1">
                {result.failed.map((item) => (
                  <li key={item.code} className="text-wmsc-red">
                    ✗ {item.piece
                      ? `${item.piece} — ${item.size} (${item.code})`
                      : item.code} — {item.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
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
        Sign Out Items
      </button>
    </div>
  )
}