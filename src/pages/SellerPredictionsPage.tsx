"use client"

import { useState, useEffect } from "react"
import { useStore } from "../store"
import SellerSidebar from "../components/SellerSidebar"
import { getSellerSalesPredictions } from "../api/sellerDashboardApi"
import type { SellerPredictionData } from "../api/sellerDashboardApi"
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
} from "recharts"
import { ArrowUp, TrendingUp, BarChart2, AlertCircle, CheckCircle, Zap, Home } from "lucide-react"
import toast from "react-hot-toast"

const COLORS = ["#4f46e5", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"]
// Update the chart colors and styling for a more modern look
const CHART_COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e", "#f97316"]

export default function SellerPredictionsPage() {
  const [loading, setLoading] = useState(true)
  const [predictionData, setPredictionData] = useState<SellerPredictionData | null>(null)
  const [timeframe, setTimeframe] = useState<string>("1year")
  const [error, setError] = useState<string | null>(null)

  const token = useStore((state) => state.token)
  const user = useStore((state) => state.user)

  // Update the useEffect to fetch data for the current logged-in seller
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        const data = await getSellerSalesPredictions(token, timeframe)
        setPredictionData(data)
      } catch (err) {
        console.error("Error fetching predictions:", err)
        setError("Unable to fetch prediction data.")
        toast.error("Error loading predictions. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [token, timeframe])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Check if user is a seller
  if (user?.role !== "seller" && user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex">
        <SellerSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex">
        <SellerSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex">
        <SellerSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!predictionData) {
    return (
      <div className="flex">
        <SellerSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No prediction data is available for your properties.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <SellerSidebar />
      <div className="flex-1 md:ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Real Estate Market Predictions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered forecasting and insights for your property portfolio
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTimeframe("5years")}
            className={`px-4 py-2 rounded-lg ${
              timeframe === "5years"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            }`}
          >
            5 Years
          </button>
          <button
            onClick={() => setTimeframe("1year")}
            className={`px-4 py-2 rounded-lg ${
              timeframe === "1year"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            }`}
          >
            1 Year
          </button>
          <button
            onClick={() => setTimeframe("6months")}
            className={`px-4 py-2 rounded-lg ${
              timeframe === "6months"
                ? "bg-indigo-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
            }`}
          >
            6 Months
          </button>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Projected Revenue</h3>
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(predictionData.revenueForecasts.reduce((sum, item) => sum + item.amount, 0))}
              </p>
              <p className="ml-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                <ArrowUp className="w-3 h-3 mr-1" />
                {predictionData.growthRate}%
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Projected total for selected timeframe</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Market Growth Rate</h3>
              <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{predictionData.growthRate}%</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Projected annual growth rate</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Top Property Type</h3>
              <Home className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {predictionData.productPerformance[0]?.product || "N/A"}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Score: {predictionData.productPerformance[0]?.score || 0}/100
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Forecast Confidence</h3>
              <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{predictionData.successProbability}%</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Confidence in forecast accuracy</p>
          </div>
        </div>

        {/* Revenue forecast chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Forecast</h2>
          {/* Replace the LineChart component with this updated version */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData.revenueForecasts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="period" stroke="#6B7280" axisLine={false} tickLine={false} />
                <YAxis
                  stroke="#6B7280"
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  itemStyle={{ color: "#111827" }}
                  labelStyle={{ color: "#6B7280", fontWeight: "bold" }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Projected Revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#4f46e5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property performance and category distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Type Performance</h2>
            {/* Update the Property Performance section with a more modern design */}
            <div className="space-y-4">
              {predictionData.productPerformance.map((product, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-32 truncate mr-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.product}</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${product.score}%`,
                          background: `linear-gradient(90deg, ${CHART_COLORS[0]} 0%, ${CHART_COLORS[1]} 100%)`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-right">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Property Type Distribution</h2>
            {/* Update the PieChart for Category Distribution */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={predictionData.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="category"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    paddingAngle={2}
                  >
                    {predictionData.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Percentage"]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Real Estate Market Insights</h2>
          </div>
          {/* Update the AI Recommendations section with a more modern design */}
          <div className="space-y-3">
            {predictionData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3"
                  style={{
                    background: `linear-gradient(135deg, ${CHART_COLORS[index % CHART_COLORS.length]} 0%, ${CHART_COLORS[(index + 1) % CHART_COLORS.length]} 100%)`,
                  }}
                >
                  <span className="text-white font-medium text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

