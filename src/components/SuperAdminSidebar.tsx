"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  BarChart3,
  PieChart,
  Users,
  MessageSquare,
  LogOut,
  Store,
} from "lucide-react"
import { useStore } from "../store"
import { logoutUser } from "../api/authApi"

interface SuperAdminSidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function SuperAdminSidebar({ isOpen, setIsOpen }: SuperAdminSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const setUser = useStore((state) => state.setUser)

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "Sellers",
      icon: Users,
      path: "/admin/sellers",
    },
    {
      title: "Products",
      icon: ShoppingBag,
      path: "/admin/products",
    },
    {
      title: "Orders",
      icon: PackageCheck,
      path: "/admin/orders",
    },
    {
      title: "Predictions",
      icon: BarChart3,
      path: "/admin/predictions",
    },
    {
      title: "Statistics",
      icon: PieChart,
      path: "/admin/statistics",
    },
    {
      title: "Forum",
      icon: MessageSquare,
      path: "/admin/forum",
    },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      setUser(null)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <Store className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 md:hidden"
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive(item.path)
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive(item.path)
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                }`}
              />
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

