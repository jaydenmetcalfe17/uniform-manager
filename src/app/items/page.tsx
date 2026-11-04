//src/app/items/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Size } from "@/generated/prisma"
import { FaTrashAlt } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"
import type { Item, CatalogueEntry } from "@/types"

type ItemForm = { catalogueId: string; size: string; code: string , condition: string}
const emptyForm: ItemForm = { catalogueId: "", size: "", code: "" , condition: ""}

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
      (signedOutBy && `${signedOutBy.firstName} ${signedOutBy.lastName}`.toLowerCase().includes(q)) ||
      item.condition?.toLowerCase().includes(q)
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
      condition: item.condition ?? "",
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

    if (form.condition === "Other") {
      setError("Please specify the condition.")
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
        condition: form.condition.trim() || null,
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
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Items</h1>
        <button
          onClick={openAdd}
          className="
            flex items-center gap-2
            bg-wmsc-blue hover:bg-wmsc-blue-hover
            text-white
            px-3 py-2 md:px-4 rounded
            text-sm md:text-base
            shadow-[0_4px_0_0_#000c1f]
            active:translate-y-1
            active:shadow-[0_1px_0_0_#000c1f]
            transition-all duration-100
          "
        >
          <IoMdAdd />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Barcode</th>
              <th className="p-2 text-left">Piece</th>
              <th className="p-2 text-left">Size</th>
              <th className="p-2 text-left">Condition</th>
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
                  <td className="p-2">{item.condition ?? "—"}</td>
                  <td className="p-2">
                    {activeSignOut
                      ? `${activeSignOut.employee.firstName} ${activeSignOut.employee.lastName}`
                      : "—"}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => openEdit(item)}>
                      <span className="text-lg text-wmsc-blue hover:text-wmsc-blue-hover"><MdEdit /></span>
                    </button>
                    <button onClick={() => handleDelete(item.id)}>
                      <span className="text-lg text-wmsc-red"><FaTrashAlt /></span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.map((item) => {
          const activeSignOut = item.signOuts?.[0]
          return (
            <div key={item.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">ID: {item.id}</span>
                <span className="font-medium">{item.catalogue?.piece ?? "—"}</span>
                <span className="text-sm text-gray-600">
                  {item.size} — {item.code} — {item.condition ?? "—"}
                </span>
                {activeSignOut && (
                  <span className="text-xs text-orange-500">
                    Signed out by {activeSignOut.employee.firstName} {activeSignOut.employee.lastName}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEdit(item)}>
                  <span className="text-xl text-wmsc-blue"><MdEdit /></span>
                </button>
                <button onClick={() => handleDelete(item.id)}>
                  <span className="text-xl text-wmsc-red"><FaTrashAlt /></span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No items found.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            
            <select
              value={
                ["", "New", "Good", "Fair"].includes(form.condition)
                  ? form.condition
                  : "Other"
              }
              onChange={(e) =>
                setForm({ ...form, condition: e.target.value })
              }
              className="border rounded p-2"
            >
              <option value="">Select a condition...</option>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Other">Other</option>
            </select>

            {!["", "New", "Good", "Fair"].includes(form.condition) && (
              <input
                type="text"
                placeholder="Specify condition..."
                value={form.condition === "Other" ? "" : form.condition}
                onChange={(e) =>
                  setForm({ ...form, condition: e.target.value })
                }
                className="border rounded p-2"
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="
                  text-sm bg-wmsc-red text-white
                  hover:bg-wmsc-red-hover
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