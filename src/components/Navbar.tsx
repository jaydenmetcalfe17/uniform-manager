//src/components/Navbar.tsx

"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { RxHamburgerMenu } from "react-icons/rx"
import { IoMdClose } from "react-icons/io"
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
  const [menuOpen, setMenuOpen] = useState(false)

  if (pathname === "/login" || pathname === "/reset-password") return null

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <nav className="w-full bg-white border-b">

      {/* Main bar */}
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Image className="h-10 w-auto" src={wmscLogo} alt="WMSC Logo" />

          {/* Desktop links */}
          <div className="hidden md:flex gap-6">
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop logout */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="
                text-sm bg-wmsc-red text-white
                hover:bg-wmsc-red-hover
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

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-600 hover:text-wmsc-blue"
          >
            {menuOpen
              ? <IoMdClose size={26} />
              : <RxHamburgerMenu size={24} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t flex flex-col px-4 py-3 gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium hover:text-wmsc-blue transition-colors ${
                pathname === link.href ? "text-wmsc-blue font-semibold" : "text-gray-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="
              text-sm bg-wmsc-red text-white
              hover:bg-wmsc-red-hover
              px-4 py-2 rounded
              shadow-[0_4px_0_0_#000c1f]
              active:translate-y-1
              active:shadow-[0_1px_0_0_#000c1f]
              transition-all duration-100
              w-full
            "
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}