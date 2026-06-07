//src/app/api/employees/[id]/route.ts

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const employee = await db.employee.update({
    where: { id: Number(id) },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    }
  })
  return NextResponse.json(employee)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.employee.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}