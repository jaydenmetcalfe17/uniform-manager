// src/types/index.ts

import { Size } from "../generated/prisma"

export type Employee = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
}

export type CatalogueEntry = {
  id: number
  piece: string
}

export type Item = {
  id: number
  code: string
  size: Size
  catalogue: CatalogueEntry
}

export type SignOut = {
  id: number
  employeeId: number
  itemId: number
  signedOutAt: string
  returned: boolean
  signedInAt: string | null
}

export type SignOutWithDetails = {
  id: number
  employeeId: number
  itemId: number
  signedOutAt: string
  returned: boolean
  signedInAt: string | null
  employee: Employee
  item: Item
}

export type ScannedItem = {
  itemId: number
  code: string
  size: string
  piece: string
}