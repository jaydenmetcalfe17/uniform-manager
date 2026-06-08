//src/app/api/auth/login/route.ts

import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  const { password } = await request.json()

  const stored = await db.password.findFirst()

  if (!stored) {
    return NextResponse.json({ error: "No password configured." }, { status: 500 })
  }

  const valid = await bcrypt.compare(password, stored.hash)

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set("auth-token", process.env.AUTH_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return response
}