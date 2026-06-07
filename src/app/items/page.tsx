//src/app/items/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Size } from "../../generated/prisma"
import type { Item, CatalogueEntry } from "../../types"

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ catalogueId: "", size: "", code: "" })
  const [error, setError] = useState<string | null>(null)

  async function fetchItems() {
    const res = await fetch("/api/items")
    const data = await res.json()
    setItems(data)
  }

  async function fetchCatalogue() {
    const res = await fetch("/api/catalogue")
    const data = await res.json()
    setCatalogue(data)
  }

  useEffect(() => {
    fetchItems()
    fetchCatalogue()
  }, [])

  async function handleSubmit() {
    setError(null)

    if (!form.catalogueId || !form.size || !form.code) {
      setError("All fields are required.")
      return
    }

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catalogueId: Number(form.catalogueId),
        size: form.size,
        code: form.code.trim(),
      })
    })

    if (!res.ok) {
      setError("Failed to add item. Code may already exist.")
      return
    }

    setForm({ catalogueId: "", size: "", code: "" })
    setShowModal(false)
    fetchItems()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Items</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add Item
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Code</th>
            <th className="border p-2 text-left">Piece</th>
            <th className="border p-2 text-left">Size</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="border p-2">{item.id}</td>
              <td className="border p-2">{item.code}</td>
              <td className="border p-2">{item.catalogue?.piece ?? "—"}</td>
              <td className="border p-2">{item.size}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">Add Item</h2>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <select
              value={form.catalogueId}
              onChange={(e) => setForm({ ...form, catalogueId: e.target.value })}
              className="border rounded p-2"
            >
              <option value="">Select a catalogue piece...</option>
              {catalogue.map((c) => (
                <option key={c.id} value={c.id}>{c.piece}</option>
              ))}
            </select>

            <select
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="border rounded p-2"
            >
              <option value="">Select a size...</option>
              {Object.values(Size).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Item code (e.g. 24888S19)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="border rounded p-2"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowModal(false); setError(null) }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}