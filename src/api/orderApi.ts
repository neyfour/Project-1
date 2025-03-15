// src/api/orderApi.ts
import { api } from "../config/db"
import type { Order } from "../types"

export const getOrders = async (token: string): Promise<Order[]> => {
  try {
    const response = await fetch(`${api.url}/orders`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching orders")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export const getOrderById = async (id: string, token: string): Promise<Order> => {
  try {
    const response = await fetch(`${api.url}/orders/${id}`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error(`Error fetching order with id ${id}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching order with id ${id}:`, error)
    throw error
  }
}

export const createOrder = async (orderData: Partial<Order>, token: string): Promise<Order> => {
  try {
    const response = await fetch(`${api.url}/orders`, {
      method: "POST",
      headers: api.getHeaders(token),
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error creating order")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export const updateOrderStatus = async (id: string, status: string, token: string): Promise<any> => {
  try {
    const response = await fetch(`${api.url}/orders/${id}/status?status=${status}`, {
      method: "PUT",
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error updating status for order ${id}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating status for order ${id}:`, error)
    throw error
  }
}

export const searchOrders = async (query: string, token: string): Promise<Order[]> => {
  try {
    const response = await fetch(`${api.url}/search?query=${encodeURIComponent(query)}&type=orders`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error searching orders")
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error(`Error searching orders with query ${query}:`, error)
    throw error
  }
}

