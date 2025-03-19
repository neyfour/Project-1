"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Users, Search, Filter, CheckCircle, XCircle, Clock, ArrowUpRight } from "lucide-react"
import { useStore } from "../store"
import { getSellerApplications, updateSellerStatus } from "../api/authApi"
import SuperAdminSidebar from "../components/SuperAdminSidebar"
import toast from "react-hot-toast"
import * as api from "../api"

export default function SellerApplicationsList() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [applications, setApplications] = useState<any[]>([])
  const [filteredApplications, setFilteredApplications] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const token = useStore((state) => state.token)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        console.log("Fetching seller applications...")
        const data = await getSellerApplications(token)
        console.log("Received seller applications:", data)

        if (Array.isArray(data)) {
          setApplications(data)
          setFilteredApplications(data)
        } else {
          console.error("Invalid data format received:", data)
          setApplications([])
          setFilteredApplications([])
          setError("Invalid data format received from server")
        }
      } catch (err) {
        console.error("Error fetching seller applications:", err)
        setError("Failed to load seller applications")
        setApplications([])
        setFilteredApplications([])
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchApplications, 30000)

    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    // Filter applications based on search query and status filter
    let filtered = [...applications]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.business_name?.toLowerCase().includes(query) ||
          app.user?.username?.toLowerCase().includes(query) ||
          app.user?.email?.toLowerCase().includes(query),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [applications, searchQuery, statusFilter])

  const handleApplicationAction = async (applicationId: string, action: "approved" | "rejected") => {
    try {
      console.log(`Attempting to ${action} application with ID:`, applicationId)

      if (!applicationId) {
        toast.error(`Cannot ${action} application: Missing application ID`)
        return
      }

      await updateSellerStatus(
        applicationId,
        action,
        action === "rejected" ? "Application rejected by admin" : "",
        token!,
      )

      // Update the local state
      setApplications((prevApplications) =>
        prevApplications.map((app) => (app._id === applicationId ? { ...app, status: action } : app)),
      )

      // Find the application to get the user ID
      const application = applications.find((app) => app._id === applicationId)

      if (application && application.user_id) {
        // Create notification for the user
        try {
          await fetch(`${api.url}/notifications`, {
            method: "POST",
            headers: api.getHeaders(token!),
            body: JSON.stringify({
              user_id: application.user_id,
              type: "seller_application_status",
              title: `Application ${action}`,
              message:
                action === "approved"
                  ? "Congratulations! Your seller application has been approved. You can now access the seller dashboard."
                  : "Your seller application has been rejected. Please contact support for more information.",
              data: { application_id: applicationId, status: action },
            }),
          })
        } catch (notifError) {
          console.error("Failed to create notification:", notifError)
          // Continue even if notification creation fails
        }
      }

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
      <SuperAdminSidebar />

      <div className="flex-1 md:ml-64 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Seller Applications</h1>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white"
                  />
                </div>

                <div className="relative">
                  <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
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
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((application) => (
                      <tr key={application._id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.business_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {application.business_type?.charAt(0).toUpperCase() + application.business_type?.slice(1)}
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
                            className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full 
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
                            {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(application.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {application.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleApplicationAction(application._id, "approved")}
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApplicationAction(application._id, "rejected")}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <Link
                              to={`/matrix/admin/seller-applications/${application._id}`}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                            >
                              <ArrowUpRight className="w-5 h-5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                          No applications found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery || statusFilter !== "all"
                            ? "Try adjusting your filters"
                            : "No seller applications have been submitted yet"}
                        </p>
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

