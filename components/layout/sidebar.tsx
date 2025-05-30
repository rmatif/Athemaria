"use client"; // Required for hooks like usePathname and useAuth

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button'; // For Login/Signup/Logout buttons
import { Switch } from '@/components/ui/switch';
import { BookOpen, Sun, Moon } from 'lucide-react'; // For branding icon and theme toggle

interface NavItem {
  name: string;
  icon: string; // Material icon name (using <i> tag)
  href: string;
  isAction?: boolean;
  requiresAuth?: boolean; // To show/hide based on auth state
  hideWhenAuth?: boolean; // To hide when authenticated (e.g. Login/Signup)
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  // activeItem prop might be deprecated in favor of usePathname, but can be kept for override if needed.
  // pageTitle prop can be used if the sidebar title needs to be dynamic per page, otherwise "WriteReadHub" is static.
}

const Sidebar: React.FC<SidebarProps> = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      // This first section contains the main navigation links without a title
      items: [
        { name: "Home", icon: "home", href: "/", requiresAuth: false },
        // "Library" link removed
        // "Store" link removed
        { name: "Write a Story", icon: "edit", href: "/create-story", requiresAuth: true },
        { name: "My Favorites", icon: "favorite", href: "/favorites", requiresAuth: true },
        { name: "Read Later", icon: "bookmark", href: "/read-later", requiresAuth: true },
        { name: "My Stories", icon: "book", href: "/my-stories", requiresAuth: true },
        { name: "Profile", icon: "person", href: "/profile", requiresAuth: true },
      ],
    },
    // "My Library" section removed
    // "My Collections" section removed (which included "My Stories" and "New Collection")
  ];

  // The rest of the component (branding, search, auth block, rendering logic) remains the same.
  // The filtering logic for `requiresAuth` will still apply to the remaining items.

  return (
    <div className="bg-white w-64 min-h-screen p-4 flex flex-col justify-between border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div>
        {/* Branding/Title Area */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="Athemaria Logo"
                className="h-7 w-7 object-contain transition-transform group-hover:scale-110 mr-2.5"
              />
              <span className="text-2xl font-serif font-medium text-amber-900 dark:text-amber-100">
                Athemaria
              </span>
            </Link>
            
            {/* Dark Mode Toggle */}
            <div className="relative">
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-amber-200"
              />
              <Sun className={`absolute left-1 top-1/2 transform -translate-y-1/2 h-3 w-3 transition-opacity ${theme === 'dark' ? 'opacity-0' : 'opacity-100 text-amber-600'}`} />
              <Moon className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 transition-opacity ${theme === 'dark' ? 'opacity-100 text-amber-100' : 'opacity-0'}`} />
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
          />
          <i className="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">search</i>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-grow">
          {navSections.map((section, sectionIndex) => {
            // Filter items based on auth state
            const visibleItems = section.items.filter(item => {
              if (item.requiresAuth && !user) return false;
              if (item.hideWhenAuth && user) return false;
              return true;
            });

            if (visibleItems.length === 0 && section.title) return null; // Don't render section if no visible items and it's not the main nav
            // If the section itself has no title (like our main nav section), and all items are filtered out,
            // it might still render an empty <ul>. This could be refined if necessary, but for the current structure,
            // the main nav section always has "Home" which is visible.
            if (visibleItems.length === 0 && !section.title && sectionIndex === 0 && navSections.length > 0) { // Avoid rendering completely empty main nav section
                 if (!visibleItems.some(item => !item.requiresAuth)) return null; // if all items require auth and user is not logged in
            }


            return (
              <div key={sectionIndex} className="mb-6">
                {section.title && (
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-4">
                    {section.title}
                  </h2>
                )}
                <ul>
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name} className="mb-1.5">
                        <Link
                          href={item.href}
                          className={`flex items-center py-2 px-4 rounded-lg transition-colors
                            ${
                              isActive
                                ? 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white' // Active style
                                : item.isAction // isAction styling is no longer used with the simplified nav
                                ? 'text-blue-600 hover:bg-gray-100 dark:text-blue-400 dark:hover:bg-gray-800' 
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' // Default style
                            }`}
                        >
                          <i className="material-icons mr-3 text-lg">{item.icon}</i>
                          <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Authentication Section (Bottom) */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {user ? (
          <div className="flex items-center">
            <Link href="/profile" className="cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                  <circle cx="12" cy="8" r="5"/>
                  <path d="M20 21a8 8 0 0 0-16 0"/>
                </svg>
              </div>
            </Link>
            <div className="flex-grow">
              <Link
                href="/profile"
                className="font-semibold text-sm text-gray-900 dark:text-white hover:underline focus:underline"
              >
                {user.displayName || "User"}
              </Link>
              <Button
                variant="ghost"
                onClick={logout}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-400 p-0 h-auto justify-start"
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <Button variant="outline" className="w-full border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="w-full bg-amber-700 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-500">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
