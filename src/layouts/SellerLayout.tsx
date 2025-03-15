"use client"

import type React from "react"

import { useState } from "react"
import SellerSidebar from "../components/SellerSidebar"
import SellerNavbar from "../components/SellerNavbar"

interface SellerLayoutProps {
  children: React.ReactNode
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <SellerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="md:pl-64 flex flex-col flex-1">
        <SellerNavbar onMenuButtonClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

