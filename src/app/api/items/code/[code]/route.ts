//api/items/code/[code]/route.ts

import { db } from "../../../../../lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params  // await the params

  const item = await db.item.findUnique({
    where: { code: code },
    include: { catalog: true },
  })

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  const activeSignOut = await db.signOut.findFirst({
    where: {
      itemId: item.id,
      returned: false,
    }
  })

  return NextResponse.json({ ...item, isSignedOut: !!activeSignOut })
}