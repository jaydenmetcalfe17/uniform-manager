// src/app/api/auth/forgot-password/route.ts

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now

  // Store token in DB
  await db.passwordResetToken.create({
    data: { token, expiresAt }
  })

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  // Send email
  await resend.emails.send({
    from: "Uniform Manager <info@wmsc.info>",
    to: process.env.RESET_EMAIL!,
    subject: "Password Reset Request",
    html: `
      <p>A password reset was requested for the WMSC Uniform Manager.</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, ignore this email.</p>
    `
  })

  return NextResponse.json({ success: true })
}