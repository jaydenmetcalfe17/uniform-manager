"use client"

import { useState, useEffect } from "react"
import type { CatalogueEntry } from "@/types"

export default function CataloguePage() {
  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [piece, setPiece] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchCatalogue() {
    const res = await fetch("/api/catalogue")
    setCatalogue(await res.json())
  }

  useEffect(() => { fetchCatalogue() }, [])

  const filtered = catalogue.filter((c) =>
    c.piece.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setPiece("")
    setEditingId(null)
    setError(null)
    setShowModal(true)
  }

  function openEdit(c: CatalogueEntry) {
    setPiece(c.piece)
    setEditingId(c.id)
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    setError(null)
    if (!piece.trim()) {
      setError("Piece name is required.")
      return
    }

    const url = editingId !== null ? `/api/catalogue/${editingId}` : "/api/catalogue"
    const method = editingId !== null ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ piece: piece.trim() })
    })

    if (!res.ok) {
      setError("Failed to save. This piece may already exist.")
      return
    }

    setShowModal(false)
    fetchCatalogue()
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this catalogue piece?")) return
    await fetch(`/api/catalogue/${id}`, { method: "DELETE" })
    fetchCatalogue()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Catalogue</h1>
        <button onClick={openAdd} className="bg-blue-500 text-white px-4 py-2 rounded">
          + Add Piece
        </button>
      </div>

      <input
        type="text"
        placeholder="Search catalogue..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Piece</th>
            <th className="border p-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border p-2">{c.id}</td>
              <td className="border p-2">{c.piece}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => openEdit(c)} className="text-blue-500 text-sm">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="text-red-500 text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No catalogue entries found.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">{editingId !== null ? "Edit Piece" : "Add Catalogue Piece"}</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <input type="text" placeholder="Piece name" value={piece}
              onChange={(e) => setPiece(e.target.value)} className="border rounded p-2" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">
                {editingId !== null ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}