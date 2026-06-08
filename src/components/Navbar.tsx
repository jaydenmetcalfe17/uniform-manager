"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import wmscLogo from "../../public/images/wmsclogo.jpg"

const links = [
  { href: "/", label: "Home" },
  { href: "/employees", label: "Employees" },
  { href: "/items", label: "Items" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/signouts", label: "Sign Outs" },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === "/login" || pathname === "/reset-password") return null

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <nav className="w-full bg-white border-b px-8 py-4 flex gap-6 items-center">
      <Image className="h-10 w-auto mr-4" src={wmscLogo} alt="WMSC Logo" />
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium hover:text-wmsc-blue transition-colors ${
            pathname === link.href ? "text-wmsc-blue border-b-2 border-wmsc-blue" : "text-gray-600"
          }`}
        >
          {link.label}
        </Link>
      ))}
      <div className="ml-auto">
        <button
          onClick={handleLogout}
          className="
            text-sm bg-wmsc-red text-white
            hover:bg-wmsc-red-hover hover:text-white
            px-4 py-2 rounded
            shadow-[0_4px_0_0_#000c1f]
            active:translate-y-1
            active:shadow-[0_1px_0_0_#000c1f]
            transition-all duration-100
          "
        >
          Logout
        </button>
      </div>
    </nav>
  )
}