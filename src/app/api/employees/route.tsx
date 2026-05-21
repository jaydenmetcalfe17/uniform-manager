import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

// GET all employees
export async function GET() {
  const employees = await db.employee.findMany()
  return NextResponse.json(employees)
}

// POST a new employee
export async function POST(request: Request) {
  const body = await request.json()
  const employee = await db.employee.create({
    data: {
      id: body.id,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
    }
  })
  return NextResponse.json(employee)
}