"use client"

import { useState, useEffect } from "react"

type Employee = {
  id: number
  firstName: string
  lastName: string
}

type ScannedItem = {
  itemId: number
  code: string
  size: string
  piece: string
}

export default function SignOutForm() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [itemCode, setItemCode] = useState("")
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch employees on page load
  useEffect(() => {
    async function fetchEmployees() {
      const res = await fetch("/api/employees")
      const data = await res.json()
      setEmployees(data)
    }
    fetchEmployees()
  }, [])

  // Handle barcode scan on Enter key
  async function handleItemCodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    e.preventDefault()
    setError(null)

    if (!itemCode.trim()) return

    const res = await fetch(`/api/items/code/${itemCode.trim()}`)

    if (!res.ok) {
        setError(`No item found with code "${itemCode}"`)
        setItemCode("")
        return
    }

    const item = await res.json()

    // Prevent duplicate scans in current session
    if (scannedItems.find((i) => i.itemId === item.id)) {
        setError("This item has already been scanned.")
        setItemCode("")
        return
    }

    // Check if item is already signed out in the database
    if (item.isSignedOut) {
        setError(`"${item.catalog.piece} (${item.size})" is already signed out to someone. It must be returned before signing out again.`)
        setItemCode("")
        return
    }

    setScannedItems((prev) => [
        ...prev,
        {
        itemId: item.id,
        code: item.code,
        size: item.size,
        piece: item.catalog.piece,
        },
    ])
    setItemCode("")
  }

  function removeItem(itemId: number) {
    setScannedItems((prev) => prev.filter((i) => i.itemId !== itemId))
  }

  async function handleSubmit() {
    setSubmitError(null)
    setSuccess(false)

    if (!selectedEmployeeId) {
        setSubmitError("Please select an employee before signing out.")
        return
    }

    if (scannedItems.length === 0) {
        setSubmitError("Please scan at least one item.")
        return
    }

    // Double-check all items are still available before creating any signouts
    const res = await fetch("/api/signouts/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: scannedItems.map((i) => i.itemId) }),
    })

    const { alreadySignedOut } = await res.json()

    if (alreadySignedOut.length > 0) {
        setSubmitError(
        `The following items are already signed out and must be removed: ${alreadySignedOut.join(", ")}`
        )
        return
    }

    // All clear — create signouts
    for (const item of scannedItems) {
        await fetch("/api/signouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            employeeId: Number(selectedEmployeeId),
            itemId: item.itemId,
            returned: false,
        }),
        })
    }

    setScannedItems([])
    setSelectedEmployeeId("")
    setSuccess(true)
    }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">

      {/* Employee Dropdown */}
      <select
        value={selectedEmployeeId}
        onChange={(e) => setSelectedEmployeeId(e.target.value)}
        className="border rounded p-2"
      >
        <option value="">Select an employee...</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.firstName} {emp.lastName}
          </option>
        ))}
      </select>

      {/* Barcode Input */}
      <input
        type="text"
        placeholder="Scan item barcode..."
        value={itemCode}
        onChange={(e) => setItemCode(e.target.value)}
        onKeyDown={handleItemCodeKeyDown}
        className="border rounded p-2"
      />

      {/* Scan error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Scanned Items List */}
      {scannedItems.length > 0 && (
        <ul className="border rounded p-2 flex flex-col gap-2">
          {scannedItems.map((item) => (
            <li key={item.itemId} className="flex justify-between items-center">
              <span>{item.piece} — {item.size} ({item.code})</span>
              <button
                onClick={() => removeItem(item.itemId)}
                className="text-red-500 text-sm ml-4"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Submit error */}
      {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

      {/* Success message */}
      {success && <p className="text-green-500 text-sm">Items signed out successfully!</p>}

      {/* Sign Out Button */}
      <button
        onClick={handleSubmit}
        className="bg-blue-300 rounded p-2"
      >
        Sign Out Items
      </button>
    </div>
  )
}