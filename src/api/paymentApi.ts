
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

// Process payment for an order
export const processPayment = async (paymentData: any, token: string) => {
  try {
    const response = await fetch(`${API_URL}/payments/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Payment processing failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error processing payment:", error)

    // For development/testing, return a mock successful payment if API fails
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock payment response for development")
      return {
        _id: `mock_payment_${Date.now()}`,
        order_id: paymentData.order_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        status: "completed",
        transaction_id: `txn_${Date.now()}`,
        created_at: new Date().toISOString(),
      }
    }

    throw error
  }
}

// Get payment details by ID
export const getPaymentById = async (paymentId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to get payment details")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting payment details:", error)
    throw error
  }
}

// Get all payments for the current user
export const getUserPayments = async (token: string, skip = 0, limit = 20) => {
  try {
    const response = await fetch(`${API_URL}/payments?skip=${skip}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to get user payments")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting user payments:", error)
    throw error
  }
}

// Generate invoice for a payment
export const generateInvoice = async (orderId: string, token: string) => {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to generate invoice")
    }

    return await response.blob()
  } catch (error) {
    console.error("Error generating invoice:", error)

    // For development/testing, generate a simple invoice if API fails
    if (process.env.NODE_ENV === "development") {
      console.warn("Using mock invoice for development")

      // Create a simple text invoice
      const invoiceText = `
        INVOICE
        -------
        Order ID: ${orderId}
        Date: ${new Date().toLocaleDateString()}
        
        Thank you for your purchase!
        
        This is a mock invoice for development purposes.
      `

      return new Blob([invoiceText], { type: "text/plain" })
    }

    throw error
  }
}

