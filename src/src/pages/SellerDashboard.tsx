"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ShoppingBag, Package, BarChart3, TrendingUp, DollarSign } from "lucide-react"
import { useStore } from "../store"
import SellerSidebar from "../components/SellerSidebar"

export default function SellerDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    total_views: 0,
    recent_products: [],
    recent_orders: [],
  })

  const user = useStore((state) => state.user)
  const token = useStore((state) => state.token)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data
        setStats({
          total_products: 24,
          total_orders: 156,
          total_revenue: 8945.75,
          total_views: 3456,
          recent_products: [],
          recent_orders: [],
        })
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [token])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <SellerSidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.username}</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Here's what's happening with your store today.</p>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/seller/products/add"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Product
                </Link>
                <Link
                  to="/seller/forum"
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Seller Forum
                </Link>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_products}</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_orders}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    ${stats.total_revenue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_views}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Trend</h2>
              </div>
              <select className="text-sm rounded-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Sales chart will be displayed here</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h2>
                </div>
                <Link
                  to="/seller/products"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recent_products && stats.recent_products.length > 0 ? (
                  stats.recent_products.map((product: any) => (
                    <div key={product.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Stock: {product.stock} | ${product.price.toFixed(2)}
                        </p>
                      </div>
                      <Link
                        to={`/seller/products/${product.id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        View
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No products found</p>
                    <Link
                      to="/seller/products/add"
                      className="mt-2 inline-flex items-center text-indigo-600 dark:text-indigo-400"
                    >
                      Add your first product
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
                </div>
                <Link
                  to="/seller/orders"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {stats.recent_orders && stats.recent_orders.length > 0 ? (
                  stats.recent_orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">#{order.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            order.status === "processing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : order.status === "shipped"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : order.status === "delivered"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }
                        `}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                        <Link
                          to={`/seller/orders/${order.id}`}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

