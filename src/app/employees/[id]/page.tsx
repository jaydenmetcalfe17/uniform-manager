//src/app/employees/[id]/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { SignOutWithDetails, Employee } from "@/types"

type EmployeeWithSignOuts = Employee & {
  signOuts: SignOutWithDetails[]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const [employee, setEmployee] = useState<EmployeeWithSignOuts | null>(null)

  useEffect(() => {
    async function fetchEmployee() {
      const res = await fetch(`/api/employees/${id}`)
      setEmployee(await res.json())
    }
    fetchEmployee()
  }, [id])

  if (!employee) return <div className="p-8">Loading...</div>

  const activeSignOuts = employee.signOuts.filter((s) => !s.returned)
  const history = employee.signOuts.filter((s) => s.returned)

  return (
    <div className="p-8 flex flex-col gap-8">

      {/* Employee Info */}
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

      {/* Currently Signed Out */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Currently Signed Out</h2>
        {activeSignOuts.length === 0 ? (
          <p className="text-gray-500 text-sm">No items currently signed out.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-left">Size</th>
                <th className="border p-2 text-left">Code</th>
                <th className="border p-2 text-left">Signed Out</th>
              </tr>
            </thead>
            <tbody>
              {activeSignOuts.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="border p-2">{s.item.catalogue.piece}</td>
                  <td className="border p-2">{s.item.size}</td>
                  <td className="border p-2">{s.item.code}</td>
                  <td className="border p-2">{formatDate(s.signedOutAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sign In History */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Sign In History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No sign in history.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Item</th>
                <th className="border p-2 text-left">Size</th>
                <th className="border p-2 text-left">Code</th>
                <th className="border p-2 text-left">Signed Out</th>
                <th className="border p-2 text-left">Signed In</th>
              </tr>
            </thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="border p-2">{s.item.catalogue.piece}</td>
                  <td className="border p-2">{s.item.size}</td>
                  <td className="border p-2">{s.item.code}</td>
                  <td className="border p-2">{formatDate(s.signedOutAt)}</td>
                  <td className="border p-2">{s.signedInAt ? formatDate(s.signedInAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}