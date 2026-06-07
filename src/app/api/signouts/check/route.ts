//api/signouts/check/route.ts

import { db } from "../../../../lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { itemIds } = await request.json()

  const activeSignOuts = await db.signOut.findMany({
    where: {
      itemId: { in: itemIds },
      returned: false,
    },
    include: { 
      item: { 
        include: { catalogue: true }  
      } 
    }
  })

  const alreadySignedOut = activeSignOuts.map((s) => {
    const piece = s.item.catalogue.piece
    const size = s.item.size
    return `${piece} (${size})`
  })

  return NextResponse.json({ alreadySignedOut })
}