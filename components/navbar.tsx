"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/30 dark:border-amber-800/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center group"
              onClick={closeMenu}
            >
              <BookOpen className="h-6 w-6 text-amber-700 dark:text-amber-300 transition-transform group-hover:scale-110 mr-2" />
              <span className="text-xl font-serif font-medium text-amber-900 dark:text-amber-100">
                WriteReadHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-amber-700 dark:hover:text-amber-300 ${
                pathname === "/"
                  ? "text-amber-800 dark:text-amber-200"
                  : "text-amber-700/60 dark:text-amber-300/60"
              }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/create-story"
                  className={`text-sm font-medium transition-colors hover:text-amber-700 dark:hover:text-amber-300 ${
                    pathname === "/create-story"
                      ? "text-amber-800 dark:text-amber-200"
                      : "text-amber-700/60 dark:text-amber-300/60"
                  }`}
                >
                  Write a Story
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors hover:text-amber-700 dark:hover:text-amber-300 ${
                    pathname === "/profile"
                      ? "text-amber-800 dark:text-amber-200"
                      : "text-amber-700/60 dark:text-amber-300/60"
                  }`}
                >
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-amber-700/80 dark:text-amber-300/80">
                  Hello, {user.displayName || "User"}
                </span>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-amber-200/50 dark:border-amber-800/50 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-amber-800 hover:bg-amber-700 text-amber-50 dark:bg-amber-700 dark:hover:bg-amber-600 shadow-lg shadow-amber-900/20 dark:shadow-amber-900/10">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50 p-2 rounded-lg transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-amber-200/30 dark:border-amber-800/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-amber-700 dark:hover:text-amber-300 ${
                pathname === "/"
                  ? "text-amber-800 dark:text-amber-200"
                  : "text-amber-700/60 dark:text-amber-300/60"
              }`}
              onClick={closeMenu}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  href="/create-story"
                  className={`text-sm font-medium transition-colors hover:text-amber-700 dark:hover:text-amber-300 ${
                    pathname === "/create-story"
                      ? "text-amber-800 dark:text-amber-200"
                      : "text-amber-700/60 dark:text-amber-300/60"
                  }`}
                  onClick={closeMenu}
                >
                  Write a Story
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors hover:text-amber-700 dark:hover:text-amber-300 ${
                    pathname === "/profile"
                      ? "text-amber-800 dark:text-amber-200"
                      : "text-amber-700/60 dark:text-amber-300/60"
                  }`}
                  onClick={closeMenu}
                >
                  Profile
                </Link>
              </>
            )}

            <div className="border-t border-amber-200/30 dark:border-amber-800/30 pt-4 mt-2">
              {user ? (
                <>
                  <div className="text-sm text-amber-700/80 dark:text-amber-300/80 mb-2">
                    Hello, {user.displayName || "User"}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full border-amber-200/50 dark:border-amber-800/50 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={closeMenu}>
                    <Button
                      variant="outline"
                      className="w-full border-amber-200/50 dark:border-amber-800/50 text-amber-900 dark:text-amber-100 hover:bg-amber-100/50 dark:hover:bg-amber-900/50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={closeMenu}>
                    <Button className="w-full bg-amber-800 hover:bg-amber-700 text-amber-50 dark:bg-amber-700 dark:hover:bg-amber-600 shadow-lg shadow-amber-900/20 dark:shadow-amber-900/10">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
