import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Annapurna - Smart Pantry Management",
  description: "Efficient pantry ordering system for employees",
  icons: {
    icon: "/favicon.ico",       // Standard browsers
    shortcut: "/favicon.ico",   // Safari / legacy
    apple: "/favicon.ico",      // iOS devices
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

