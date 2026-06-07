//src/components/Navbar.tsx

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/employees", label: "Employees" },
  { href: "/items", label: "Items" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/signouts", label: "Sign Outs" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="w-full bg-white border-b px-8 py-4 flex gap-6 items-center">
      <span className="font-bold text-lg mr-4">WMSC</span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium hover:text-blue-500 transition-colors ${
            pathname === link.href ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-600"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}