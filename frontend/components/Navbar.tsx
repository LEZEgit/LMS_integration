"use client"
import { useCurrentPage } from "@/lib/use-current-page"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, Home } from "lucide-react"
import { ModeToggle } from "./DarkModeToggle"

const Navbar = () => {
  const currentPage = useCurrentPage()
  const { toggleSidebar } = useSidebar()
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const isHomeRoute = pathname === "/" || pathname === "/home"

  return (
    <nav className="flex items-center justify-between p-2">
      {/* left - sidebar toggle button (only show when authenticated) */}
      {isAuthenticated && (
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 transition-colors hover:bg-accent"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* center - page title */}
      <div className="flex-1 text-center md:flex-none md:text-left">
        <h1 className="text-lg font-semibold text-foreground">
          {currentPage ? currentPage.title : "Log In"}
        </h1>
      </div>

      {/* right - actions */}
      <div className="flex items-center gap-4">
        {/* home icon (show when authenticated and not on home route) */}
        {isAuthenticated && !isHomeRoute && (
          <Link
            href="/"
            className="rounded-md p-2 transition-colors hover:bg-accent"
            aria-label="Go to home"
            title="Home"
          >
            <Home className="h-5 w-5" />
          </Link>
        )}
        <ModeToggle />
      </div>
    </nav>
  )
}

export default Navbar
