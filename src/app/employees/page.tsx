//src/app/employees/page.tsx

"use client"

import { useState, useEffect } from "react"
import type { Employee } from "@/types"

type EmployeeForm = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

const emptyForm: EmployeeForm = { id: "", firstName: "", lastName: "", email: "", phone: "" }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<EmployeeForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchEmployees() {
    const res = await fetch("/api/employees")
    setEmployees(await res.json())
  }

  useEffect(() => { fetchEmployees() }, [])

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setError(null)
    setShowModal(true)
  }

  function openEdit(emp: Employee) {
    setForm({
      id: String(emp.id),
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
    })
    setEditingId(emp.id)
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    setError(null)

    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError("All fields are required.")
      return
    }

    if (editingId === null && !form.id) {
      setError("Employee ID is required.")
      return
    }

    const url = editingId !== null ? `/api/employees/${editingId}` : "/api/employees"
    const method = editingId !== null ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Number(form.id),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
      })
    })

    if (!res.ok) {
      setError("Failed to save employee. ID or email may already exist.")
      return
    }

    setShowModal(false)
    fetchEmployees()
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this employee?")) return
    await fetch(`/api/employees/${id}`, { method: "DELETE" })
    fetchEmployees()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button onClick={openAdd} className="bg-blue-500 text-white px-4 py-2 rounded">
          + Add Employee
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">First Name</th>
            <th className="border p-2 text-left">Last Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Phone</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="border p-2">{emp.id}</td>
              <td className="border p-2">{emp.firstName}</td>
              <td className="border p-2">{emp.lastName}</td>
              <td className="border p-2">{emp.email}</td>
              <td className="border p-2">{emp.phone}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => openEdit(emp)} className="text-blue-500 text-sm">Edit</button>
                <button onClick={() => handleDelete(emp.id)} className="text-red-500 text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">{editingId !== null ? "Edit Employee" : "Add Employee"}</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {editingId === null && (
              <input
                type="number"
                placeholder="Employee ID"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="border rounded p-2"
              />
            )}
            <input type="text" placeholder="First Name" value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="border rounded p-2" />
            <input type="text" placeholder="Last Name" value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="border rounded p-2" />
            <input type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded p-2" />
            <input type="tel" placeholder="Phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border rounded p-2" />
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