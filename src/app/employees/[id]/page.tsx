//src/app/employees/[id]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FaTrashAlt } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"
import type { SignOutWithDetails, Employee, ScannedItem } from "@/types"

type EmployeeWithSignOuts = Employee & {
  signOuts: SignOutWithDetails[]
}

type EmployeeForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeWithSignOuts | null>(null)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState<EmployeeForm>({ firstName: "", lastName: "", email: "", phone: "" })
  const [editError, setEditError] = useState<string | null>(null)

  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [itemCode, setItemCode] = useState("")
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
  const [scanError, setScanError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function fetchEmployee() {
    const res = await fetch(`/api/employees/${id}`)
    setEmployee(await res.json())
  }

  useEffect(() => { fetchEmployee() }, [id])

  async function handleSignIn(signOutId: number) {
    if (!confirm("Mark this item as returned?")) return
    await fetch(`/api/signouts/${signOutId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returned: true, signedInAt: new Date().toISOString() })
    })
    fetchEmployee()
  }

  async function handleDelete(signOutId: number) {
    if (!confirm("Are you sure you want to delete this sign out record?")) return
    await fetch(`/api/signouts/${signOutId}`, { method: "DELETE" })
    fetchEmployee()
  }

  function openEdit() {
    if (!employee) return
    setEditForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
    })
    setEditError(null)
    setShowEditModal(true)
  }

  async function handleEditSubmit() {
    setEditError(null)
    if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.phone) {
      setEditError("All fields are required.")
      return
    }

    const res = await fetch(`/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm)
    })

    if (!res.ok) {
      setEditError("Failed to save. Email may already be in use.")
      return
    }

    setShowEditModal(false)
    fetchEmployee()
  }

  async function handleDeleteEmployee() {
    if (!confirm("Are you sure you want to delete this employee? This cannot be undone.")) return
    await fetch(`/api/employees/${id}`, { method: "DELETE" })
    router.push("/employees")
  }

  function openSignOut() {
    setScannedItems([])
    setItemCode("")
    setScanError(null)
    setSubmitError(null)
    setSuccess(false)
    setShowSignOutModal(true)
  }

  async function handleItemCodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    e.preventDefault()
    setScanError(null)

    if (!itemCode.trim()) return

    const res = await fetch(`/api/items/code/${itemCode.trim()}`)

    if (!res.ok) {
      setScanError(`No item found with code "${itemCode}"`)
      setItemCode("")
      return
    }

    const item = await res.json()

    if (scannedItems.find((i) => i.itemId === item.id)) {
      setScanError("This item has already been scanned.")
      setItemCode("")
      return
    }

    if (item.isSignedOut) {
      setScanError(`"${item.catalogue.piece} (${item.size})" is already signed out and must be returned first.`)
      setItemCode("")
      return
    }

    setScannedItems((prev) => [
      ...prev,
      { itemId: item.id, code: item.code, size: item.size, piece: item.catalogue.piece }
    ])
    setItemCode("")
  }

  function removeScannedItem(itemId: number) {
    setScannedItems((prev) => prev.filter((i) => i.itemId !== itemId))
  }

  async function handleSignOutSubmit() {
    setSubmitError(null)
    setSuccess(false)

    if (scannedItems.length === 0) {
      setSubmitError("Please scan at least one item.")
      return
    }

    const checkRes = await fetch("/api/signouts/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: scannedItems.map((i) => i.itemId) }),
    })

    const { alreadySignedOut } = await checkRes.json()

    if (alreadySignedOut.length > 0) {
      setSubmitError(`Already signed out and must be removed: ${alreadySignedOut.join(", ")}`)
      return
    }

    for (const item of scannedItems) {
      await fetch("/api/signouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: Number(id), itemId: item.itemId, returned: false }),
      })
    }

    setScannedItems([])
    setSuccess(true)
    fetchEmployee()
  }

  if (!employee) return <div className="p-8">Loading...</div>

  const activeSignOuts = employee.signOuts.filter((s) => !s.returned)
  const history = employee.signOuts.filter((s) => s.returned)

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8">

      {/* Employee Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {employee.firstName} {employee.lastName}
          </h1>
          <div className="text-gray-600 flex flex-col gap-1">
            <p>ID: {employee.id}</p>
            <p>Email: {employee.email}</p>
            <p>Phone: {employee.phone}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={openSignOut}
            className="
              flex items-center gap-2
              bg-wmsc-blue hover:bg-wmsc-blue-hover
              text-white px-4 py-2 rounded
              shadow-[0_4px_0_0_#000c1f]
              active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
              transition-all duration-100
            "
          >
            <IoMdAdd size={18} />
            Sign Out
          </button>
          <button
            onClick={openEdit}
            className="
              flex items-center gap-2
              border hover:bg-gray-50
              px-4 py-2 rounded
              shadow-[0_4px_0_0_#000c1f]
              active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
              transition-all duration-100
            "
          >
            <MdEdit size={18} />
            Edit
          </button>
          <button
            onClick={handleDeleteEmployee}
            className="
              flex items-center gap-2
              bg-wmsc-red text-white
              hover:bg-wmsc-red-hover
              px-4 py-2 rounded
              shadow-[0_4px_0_0_#000c1f]
              active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
              transition-all duration-100
            "
          >
            <FaTrashAlt size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Currently Signed Out */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Currently Signed Out</h2>
        {activeSignOuts.length === 0 ? (
          <p className="text-gray-500 text-sm">No items currently signed out.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Size</th>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Signed Out</th>
                    <th className="p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeSignOuts.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-2">{s.item.catalogue.piece}</td>
                      <td className="p-2">{s.item.size}</td>
                      <td className="p-2">{s.item.code}</td>
                      <td className="p-2">{formatDate(s.signedOutAt)}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleSignIn(s.id)}
                          className="
                            flex items-center gap-2
                            text-white bg-wmsc-blue hover:bg-wmsc-blue-hover
                            px-4 py-2 rounded
                            shadow-[0_4px_0_0_#000c1f]
                            active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
                            transition-all duration-100
                          "
                        >
                          Sign In
                        </button>
                        <button onClick={() => handleDelete(s.id)}>
                          <span className="text-lg text-wmsc-red"><FaTrashAlt /></span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {activeSignOuts.map((s) => (
                <div key={s.id} className="bg-white border rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{s.item.catalogue.piece}</span>
                      <span className="text-sm text-gray-600">{s.item.size} — {s.item.code}</span>
                      <span className="text-xs text-gray-400">{formatDate(s.signedOutAt)}</span>
                    </div>
                    <button onClick={() => handleDelete(s.id)}>
                      <span className="text-lg text-wmsc-red"><FaTrashAlt /></span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleSignIn(s.id)}
                    className="
                      flex items-center justify-center gap-2
                      text-white bg-wmsc-blue hover:bg-wmsc-blue-hover
                      px-4 py-2 rounded w-full
                      shadow-[0_4px_0_0_#000c1f]
                      active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
                      transition-all duration-100
                    "
                  >
                    Sign In
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sign In History */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Sign In History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No sign in history.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Size</th>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Signed Out</th>
                    <th className="p-2 text-left">Signed In</th>
                    <th className="p-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-2">{s.item.catalogue.piece}</td>
                      <td className="p-2">{s.item.size}</td>
                      <td className="p-2">{s.item.code}</td>
                      <td className="p-2">{formatDate(s.signedOutAt)}</td>
                      <td className="p-2">{s.signedInAt ? formatDate(s.signedInAt) : "—"}</td>
                      <td className="p-2">
                        <button onClick={() => handleDelete(s.id)}>
                          <span className="text-lg text-wmsc-red"><FaTrashAlt /></span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {history.map((s) => (
                <div key={s.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{s.item.catalogue.piece}</span>
                    <span className="text-sm text-gray-600">{s.item.size} — {s.item.code}</span>
                    <span className="text-xs text-gray-400">Out: {formatDate(s.signedOutAt)}</span>
                    <span className="text-xs text-gray-400">In: {s.signedInAt ? formatDate(s.signedInAt) : "—"}</span>
                  </div>
                  <button onClick={() => handleDelete(s.id)}>
                    <span className="text-lg text-wmsc-red"><FaTrashAlt /></span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">Edit Employee</h2>
            {editError && <p className="text-wmsc-red text-sm">{editError}</p>}
            <input type="text" placeholder="First Name" value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="border rounded p-2" />
            <input type="text" placeholder="Last Name" value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="border rounded p-2" />
            <input type="email" placeholder="Email" value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="border rounded p-2" />
            <input type="tel" placeholder="Phone" value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="border rounded p-2" />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="
                  text-sm bg-wmsc-red text-white
                  hover:bg-wmsc-red-hover
                  px-4 py-2 rounded
                  shadow-[0_4px_0_0_#000c1f]
                  active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
                  transition-all duration-100
                "
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="
                  flex items-center gap-2
                  bg-wmsc-blue hover:bg-wmsc-blue-hover text-white
                  px-4 py-2 rounded
                  shadow-[0_4px_0_0_#000c1f]
                  active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
                  transition-all duration-100
                "
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">
              Sign Out — {employee.firstName} {employee.lastName}
            </h2>

            <input
              type="text"
              placeholder="Scan item barcode..."
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              onKeyDown={handleItemCodeKeyDown}
              className="border rounded p-2"
            />

            {scanError && <p className="text-wmsc-red text-sm">{scanError}</p>}

            {scannedItems.length > 0 && (
              <ul className="border rounded p-2 flex flex-col gap-2">
                {scannedItems.map((item) => (
                  <li key={item.itemId} className="flex justify-between items-center">
                    <span className="text-sm">{item.piece} — {item.size} ({item.code})</span>
                    <button onClick={() => removeScannedItem(item.itemId)} className="text-wmsc-red ml-4">
                      <span className="text-lg"><FaTrashAlt /></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {submitError && <p className="text-wmsc-red text-sm">{submitError}</p>}
            {success && <p className="text-green-500 text-sm">Items signed out successfully!</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="
                  text-sm bg-wmsc-red text-white
                  hover:bg-wmsc-red-hover
                  px-4 py-2 rounded
                  shadow-[0_4px_0_0_#000c1f]
                  active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
                  transition-all duration-100
                "
              >
                Cancel
              </button>
              <button
                onClick={handleSignOutSubmit}
                className="
                  flex items-center gap-2
                  bg-wmsc-blue hover:bg-wmsc-blue-hover text-white
                  px-4 py-2 rounded
                  shadow-[0_4px_0_0_#000c1f]
                  active:translate-y-1 active:shadow-[0_1px_0_0_#000c1f]
                  transition-all duration-100
                "
              >
                Sign Out Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}