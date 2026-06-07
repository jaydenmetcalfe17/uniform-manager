//api/items/code/[code]/route.ts

import { db } from "../../../../../lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const item = await db.item.findUnique({
    where: { code: params.code },
    include: { catalog: true },
  })

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  // Check if there's an active (not returned) signout for this item
  const activeSignOut = await db.signOut.findFirst({
    where: {
      itemId: item.id,
      returned: false,
    }
  })

  return NextResponse.json({ ...item, isSignedOut: !!activeSignOut })
}