// src/app/api/items/route.ts

import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

// GET all items
export async function GET() {
  const items = await db.item.findMany()
  return NextResponse.json(items)
}

// POST a new item
export async function POST(request: Request) {
  const body = await request.json()
  const item = await db.item.create({
    data: {
      catalogId: body.catalogId,
      size: body.size,
      code: body.code,
    }
  })
  return NextResponse.json(item)
}