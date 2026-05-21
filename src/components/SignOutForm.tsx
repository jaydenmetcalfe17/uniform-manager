"use client"

import { useState } from "react"

export default function SignOutForm() {
  const [employeeId, setEmployeeId] = useState("")
  const [itemId, setItemId] = useState("")

  async function handleSubmit() {
    const res = await fetch("/api/signouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: Number(employeeId),
        itemId: Number(itemId),
        returned: false,
      })
    })

    const data = await res.json()
    console.log("Created signout:", data)
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Employee ID"
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Item ID"
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
      />
      <button className="bg-blue-300" onClick={handleSubmit}>Sign Out Item</button>
    </div>
  )
}