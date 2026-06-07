//src/app/api/signouts/[id]/route.ts

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const signOut = await db.signOut.update({
    where: { id: Number(id) },
    data: {
      employeeId: body.employeeId,
      itemId: body.itemId,
      returned: body.returned,
      signedOutAt: body.signedOutAt ? new Date(body.signedOutAt) : undefined,
      signedInAt: body.signedInAt ? new Date(body.signedInAt) : null,
    }
  })
  return NextResponse.json(signOut)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.signOut.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}