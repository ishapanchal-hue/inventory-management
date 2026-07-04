import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "AI Inventory Intelligence | Reduce Food Waste with Smart Analytics",
  description:
    "AI-powered inventory management system that reduces waste, optimizes logistics and forecasts demand for perishables",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
 return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>                                  {/* ← new */}
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
            <Toaster richColors />
          </AuthProvider>                                 {/* ← new */}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
