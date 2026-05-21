// src/app/api/signouts/route.ts

import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

// GET all signOuts
export async function GET() {
  const signOuts = await db.signOut.findMany()
  return NextResponse.json(signOuts)
}

// POST a new signOut
export async function POST(request: Request) {
  const body = await request.json()
  const signOut = await db.signOut.create({
    data: {
      employeeId: body.employeeId,
      itemId: body.itemId,
      returned: body.returned,
    }
  })
  return NextResponse.json(signOut)
}