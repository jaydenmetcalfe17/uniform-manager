//src/app/api/items/[id]/route.ts

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const item = await db.item.update({
    where: { id: Number(id) },
    data: {
      catalogueId: body.catalogueId,
      size: body.size,
      code: body.code,
    }
  })
  return NextResponse.json(item)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.item.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}