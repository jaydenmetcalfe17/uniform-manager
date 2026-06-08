//src/app/api/signouts/active/[itemId]/route.ts

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params

  const signOut = await db.signOut.findFirst({
    where: {
      itemId: Number(itemId),
      returned: false,
    }
  })

  if (!signOut) {
    return NextResponse.json({ error: "No active sign out found" }, { status: 404 })
  }

  return NextResponse.json(signOut)
}