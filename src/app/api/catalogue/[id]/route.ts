//src/app/api/catalogue/[id]/route.ts

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const piece = await db.catalogue.update({
    where: { id: Number(id) },
    data: { piece: body.piece }
  })
  return NextResponse.json(piece)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.catalogue.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}