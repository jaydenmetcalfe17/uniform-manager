//src/app/employees/page.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FaTrashAlt } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"
import type { Employee } from "@/types"

type EmployeeForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
}

const emptyForm: EmployeeForm = { firstName: "", lastName: "", email: "", phone: "" }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<EmployeeForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchEmployees() {
    const res = await fetch("/api/employees")
    setEmployees(await res.json())
  }

  useEffect(() => { fetchEmployees() }, [])

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase()
    return (
      String(emp.id).includes(q) ||
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      (emp.email ?? "").toLowerCase().includes(q) ||
      (emp.phone ?? "").includes(q)
    )
  })

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setError(null)
    setShowModal(true)
  }

  function openEdit(emp: Employee) {
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email ?? "",
      phone: emp.phone ?? "",
    })
    setEditingId(emp.id)
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    setError(null)

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.")
      return
    }

    const url = editingId !== null
      ? `/api/employees/${editingId}`
      : "/api/employees"

    const method = editingId !== null ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      })
    })

    if (!res.ok) {
      setError("Failed to save employee. Email may already be in use.")
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
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Employees</h1>
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
          <span className="hidden sm:inline">Add Employee</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <input
        type="text"
        placeholder="Search employees..."
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
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="p-2">{emp.id}</td>
                <td className="p-2">
                  <Link href={`/employees/${emp.id}`} className="text-wmsc-blue hover:underline">
                    {emp.firstName} {emp.lastName}
                  </Link>
                </td>
                <td className="p-2">{emp.email || "—"}</td>
                <td className="p-2">{emp.phone || "—"}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(emp)}>
                    <span className="text-lg text-wmsc-blue hover:text-wmsc-blue-hover"><MdEdit /></span>
                  </button>
                  <button onClick={() => handleDelete(emp.id)}>
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
        {filtered.map((emp) => (
          <div key={emp.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">ID: {emp.id}</span>
              <Link href={`/employees/${emp.id}`} className="font-medium text-wmsc-blue hover:underline">
                {emp.firstName} {emp.lastName}
              </Link>
              <span className="text-sm text-gray-600">{emp.email || "—"}</span>
              <span className="text-sm text-gray-600">{emp.phone || "—"}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(emp)}>
                <span className="text-xl text-wmsc-blue"><MdEdit /></span>
              </button>
              <button onClick={() => handleDelete(emp.id)}>
                <span className="text-xl text-wmsc-red"><FaTrashAlt /></span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No employees found.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-xl font-bold">{editingId !== null ? "Edit Employee" : "Add Employee"}</h2>
            {error && <p className="text-wmsc-red text-sm">{error}</p>}
            <input type="text" placeholder="First Name" value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="border rounded p-2" />
            <input type="text" placeholder="Last Name" value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="border rounded p-2" />
            <input type="email" placeholder="Email (optional)" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded p-2" />
            <input type="tel" placeholder="Phone (optional)" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border rounded p-2" />
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