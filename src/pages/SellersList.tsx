"use client"

import { useState, useEffect } from "react"
import { Users, Search, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import { useStore } from "../store"
import toast from "react-hot-toast"

export default function SellersList() {
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSellers, setFilteredSellers] = useState<any[]>([])
  const token = useStore((state) => state.token)

  useEffect(() => {
    fetchSellers()
  }, [token])

  useEffect(() => {
    if (searchQuery) {
      setFilteredSellers(
        sellers.filter(
          (seller) =>
            seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.business_name?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredSellers(sellers)
    }
  }, [searchQuery, sellers])

  const fetchSellers = async () => {
    try {
      setLoading(true)
      // In a real app, you would fetch this from your API
      // const data = await getUsers(token || "", { role: "seller" })

      // For now, use mock data
      const mockSellers = [
        {
          id: "seller1",
          username: "JohnSmith",
          email: "john@example.com",
          role: "seller",
          business_name: "Smith Sports Equipment",
          created_at: "2023-05-15T10:30:00Z",
          status: "active",
          products_count: 24,
          orders_count: 156,
          total_revenue: 8945.75,
        },
        {
          id: "seller2",
          username: "SarahJohnson",
          email: "sarah@example.com",
          role: "seller",
          business_name: "Johnson Fitness",
          created_at: "2023-06-20T14:45:00Z",
          status: "active",
          products_count: 18,
          orders_count: 92,
          total_revenue: 5230.5,
        },
        {
          id: "seller3",
          username: "MichaelBrown",
          email: "michael@example.com",
          role: "seller",
          business_name: "Brown's Basketball",
          created_at: "2023-07-10T09:15:00Z",
          status: "inactive",
          products_count: 12,
          orders_count: 45,
          total_revenue: 2150.25,
        },
        {
          id: "seller4",
          username: "EmilyDavis",
          email: "emily@example.com",
          role: "seller",
          business_name: "Davis Swimming Supplies",
          created_at: "2023-08-05T11:20:00Z",
          status: "active",
          products_count: 30,
          orders_count: 210,
          total_revenue: 12450.8,
        },
      ]

      setSellers(mockSellers)
      setFilteredSellers(mockSellers)
    } catch (error) {
      console.error("Error fetching sellers:", error)
      toast.error("Failed to load sellers")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (sellerId: string, newStatus: string) => {
    try {
      // In a real app, you would call your API to update the seller status
      // await updateSellerStatus(sellerId, newStatus, token!)

      // Update the local state
      setSellers((prevSellers) =>
        prevSellers.map((seller) =>
          seller.id === sellerId
            ? {
                ...seller,
                status: newStatus,
              }
            : seller,
        ),
      )

      toast.success(`Seller status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating seller status:", error)
      toast.error("Failed to update seller status")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sellers</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your platform sellers</p>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sellers...</p>
          </div>
        ) : filteredSellers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            {seller.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{seller.username}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{seller.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{seller.business_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Joined {new Date(seller.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          seller.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {seller.status === "active" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {seller.products_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {seller.orders_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${seller.total_revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <select
                          value={seller.status}
                          onChange={(e) => handleStatusChange(seller.id, e.target.value)}
                          className="text-sm rounded-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <a
                          href={`/seller/dashboard?access=${seller.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No sellers found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              No sellers match your search criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

