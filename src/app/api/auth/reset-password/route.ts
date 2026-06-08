//src/app/api/auth/reset-password/route.ts

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  const { token, password } = await request.json()

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required." }, { status: 400 })
  }

  // Find the token
  const resetToken = await db.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken) {
    return NextResponse.json({ error: "Invalid reset link." }, { status: 400 })
  }

  if (resetToken.used) {
    return NextResponse.json({ error: "This reset link has already been used." }, { status: 400 })
  }

  if (new Date() > resetToken.expiresAt) {
    return NextResponse.json({ error: "This reset link has expired." }, { status: 400 })
  }

  // Hash new password and update
  const hash = await bcrypt.hash(password, 12)

  await db.password.updateMany({ data: { hash } })

  // Mark token as used
  await db.passwordResetToken.update({
    where: { token },
    data: { used: true }
  })

  return NextResponse.json({ success: true })
}