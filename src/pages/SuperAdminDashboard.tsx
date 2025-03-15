"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ShoppingBag, Users, Package, Bell, CheckCircle, XCircle, Clock } from "lucide-react"
import { useStore } from "../store"
import { getMockSellerApplications } from "../api/notificationApi"
import Sidebar from "../components/Sidebar"
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
        const applications = getMockSellerApplications()
        setSellerApplications(applications)

        // Set mock stats
        setStats({
          total_users: 1245,
          total_sellers: 87,
          total_products: 3456,
          total_orders: 5678,
          pending_applications: applications.filter((app) => app.status === "pending").length,
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

  const handleApplicationAction = async (applicationId: string, userId: string, action: "approved" | "rejected") => {
    try {
      // In a real app, you would call your API to update the application status
      // await updateSellerStatus(userId, action, token!)

      // Update the local state
      setSellerApplications((prevApplications) =>
        prevApplications.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: action,
                [action === "approved" ? "approved_at" : "rejected_at"]: new Date().toISOString(),
              }
            : app,
        ),
      )

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
      <Sidebar />

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
              <div className="flex gap-4">
                <Link
                  to="/matrix/forum"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Seller Forum
                </Link>
                <Link
                  to="/matrix/notifications"
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Notifications
                </Link>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                </div>
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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

          {/* Seller Applications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seller Applications</h2>
              </div>
              <Link
                to="/matrix/seller-applications"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
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
                            {application.user_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{application.user_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                            {application.category.charAt(0).toUpperCase() + application.category.slice(1)}
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
                                onClick={() => handleApplicationAction(application.id, application.user_id, "approved")}
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApplicationAction(application.id, application.user_id, "rejected")}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <Link
                              to={`/matrix/seller-applications/${application.id}`}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
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
        </div>
      </div>
    </div>
  )
}

