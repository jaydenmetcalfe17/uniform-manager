// src/app/api/items/route.ts

// import { db } from "../../../lib/db";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET all items
export async function GET() {
  const items = await db.item.findMany({
    include: { catalogue: true }
  })
  return NextResponse.json(items)
}

// POST a new item
export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.item.create({
    data: {
      catalogueId: body.catalogueId,
      size: body.size,
      code: body.code,
    }
  })
  return NextResponse.json(item)
}