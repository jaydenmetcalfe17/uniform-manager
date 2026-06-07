//src/app/api/catalogue/route.ts

// import { db } from "../../../lib/db";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const catalogue = await db.catalogue.findMany()
  return NextResponse.json(catalogue)
}

export async function POST(request: Request) {
  const body = await request.json()
  const piece = await db.catalogue.create({
    data: {
      piece: body.piece,
    }
  })
  return NextResponse.json(piece)
}