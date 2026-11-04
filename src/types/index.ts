// src/types/index.ts

import { Size } from "../generated/prisma"

export type Employee = {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

export type CatalogueEntry = {
  id: number
  piece: string
}

export type ActiveSignOut = {
  id: number
  employee: Employee
}

export type ItemBase = {
  id: number
  code: string
  size: Size
  condition: string | null
  catalogue: CatalogueEntry
}

export type Item = ItemBase & {
  signOuts?: ActiveSignOut[]
}

export type SignOut = {
  id: number
  employeeId: number
  itemId: number
  signedOutAt: string
  returned: boolean
  signedInAt: string | null
}

export type SignOutWithDetails = SignOut & {
  employee: Employee
  item: ItemBase
}

export type ScannedItem = {
  itemId: number
  code: string
  size: string
  piece: string
  condition: string | null
}

export type ScannedSignInItem = {
  code: string
  itemId?: number
  piece?: string
  size?: string
  condition?: string | null
  error?: string
}

export type SignInResult = {
  succeeded: ScannedSignInItem[]
  failed: ScannedSignInItem[]
}

export type Password = {
  id: number
  hash: string
  updatedAt: string
}

export type PasswordResetToken = {
  id: number
  token: string
  expiresAt: string
  used: boolean
}

export type ScannedSignOutItem = {
  code: string
  itemId?: number
  piece?: string
  size?: string
  condition?: string | null
  error?: string
}

export type SignOutResult = {
  succeeded: ScannedSignOutItem[]
  failed: ScannedSignOutItem[]
}