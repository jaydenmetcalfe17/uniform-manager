//src/app/api/cron/cleanup/route.ts

import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Verify the request is from Vercel cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  const result = await db.signOut.deleteMany({
    where: {
      returned: true,                    // only delete returned items
      signedInAt: {
        lt: twoYearsAgo                  // signed in more than 2 years ago
      }
    }
  })

  console.log(`Cleanup: deleted ${result.count} old sign out records`)
  return NextResponse.json({ deleted: result.count })
}