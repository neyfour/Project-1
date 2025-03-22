"use client"

import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  ShoppingBag,
  TrendingUp,
  UserCheck,
} from "lucide-react"
import { useStore } from "../store"

export default function SuperAdminSidebar() {
  const location = useLocation()
  const logout = useStore((state) => state.logout)

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link to="/matrix/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Portal</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          <Link
            to="/matrix/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin") && !isActive("/matrix/admin/sellers") && !isActive("/matrix/admin/products")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/matrix/admin/seller-applications"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/seller-applications")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>Seller Applications</span>
          </Link>

          <Link
            to="/matrix/admin/sellers"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/sellers")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Sellers</span>
          </Link>

          <Link
            to="/matrix/admin/products"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/products")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </Link>

          <Link
            to="/matrix/admin/orders"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/orders")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </Link>

          <Link
            to="/matrix/admin/statistics"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/statistics")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Statistics</span>
          </Link>

          <Link
            to="/matrix/admin/predictions"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/predictions")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Predictions</span>
          </Link>

          <Link
            to="/matrix/admin/chat"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/chat")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Seller Chat</span>
          </Link>

          <Link
            to="/matrix/admin/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive("/matrix/admin/settings")
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

