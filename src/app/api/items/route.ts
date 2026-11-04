// src/app/api/items/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await db.item.findMany({
    include: {
      catalogue: true,
      signOuts: {
        where: { returned: false },
        orderBy: { signedOutAt: "desc" },
        take: 1,
        include: { employee: true }
      }
    }
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.item.create({
    data: {
      catalogueId: body.catalogueId,
      size: body.size,
      code: body.code,
      condition: body.condition || "",
    }
  })
  return NextResponse.json(item)
}