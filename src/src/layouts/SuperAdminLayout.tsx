"use client"

import type React from "react"

import { useState } from "react"
import SuperAdminSidebar from "../components/SuperAdminSidebar"
import SuperAdminNavbar from "../components/SuperAdminNavbar"

interface SuperAdminLayoutProps {
  children: React.ReactNode
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <SuperAdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="md:pl-64 flex flex-col flex-1">
        <SuperAdminNavbar onMenuButtonClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

