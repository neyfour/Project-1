import { api } from "../config/db"

// Create a new order
export const createOrder = async (orderData: any, token: string): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${api.url}/orders`, {
      method: "POST",
      headers: api.getHeaders(token),
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to create order")
    }

    return await response.json()
  } catch (error) {
    console.error("Create order error:", error)
    throw error
  }
}

// Get user orders
export const getUserOrders = async (token: string): Promise<any[]> => {
  try {
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${api.url}/orders/user`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user orders")
    }

    return await response.json()
  } catch (error) {
    console.error("Get user orders error:", error)
    return []
  }
}

// Get order details
export const getOrderDetails = async (orderId: string, token: string): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${api.url}/orders/${orderId}`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch order details")
    }

    return await response.json()
  } catch (error) {
    console.error("Get order details error:", error)
    throw error
  }
}

// Update order status (for admin/seller)
export const updateOrderStatus = async (orderId: string, status: string, token: string): Promise<any> => {
  try {
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${api.url}/orders/${orderId}/status`, {
      method: "PUT",
      headers: api.getHeaders(token),
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error("Failed to update order status")
    }

    return await response.json()
  } catch (error) {
    console.error("Update order status error:", error)
    throw error
  }
}

