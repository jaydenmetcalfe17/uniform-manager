//src/components/Navbar.tsx

"use client"

import Image from "next/image";
import Link from "next/link"
import { usePathname } from "next/navigation"
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

  return (
    <nav className="w-full bg-white border-b px-8 py-4 flex gap-6 items-center">
      {/* <span className="font-bold text-lg mr-4">WMSC</span> */}
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
    </nav>
  )
}