//src/app/signouts/page.tsx

"use client"

import { useState, useEffect } from "react"
import type { SignOutWithDetails, Employee } from "@/types"

type SignOutForm = {
  employeeId: string
  itemId: string
  returned: boolean
  signedOutAt: string
  signedInAt: string
}

export default function SignOutsPage() {
  const [signOuts, setSignOuts] = useState<SignOutWithDetails[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SignOutForm>({
    employeeId: "", itemId: "", returned: false, signedOutAt: "", signedInAt: ""
  })
  const [error, setError] = useState<string | null>(null)

  async function fetchSignOuts() {
    const res = await fetch("/api/signouts")
    setSignOuts(await res.json())
  }

  async function fetchEmployees() {
    const res = await fetch("/api/employees")
    setEmployees(await res.json())
  }

  useEffect(() => { fetchSignOuts(); fetchEmployees() }, [])

  function formatDateForInput(date: string) {
    return new Date(date).toISOString().slice(0, 16)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-CA", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  function openEdit(s: SignOutWithDetails) {
    setForm({
      employeeId: String(s.employeeId),
      itemId: String(s.itemId),
      returned: s.returned,
      signedOutAt: formatDateForInput(s.signedOutAt),
      signedInAt: s.signedInAt ? formatDateForInput(s.signedInAt) : "",
    })
    setEditingId(s.id)
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    setError(null)
    if (!form.employeeId || !form.itemId || !form.signedOutAt) {
      setError("Employee, item, and sign out date are required.")
      return
    }

    const res = await fetch(`/api/signouts/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: Number(form.employeeId),
        itemId: Number(form.itemId),
        returned: form.returned,
        signedOutAt: form.signedOutAt,
        signedInAt: form.signedInAt || null,
      })
    })

    if (!res.ok) {
      setError("Failed to save changes.")
      return
    }

    setShowModal(false)
    fetchSignOuts()
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this sign out?")) return
    await fetch(`/api/signouts/${id}`, { method: "DELETE" })
    fetchSignOuts()
  }

  const filtered = signOuts
    .filter((s) => showAll || !s.returned)
    .filter((s) => {
      const q = search.toLowerCase()
      return (
        `${s.employee.firstName} ${s.employee.lastName}`.toLowerCase().includes(q) ||
        s.item.catalogue.piece.toLowerCase().includes(q) ||
        s.item.size.toLowerCase().includes(q) ||
        s.item.code.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const dateA = new Date(a.signedInAt ?? a.signedOutAt).getTime()
      const dateB = new Date(b.signedInAt ?? b.signedOutAt).getTime()
      return dateB - dateA
    })

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sign Outs</h1>
        <button onClick={() => setShowAll(!showAll)} className="border px-4 py-2 rounded text-sm">
          {showAll ? "Show Active Only" : "Show All"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by employee, item, size, or code..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Employee</th>
            <th className="border p-2 text-left">Item</th>
            <th className="border p-2 text-left">Size</th>
            <th className="border p-2 text-left">Code</th>
            <th className="border p-2 text-left">Signed Out</th>
            <th className="border p-2 text-left">Signed In</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="border p-2">{s.employee.firstName} {s.employee.lastName}</td>
              <td className="border p-2">{s.item.catalogue.piece}</td>
              <td className="border p-2">{s.item.size}</td>
              <td className="border p-2">{s.item.code}</td>
              <td className="border p-2">{formatDate(s.signedOutAt)}</td>
              <td className="border p-2">{s.signedInAt ? formatDate(s.signedInAt) : "—"}</td>
              <td className="border p-2">
                <span className={`text-sm font-medium ${s.returned ? "text-green-600" : "text-orange-500"}`}>
                  {s.returned ? "Returned" : "Active"}
                </span>
              </td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => openEdit(s)} className="text-blue-500 text-sm">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-500 text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No sign outs found.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">Edit Sign Out</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="border rounded p-2">
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>

            <input type="number" placeholder="Item ID" value={form.itemId}
              onChange={(e) => setForm({ ...form, itemId: e.target.value })}
              className="border rounded p-2" />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.returned}
                onChange={(e) => setForm({ ...form, returned: e.target.checked })} />
              Returned
            </label>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Signed Out At</label>
              <input type="datetime-local" value={form.signedOutAt}
                onChange={(e) => setForm({ ...form, signedOutAt: e.target.value })}
                className="border rounded p-2" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Signed In At (optional)</label>
              <input type="datetime-local" value={form.signedInAt}
                onChange={(e) => setForm({ ...form, signedInAt: e.target.value })}
                className="border rounded p-2" />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}