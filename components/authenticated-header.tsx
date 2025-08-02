"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, LogIn, UserPlus, LogOut, User } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AuthenticatedHeader() {
  const { user, loading, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-900">ArtVault</h1>
          </Link>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <>
                <Link href="/upload">
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Upload Artwork
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <User className="w-4 h-4" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
