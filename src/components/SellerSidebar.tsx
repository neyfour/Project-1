"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  Tag,
  MessageSquare,
  Menu,
  X,
  Settings,
} from "lucide-react"
import { useStore } from "../store"

export default function SellerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const user = useStore((state) => state.user)

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const navItems = [
    {
      name: "Dashboard",
      path: "/seller/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/seller/products",
      icon: Package,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: ShoppingBag,
    },
    {
      name: "Statistics",
      path: "/seller/statistics",
      icon: BarChart3,
    },
    {
      name: "Predictions",
      path: "/seller/predictions",
      icon: TrendingUp,
    },
    {
      name: "Promotions",
      path: "/seller/promotions",
      icon: Tag,
    },
    {
      name: "Seller Chat",
      path: "/seller/chat",
      icon: MessageSquare,
    },
    {
      name: "Settings",
      path: "/seller/settings",
      icon: Settings,
    },
  ]

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)}></div>}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 shadow-md transition-transform duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
            <Link to="/seller/dashboard" className="flex items-center space-x-3">
              <Store className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 text-transparent bg-clip-text">
                Seller Portal
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.username || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {(user?.username || user?.full_name || "U").charAt(0)}
                  </span>
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.username || user?.full_name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Seller</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Store className="w-5 h-5 mr-2" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

