
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"
// Create a new order
export const createOrder = async (orderData: any, token: string) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to create order")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating order:", error)

    // For development/testing, return a mock order if API fails
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock order response for development")
      return {
        _id: `mock_order_${Date.now()}`,
        user_id: orderData.user_id,
        items: orderData.items,
        total: orderData.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        status: "pending",
        payment_status: "pending",
        created_at: new Date().toISOString(),
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
      }
    }

    throw error
  }
}

// Get all orders for the current user
export const getUserOrders = async (token: string, status?: string, skip = 0, limit = 50) => {
  try {
    let url = `${API_URL}/orders?skip=${skip}&limit=${limit}`
    if (status) {
      url += `&status=${status}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to get user orders")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting user orders:", error)
    throw error
  }
}

// Get order details by ID
export const getOrderById = async (orderId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to get order details")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting order details:", error)
    throw error
  }
}

// Update order status
export const updateOrderStatus = async (orderId: string, status: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to update order status")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

// Track order by order number
export const trackOrder = async (orderNumber: string) => {
  try {
    const response = await fetch(`${API_URL}/orders/track/${orderNumber}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to track order")
    }

    return await response.json()
  } catch (error) {
    console.error("Error tracking order:", error)
    throw error
  }
}

