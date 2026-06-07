// src/app/api/signouts/route.ts

// import { db } from "../../../lib/db";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const signOuts = await db.signOut.findMany({
    include: {
      employee: true,
      item: {
        include: { catalogue: true }
      }
    }
  })
  return NextResponse.json(signOuts)
}

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