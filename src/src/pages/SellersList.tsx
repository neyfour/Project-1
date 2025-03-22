"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Users, Search, Filter, ArrowUpRight, Package, ShoppingBag, DollarSign, Calendar } from "lucide-react"
import { useStore } from "../store"
import { getSellers } from "../api/authApi"
import SuperAdminSidebar from "../components/SuperAdminSidebar"
import toast from "react-hot-toast"

export default function SellersList() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sellers, setSellers] = useState<any[]>([])
  const [filteredSellers, setFilteredSellers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  const token = useStore((state) => state.token)

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        const sellersData = await getSellers(token)
        setSellers(sellersData)
        setFilteredSellers(sellersData)
      } catch (err) {
        console.error("Error fetching sellers:", err)
        setError("Failed to load sellers")
        toast.error("Failed to load sellers")
      } finally {
        setLoading(false)
      }
    }

    fetchSellers()
  }, [token])

  useEffect(() => {
    // Filter and sort sellers when search query or sort options change
    let result = [...sellers]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (seller) =>
          seller.username?.toLowerCase().includes(query) ||
          seller.email?.toLowerCase().includes(query) ||
          seller.full_name?.toLowerCase().includes(query) ||
          seller.business_name?.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortBy]
      let valueB = b[sortBy]

      // Handle numeric values
      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA
      }

      // Handle date values
      if (sortBy === "created_at") {
        valueA = new Date(valueA).getTime()
        valueB = new Date(valueB).getTime()
        return sortOrder === "asc" ? valueA - valueB : valueB - valueA
      }

      // Handle string values
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      return 0
    })

    setFilteredSellers(result)
  }, [sellers, searchQuery, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The filtering is already handled in the useEffect
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new sort field and default to descending order
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const viewSellerDashboard = (sellerId: string) => {
    // In a real implementation, this would navigate to the seller's dashboard
    // or set a context/state to view the seller's data
    toast.success("Viewing seller dashboard")
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sellers</h1>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white"
                  />
                </form>

                <div className="relative">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-gray-700 dark:text-gray-300">Sort by: {sortBy}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 hidden">
                    <div className="py-1">
                      <button
                        onClick={() => handleSort("username")}
                        className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Username
                      </button>
                      <button
                        onClick={() => handleSort("total_products")}
                        className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Products
                      </button>
                      <button
                        onClick={() => handleSort("total_sales")}
                        className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sales
                      </button>
                      <button
                        onClick={() => handleSort("created_at")}
                        className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Date Joined
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sellers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.length > 0 ? (
              filteredSellers.map((seller) => (
                <div key={seller._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {seller.avatar_url ? (
                          <img
                            src={seller.avatar_url || "/placeholder.svg"}
                            alt={seller.username}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-4">
                            <span className="text-purple-600 dark:text-purple-400 font-medium text-lg">
                              {seller.username?.charAt(0).toUpperCase() || "S"}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{seller.username}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{seller.email}</p>
                        </div>
                      </div>
                      <Link
                        to={`/matrix/admin/sellers/${seller._id}`}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </Link>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {seller.business_name || "No business name"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {seller.business_type || "Individual seller"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Products</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                          {seller.total_products || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-lg">
                        <div className="flex items-center">
                          <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Orders</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                          {seller.total_orders || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Total Sales</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          $
                          {seller.total_sales?.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || "0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        Joined {new Date(seller.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => viewSellerDashboard(seller._id)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        View Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No sellers found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? "Try adjusting your search criteria" : "There are no sellers registered yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

