// src/api/sellerDashboardApi.ts
import { api } from "../config/db"

// Types for seller dashboard data
export interface SellerDashboardData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  averageOrderValue: number
  revenueByMonth: { month: string; revenue: number }[]
  topProducts: { id: string; name: string; sales: number; revenue: number }[]
  categoryDistribution: { category: string; percentage: number }[]
  customerDemographics: { age: string; percentage: number }[]
  revenueBreakdown: { source: string; percentage: number }[]
}

export interface SellerPredictionData {
  revenueForecasts: { period: string; amount: number }[]
  growthRate: number
  productPerformance: { product: string; score: number }[]
  successProbability: number
  categoryDistribution: { category: string; percentage: number }[]
  recommendations: string[]
}

// Function to fetch seller dashboard overview data
export const getSellerDashboardOverview = async (token: string, sellerId?: string): Promise<SellerDashboardData> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  // Use the correct endpoint from your backend
  const response = await fetch(`${api.url}/statistics/dashboard${sellerId ? `?seller_id=${sellerId}` : ""}`, {
    headers,
    method: "GET",
    mode: "cors", // Explicitly set CORS mode
    credentials: "include",
    signal: AbortSignal.timeout(10000), // 10 second timeout
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Dashboard API error:", errorData)
    throw new Error(`Error fetching dashboard data: ${response.status}`)
  }

  const data = await response.json()
  return transformDashboardData(data)
}

// Function to fetch seller sales predictions
export const getSellerSalesPredictions = async (
  token: string,
  timeframe = "1year",
  sellerId?: string,
): Promise<SellerPredictionData> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  // Convert timeframe to days for the backend
  let days = 365 // default for 1year
  if (timeframe === "5years") days = 1825
  if (timeframe === "6months") days = 180

  // Use the correct endpoint from your backend
  // If sellerId is not provided, the backend will use the current user's ID
  const url = sellerId
    ? `${api.url}/predictions/sales/seller/${sellerId}?days=${days}`
    : `${api.url}/predictions/sales/seller/me?days=${days}`

  const response = await fetch(url, {
    method: "GET",
    headers,
    mode: "cors", // Explicitly set CORS mode
    credentials: "include",
    signal: AbortSignal.timeout(10000), // 10 second timeout
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Sales predictions API error:", errorData)
    throw new Error(`Error fetching sales predictions: ${response.status}`)
  }

  const data = await response.json()
  return transformPredictionData(data, timeframe)
}

// Function to fetch seller product predictions
export const getSellerProductPredictions = async (
  token: string,
  productId: string,
  timeframe = "1year",
): Promise<any> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  // Convert timeframe to days for the backend
  let days = 365 // default for 1year
  if (timeframe === "5years") days = 1825
  if (timeframe === "6months") days = 180

  // Use the correct endpoint from your backend
  const response = await fetch(`${api.url}/predictions/sales/${productId}?days=${days}`, {
    method: "GET",
    headers,
    mode: "cors", // Explicitly set CORS mode
    credentials: "include",
    signal: AbortSignal.timeout(10000), // 10 second timeout
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Product predictions API error:", errorData)
    throw new Error(`Error fetching product predictions: ${response.status}`)
  }

  return await response.json()
}

// Function to fetch seller statistics
export const getSellerStatistics = async (
  token: string,
  period = "all",
  sellerId?: string,
): Promise<SellerDashboardData> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  // For history endpoint, we need to convert period to days
  let days = 365 // default for "all"
  if (period === "year") days = 365
  if (period === "month") days = 30
  if (period === "week") days = 7

  // Use the correct endpoint from your backend
  const response = await fetch(
    `${api.url}/statistics/history?days=${days}${sellerId ? `&seller_id=${sellerId}` : ""}`,
    {
      method: "GET",
      headers,
      mode: "cors", // Explicitly set CORS mode
      credentials: "include",
      signal: AbortSignal.timeout(10000), // 10 second timeout
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Statistics API error:", errorData)
    throw new Error(`Error fetching statistics: ${response.status}`)
  }

  const data = await response.json()
  return transformHistoryData(data, period)
}

// Transform dashboard data from the backend format to the frontend format
function transformDashboardData(data: any): SellerDashboardData {
  // Extract revenue by month from monthly_data
  const revenueByMonth =
    data.monthly_data?.map((item: any) => ({
      month: item.month,
      revenue: item.revenue,
    })) || []

  // Extract top products
  const topProducts =
    data.top_products?.map((product: any) => ({
      id: product.product_id,
      name: product.name,
      sales: product.total_quantity,
      revenue: product.total_revenue,
    })) || []

  // Calculate average order value
  const averageOrderValue = data.orders.total > 0 ? data.revenue.total / data.orders.total : 0

  // Create category distribution from top products
  const categoryDistribution = []
  const categoryMap = new Map()

  // Calculate total revenue
  const totalRevenue = topProducts.reduce((sum, product) => sum + product.revenue, 0)

  // Group by categories and calculate percentages
  topProducts.forEach((product) => {
    const category = product.category || "Uncategorized"
    const currentValue = categoryMap.get(category) || 0
    categoryMap.set(category, currentValue + product.revenue)
  })

  // Convert to array of objects with percentages
  categoryMap.forEach((revenue, category) => {
    categoryDistribution.push({
      category,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    })
  })

  // If no categories, provide default
  if (categoryDistribution.length === 0) {
    categoryDistribution.push({ category: "No Data", percentage: 100 })
  }

  // Create customer demographics from data or default
  const customerDemographics = data.customer_demographics || [{ age: "No Data", percentage: 100 }]

  // Create revenue breakdown from data or default
  const revenueBreakdown = data.revenue_breakdown || [{ source: "Direct Sales", percentage: 100 }]

  return {
    totalRevenue: data.revenue.total || 0,
    totalOrders: data.orders.total || 0,
    totalProducts: data.product_count || 0,
    averageOrderValue,
    revenueByMonth,
    topProducts,
    categoryDistribution,
    customerDemographics,
    revenueBreakdown,
  }
}

// Transform history data from the backend format to the frontend format
function transformHistoryData(data: any[], period: string): SellerDashboardData {
  // If no data, return empty structure
  if (!data || data.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      averageOrderValue: 0,
      revenueByMonth: [],
      topProducts: [],
      categoryDistribution: [{ category: "No Data", percentage: 100 }],
      customerDemographics: [{ age: "No Data", percentage: 100 }],
      revenueBreakdown: [{ source: "No Data", percentage: 100 }],
    }
  }

  // Get the most recent statistics
  const latestStats = data[data.length - 1]

  // Create monthly revenue data from the history
  const revenueByMonth = data.map((stat: any) => ({
    month: new Date(stat.date).toLocaleString("default", { month: "short" }),
    revenue: stat.today_revenue || 0,
  }))

  return {
    totalRevenue: latestStats.total_revenue || 0,
    totalOrders: latestStats.total_orders || 0,
    totalProducts: latestStats.product_count || 0,
    averageOrderValue: latestStats.total_orders ? latestStats.total_revenue / latestStats.total_orders : 0,
    revenueByMonth,
    topProducts: [], // Will be populated from separate API call if needed
    categoryDistribution: [{ category: "No Data", percentage: 100 }],
    customerDemographics: [{ age: "No Data", percentage: 100 }],
    revenueBreakdown: [{ source: "No Data", percentage: 100 }],
  }
}

// Transform prediction data from the backend format to the frontend format
function transformPredictionData(data: any, timeframe: string): SellerPredictionData {
  // Group the daily predictions into periods based on the timeframe
  const revenueForecasts = groupPredictionsByTimeframe(data.predicted_revenue || [], timeframe)

  // Calculate growth rate from the prediction data
  const growthRate = calculateGrowthRate(data.predicted_revenue || [])

  // Extract product performance from the products list
  const productPerformance =
    data.products?.map((product: any, index: number) => ({
      product: product.name,
      score: data.confidence ? Math.round(data.confidence * 100) - index * 5 : 50 - index * 5,
    })) || []

  // Use confidence from the backend, scaled to percentage
  const successProbability = Math.round((data.confidence || 0) * 100)

  // Create category distribution from products
  const categoryDistribution = []
  const categoryMap = new Map()

  // If we have products with categories
  if (data.products && data.products.length > 0) {
    // Group by categories
    data.products.forEach((product: any) => {
      const category = product.category || "Uncategorized"
      const currentCount = categoryMap.get(category) || 0
      categoryMap.set(category, currentCount + 1)
    })

    // Calculate total count
    const totalCount = data.products.length

    // Convert to array of objects with percentages
    categoryMap.forEach((count, category) => {
      categoryDistribution.push({
        category,
        percentage: (count / totalCount) * 100,
      })
    })
  }

  // If no categories, provide default
  if (categoryDistribution.length === 0) {
    categoryDistribution.push({ category: "No Data", percentage: 100 })
  }

  // Generate recommendations based on the data
  const recommendations = generateRecommendations(data, productPerformance)

  return {
    revenueForecasts,
    growthRate,
    productPerformance,
    successProbability,
    categoryDistribution,
    recommendations,
  }
}

// Group daily predictions into periods based on the timeframe
function groupPredictionsByTimeframe(
  dailyPredictions: number[],
  timeframe: string,
): { period: string; amount: number }[] {
  if (!dailyPredictions || dailyPredictions.length === 0) {
    return [{ period: "No Data", amount: 0 }]
  }

  const result = []

  if (timeframe === "5years") {
    // Group by years (assuming daily predictions)
    for (let i = 0; i < 5; i++) {
      const yearStart = i * 365
      const yearEnd = Math.min((i + 1) * 365, dailyPredictions.length)
      if (yearStart >= dailyPredictions.length) break

      const yearRevenue = dailyPredictions.slice(yearStart, yearEnd).reduce((sum, val) => sum + val, 0)
      result.push({ period: `Year ${i + 1}`, amount: yearRevenue })
    }
  } else if (timeframe === "1year") {
    // Group by quarters
    for (let i = 0; i < 4; i++) {
      const quarterStart = i * 90
      const quarterEnd = Math.min((i + 1) * 90, dailyPredictions.length)
      if (quarterStart >= dailyPredictions.length) break

      const quarterRevenue = dailyPredictions.slice(quarterStart, quarterEnd).reduce((sum, val) => sum + val, 0)
      result.push({ period: `Q${i + 1}`, amount: quarterRevenue })
    }
  } else if (timeframe === "6months") {
    // Group by months
    for (let i = 0; i < 6; i++) {
      const monthStart = i * 30
      const monthEnd = Math.min((i + 1) * 30, dailyPredictions.length)
      if (monthStart >= dailyPredictions.length) break

      const monthRevenue = dailyPredictions.slice(monthStart, monthEnd).reduce((sum, val) => sum + val, 0)
      result.push({ period: `Month ${i + 1}`, amount: monthRevenue })
    }
  }

  return result.length > 0 ? result : [{ period: "No Data", amount: 0 }]
}

// Calculate growth rate from prediction data
function calculateGrowthRate(dailyPredictions: number[]): number {
  if (!dailyPredictions || dailyPredictions.length < 2) {
    return 0
  }

  const firstHalf = dailyPredictions.slice(0, Math.floor(dailyPredictions.length / 2))
  const secondHalf = dailyPredictions.slice(Math.floor(dailyPredictions.length / 2))

  const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

  if (firstHalfAvg === 0) return 0

  const growthRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
  return Math.round(growthRate)
}

// Generate recommendations based on prediction data
function generateRecommendations(data: any, productPerformance: any[]): string[] {
  // Real estate specific recommendations
  const recommendations = [
    "Focus on properties with the highest projected ROI",
    "Consider expanding your portfolio in emerging neighborhoods",
    "Optimize pricing strategy based on market trends",
    "Implement virtual tours for higher engagement",
    "Target marketing efforts on high-demand property types",
  ]

  // If we have product performance data, customize recommendations
  if (productPerformance && productPerformance.length > 0) {
    const topProduct = productPerformance[0].product
    recommendations[0] = `Focus on properties like "${topProduct}" with the highest projected ROI`
  }

  return recommendations
}

