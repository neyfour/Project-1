// src/api/dashboardApi.ts
import { api } from "../config/db"
import type { SalesPrediction, Product, Order } from "../types"

interface DashboardOverview {
  recent_products: Product[]
  recent_orders: Order[]
  stats: {
    total_orders: number
    total_products: number
    total_users: number
  }
}

interface StatisticsResponse {
  total_revenue: number
  total_orders: number
  total_products: number
  avg_order_value: number
  top_categories: Array<{
    name: string
    count: number
    revenue: number
  }>
  top_products: Array<{
    id: string
    title: string
    sales: number
    revenue: number
  }>
}

export const getDashboardOverview = async (token: string): Promise<DashboardOverview> => {
  try {
    const response = await fetch(`${api.url}/dashboard/overview`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching dashboard overview")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching dashboard overview:", error)
    throw error
  }
}

export const getSalesPredictions = async (token: string, timeframe = "5years"): Promise<SalesPrediction[]> => {
  try {
    const response = await fetch(`${api.url}/predictions/sales?timeframe=${timeframe}`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching sales predictions")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching sales predictions:", error)
    throw error
  }
}

export const getProductPredictions = async (token: string): Promise<any[]> => {
  try {
    const response = await fetch(`${api.url}/predictions/products`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching product predictions")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching product predictions:", error)
    throw error
  }
}

export const getStatistics = async (token: string): Promise<StatisticsResponse> => {
  try {
    const response = await fetch(`${api.url}/statistics`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching statistics")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching statistics:", error)
    throw error
  }
}

