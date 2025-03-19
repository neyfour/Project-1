"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ShoppingBag,
  Users,
  Package,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  DollarSign,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useStore } from "../store"
import { getSellerApplications, updateSellerStatus } from "../api/authApi"
import { getDashboardOverview } from "../api/dashboardApi"
import SuperAdminSidebar from "../components/SuperAdminSidebar"
import NotificationCenter from "../components/NotificationCenter"
import toast from "react-hot-toast"

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sellerApplications, setSellerApplications] = useState<any[]>([])
  const [stats, setStats] = useState({
    total_users: 0,
    total_sellers: 0,
    total_products: 0,
    total_orders: 0,
    pending_applications: 0,
    total_revenue: 0,
    monthly_data: [],
    top_products: [],
    revenue_change: {
      daily: 0,
      monthly: 0,
    },
    orders_change: {
      daily: 0,
      monthly: 0,
    },
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

        // Fetch seller applications
        const applications = await getSellerApplications(token, "pending")
        setSellerApplications(applications)

        // Fetch dashboard statistics
        const dashboardData = await getDashboardOverview(token)

        setStats({
          total_users: dashboardData.platform_stats?.customer_count || 0,
          total_sellers: dashboardData.platform_stats?.seller_count || 0,
          total_products: dashboardData.product_count || 0,
          total_orders: dashboardData.orders?.total || 0,
          pending_applications: applications.length,
          total_revenue: dashboardData.revenue?.total || 0,
          monthly_data: dashboardData.monthly_data || [],
          top_products: dashboardData.top_products || [],
          revenue_change: {
            daily: dashboardData.revenue?.change?.daily || 0,
            monthly: dashboardData.revenue?.change?.monthly || 0,
          },
          orders_change: {
            daily: dashboardData.orders?.change?.daily || 0,
            monthly: dashboardData.orders?.change?.monthly || 0,
          },
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

  const handleApplicationAction = async (applicationId: string, action: "approved" | "rejected") => {
    try {
      await updateSellerStatus(
        applicationId,
        action,
        action === "rejected" ? "Application rejected by admin" : "",
        token!,
      )

      // Update the local state
      setSellerApplications((prevApplications) => prevApplications.filter((app) => app.id !== applicationId))

      // Update the stats
      setStats((prev) => ({
        ...prev,
        pending_applications: prev.pending_applications - 1,
        total_sellers: action === "approved" ? prev.total_sellers + 1 : prev.total_sellers,
      }))

      toast.success(`Seller application ${action}`)
    } catch (err) {
      console.error(`Error ${action} seller application:`, err)
      toast.error(`Failed to ${action} seller application`)
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <SuperAdminSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 rounded-full border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex">
        <SuperAdminSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="text-red-600 text-xl">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.username}</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Here's what's happening on your platform today.</p>
              </div>
              <div className="flex gap-4 items-center">
                <NotificationCenter />
                <Link
                  to="/matrix/admin/chat"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Seller Chat
                </Link>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_users}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sellers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_sellers}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

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
                  <div className="flex items-center mt-1">
                    {stats.orders_change.daily > 0 ? (
                      <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${stats.orders_change.daily > 0 ? "text-green-500" : "text-red-500"}`}>
                      {Math.abs(stats.orders_change.daily).toFixed(1)}% today
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    $
                    {stats.total_revenue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex items-center mt-1">
                    {stats.revenue_change.daily > 0 ? (
                      <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${stats.revenue_change.daily > 0 ? "text-green-500" : "text-red-500"}`}>
                      {Math.abs(stats.revenue_change.daily).toFixed(1)}% today
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.pending_applications}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
              </div>
              <Link
                to="/matrix/admin/statistics"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                View detailed statistics
              </Link>
            </div>

            <div className="h-64 flex items-center justify-center">
              {stats.monthly_data && stats.monthly_data.length > 0 ? (
                <div className="w-full h-full">
                  <div className="flex h-full items-end justify-between gap-2">
                    {stats.monthly_data.map((month: any, index: number) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-purple-500 dark:bg-purple-600 rounded-t-md w-12"
                          style={{
                            height: `${Math.max(10, (month.revenue / Math.max(...stats.monthly_data.map((m: any) => m.revenue))) * 180)}px`,
                          }}
                        ></div>
                        <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">{month.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
              )}
            </div>
          </div>

          {/* Seller Applications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seller Applications</h2>
              </div>
              <Link
                to="/matrix/admin/seller-applications"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sellerApplications.length > 0 ? (
                    sellerApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.business_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {application.business_type.charAt(0).toUpperCase() + application.business_type.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.user?.username || application.user_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {application.user?.email || application.user_email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                            {application.category?.charAt(0).toUpperCase() + application.category?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : application.status === "approved"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {application.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {application.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {application.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(application.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {application.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApplicationAction(application.id, "approved")}
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApplicationAction(application.id, "rejected")}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <Link
                              to={`/matrix/admin/seller-applications/${application.id}`}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                            >
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No seller applications found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h2>
              </div>
              <Link
                to="/matrix/admin/products"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                View all products
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.top_products && stats.top_products.length > 0 ? (
                stats.top_products.map((product: any, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 flex items-center">
                    <img
                      src={product.image_url || "/placeholder.svg?height=60&width=60"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                      crossOrigin="anonymous"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Sold: {product.total_quantity}</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          $
                          {product.total_revenue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

