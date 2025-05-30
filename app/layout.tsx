import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { BookOpen } from "lucide-react";

// Configure fonts
import { Lora, Inter } from "next/font/google";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Athemaria - A Modern Story Platform",
  description:
    "Share and discover amazing stories from writers around the world",
  keywords: "stories, writing, reading, community, platform",
  authors: [{ name: "Athemaria", url: "https://www.athemaria.com" }],
  creator: "hayat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${lora.variable} ${inter.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="h-full bg-gray-50 text-gray-800 font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex flex-col relative">
              {/* Background decorative elements */}
              <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden="true"
              >
                <div className="absolute left-0 top-1/4 h-[300px] w-[400px] rounded-full bg-gradient-to-br from-amber-200/20 to-orange-100/10 blur-3xl dark:from-amber-900/10 dark:to-orange-900/5" />
                <div className="absolute right-0 bottom-1/4 h-[250px] w-[350px] rounded-full bg-gradient-to-br from-orange-100/20 to-amber-200/10 blur-3xl dark:from-orange-900/10 dark:to-amber-900/5" />
              </div>

              {/* Main content */}
              <div className="relative">{children}</div>
            </main>

            {/* Footer with library theme */}
            <footer className="relative border-t border-amber-200/30 dark:border-amber-800/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
              <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center gap-4">
                  {/* Logo and name */}
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="Athemaria Logo"
                      className="h-6 w-6 object-contain"
                    />
                    <span className="text-lg font-serif font-medium text-amber-900 dark:text-amber-100">
                      Athemaria
                    </span>
                  </div>

                  {/* Copyright */}
                  <div className="text-sm text-amber-700/60 dark:text-amber-300/60">
                    © {new Date().getFullYear()} Athemaria. All rights
                    reserved.
                  </div>

                  {/* Decorative line */}
                  <div className="w-20 h-0.5 rounded-full bg-gradient-to-r from-amber-200 to-amber-300 dark:from-amber-700 dark:to-amber-600 opacity-50" />
                </div>
              </div>
            </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
