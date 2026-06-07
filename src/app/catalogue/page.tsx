//src/app/catalogue/page.tsx

"use client"

import { useState, useEffect } from "react"
import type { CatalogueEntry } from "../../types"

export default function CataloguePage() {
  const [catalogue, setCatalogue] = useState<CatalogueEntry[]>([])
  const [showModal, setShowModal] = useState(false)
  const [piece, setPiece] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function fetchCatalogue() {
    const res = await fetch("/api/catalogue")
    const data = await res.json()
    setCatalogue(data)
  }

  useEffect(() => { fetchCatalogue() }, [])

  async function handleSubmit() {
    setError(null)

    if (!piece.trim()) {
      setError("Piece name is required.")
      return
    }

    const res = await fetch("/api/catalogue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ piece: piece.trim() })
    })

    if (!res.ok) {
      setError("Failed to add piece. It may already exist.")
      return
    }

    setPiece("")
    setShowModal(false)
    fetchCatalogue()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catalogue</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add Piece
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Piece</th>
          </tr>
        </thead>
        <tbody>
          {catalogue.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border p-2">{c.id}</td>
              <td className="border p-2">{c.piece}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">Add Catalogue Piece</h2>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
              type="text"
              placeholder="Piece name (e.g. Red shell jacket)"
              value={piece}
              onChange={(e) => setPiece(e.target.value)}
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