"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function LandingSearch() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-8 px-4">
      {/* Logo/Brand Section */}
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-4xl font-bold">Library</h1>
        <p className="text-lg text-muted-foreground">
          Discover books and explore our collection
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for books..."
            className="h-12 w-full pl-12 text-base"
            disabled
          />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {isAuthenticated
            ? "Use the sidebar to navigate and manage your library"
            : "Sign in to search and manage your library"}
        </p>
      </div>

      {/* Login Button - only show for unauthenticated users */}
      {!isAuthenticated && (
        <Button asChild size="lg">
          <Link href="/login">Log In</Link>
        </Button>
      )}
    </div>
  )
}
