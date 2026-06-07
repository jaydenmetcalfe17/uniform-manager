//src/app/signouts/page.tsx

"use client"

import { useState, useEffect } from "react"
import type { SignOutWithDetails } from "../../types"

export default function SignOutsPage() {
  const [signOuts, setSignOuts] = useState<SignOutWithDetails[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchSignOuts() {
      const res = await fetch("/api/signouts")
      const data = await res.json()
      setSignOuts(data)
    }
    fetchSignOuts()
  }, [])

  const filtered = signOuts
    .filter((s) => showAll || !s.returned)
    .sort((a, b) => {
      const dateA = new Date(a.signedInAt ?? a.signedOutAt).getTime()
      const dateB = new Date(b.signedInAt ?? b.signedOutAt).getTime()
      return dateB - dateA
    })

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sign Outs</h1>
        <button
          onClick={() => setShowAll(!showAll)}
          className="border px-4 py-2 rounded text-sm"
        >
          {showAll ? "Show Active Only" : "Show All"}
        </button>
      </div>

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
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No sign outs found.</p>
      )}
    </div>
  )
}