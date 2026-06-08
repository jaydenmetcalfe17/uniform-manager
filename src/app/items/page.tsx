//src/app/items/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Size } from "@/generated/prisma"
import { FaTrashAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import type { Item, CatalogueEntry } from "@/types"

type ItemForm = { catalogueId: string; size: string; code: string }
const emptyForm: ItemForm = { catalogueId: "", size: "", code: "" }

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchItems() {
    const res = await fetch("/api/items")
    setItems(await res.json())
  }

  async function fetchCatalogue() {
    const res = await fetch("/api/catalogue")
    setCatalogue(await res.json())
  }

  useEffect(() => { fetchItems(); fetchCatalogue() }, [])

  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    const signedOutBy = item.signOuts?.[0]?.employee
    return (
      item.code.toLowerCase().includes(q) ||
      item.catalogue?.piece.toLowerCase().includes(q) ||
      item.size.toLowerCase().includes(q) ||
      (signedOutBy && `${signedOutBy.firstName} ${signedOutBy.lastName}`.toLowerCase().includes(q))
    )
  })

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: Item) {
    setForm({
      catalogueId: String(item.catalogue.id),
      size: item.size,
      code: item.code,
    })
    setEditingId(item.id)
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    setError(null)
    if (!form.catalogueId || !form.size || !form.code) {
      setError("All fields are required.")
      return
    }

    const url = editingId !== null ? `/api/items/${editingId}` : "/api/items"
    const method = editingId !== null ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catalogueId: Number(form.catalogueId),
        size: form.size,
        code: form.code.trim(),
      })
    })

    if (!res.ok) {
      setError("Failed to save item. Code may already exist.")
      return
    }

    setShowModal(false)
    fetchItems()
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this item?")) return
    await fetch(`/api/items/${id}`, { method: "DELETE" })
    fetchItems()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Items</h1>
        <button
          onClick={openAdd}
          className="
            flex items-center gap-2
            bg-wmsc-blue hover:bg-wmsc-blue-hover
            text-white
            px-4 py-2 rounded
            shadow-[0_4px_0_0_#000c1f]
            active:translate-y-1
            active:shadow-[0_1px_0_0_#000c1f]
            transition-all duration-100
          "
        >
          <IoMdAdd />
          Add Item
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Barcode</th>
            <th className="p-2 text-left">Piece</th>
            <th className="p-2 text-left">Size</th>
            <th className="p-2 text-left">Signed Out By</th>
            <th className="p-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => {
            const activeSignOut = item.signOuts?.[0]
            return (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-2">{item.id}</td>
                <td className="p-2">{item.code}</td>
                <td className="p-2">{item.catalogue?.piece ?? "—"}</td>
                <td className="p-2">{item.size}</td>
                <td className="p-2">
                  {activeSignOut
                    ? `${activeSignOut.employee.firstName} ${activeSignOut.employee.lastName}`
                    : "—"}
                </td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(item)} className="text-wmsc-blue text-sm"><span className="text-lg hover:text-wmsc-blue-hover"><MdEdit /></span></button>
                  <button onClick={() => handleDelete(item.id)} className="text-wmsc-red text-sm"><span className="text-lg hover:text-gray-500"><FaTrashAlt /></span></button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No items found.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">{editingId !== null ? "Edit Item" : "Add Item"}</h2>
            {error && <p className="text-wmsc-red text-sm">{error}</p>}
            <select value={form.catalogueId} onChange={(e) => setForm({ ...form, catalogueId: e.target.value })}
              className="border rounded p-2">
              <option value="">Select a catalogue piece...</option>
              {[...catalogue]
                .sort((a, b) => a.piece.localeCompare(b.piece))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.piece}</option>
              ))}
            </select>
            <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="border rounded p-2">
              <option value="">Select a size...</option>
              {Object.values(Size).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input type="text" placeholder="Item barcode" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })} className="border rounded p-2" />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowModal(false)} 
                className="
                    flex items-center gap-2
                    border
                    border-wmsc-red
                    hover:bg-wmsc-red
                    px-4 py-2 rounded
                    shadow-[0_4px_0_0_#000c1f]
                    active:translate-y-1
                    active:shadow-[0_1px_0_0_#000c1f]
                    transition-all duration-100
                  "
                >
                    Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                className="
                    flex items-center gap-2
                    bg-wmsc-blue hover:bg-wmsc-blue-hover
                    text-white
                    px-4 py-2 rounded
                    shadow-[0_4px_0_0_#000c1f]
                    active:translate-y-1
                    active:shadow-[0_1px_0_0_#000c1f]
                    transition-all duration-100
                  "
                >
                {editingId !== null ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}