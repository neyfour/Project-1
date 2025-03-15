// src/api/notificationApi.ts
import { api } from "../config/db"
import type { Notification } from "../types"

export const getNotifications = async (token: string): Promise<Notification[]> => {
  try {
    const response = await fetch(`${api.url}/notifications`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching notifications")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }
}

export const markNotificationAsRead = async (id: string, token: string): Promise<void> => {
  try {
    const response = await fetch(`${api.url}/notifications/${id}/read`, {
      method: "PUT",
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error(`Error marking notification ${id} as read`)
    }
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error)
    throw error
  }
}

export const getSellerApplications = async (token: string): Promise<any[]> => {
  try {
    const response = await fetch(`${api.url}/admin/seller-applications`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching seller applications")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching seller applications:", error)
    throw error
  }
}

// Mock data for seller applications
export const getMockSellerApplications = (): any[] => {
  return [
    {
      id: "app1",
      user_id: "user1",
      user_name: "John Smith",
      user_email: "john@example.com",
      business_name: "Smith Sports Equipment",
      business_type: "llc",
      category: "running",
      description: "We specialize in high-quality running gear for professional athletes.",
      status: "pending",
      submitted_at: "2024-06-10T14:30:00Z",
    },
    {
      id: "app2",
      user_id: "user2",
      user_name: "Sarah Johnson",
      user_email: "sarah@example.com",
      business_name: "Johnson Fitness",
      business_type: "individual",
      category: "fitness",
      description: "Premium fitness equipment for home and professional gyms.",
      status: "pending",
      submitted_at: "2024-06-09T10:15:00Z",
    },
    {
      id: "app3",
      user_id: "user3",
      user_name: "Michael Brown",
      user_email: "michael@example.com",
      business_name: "Brown's Basketball",
      business_type: "partnership",
      category: "basketball",
      description: "Specialized basketball equipment and apparel.",
      status: "approved",
      submitted_at: "2024-06-05T09:45:00Z",
      approved_at: "2024-06-07T11:20:00Z",
    },
    {
      id: "app4",
      user_id: "user4",
      user_name: "Emily Davis",
      user_email: "emily@example.com",
      business_name: "Davis Swimming Supplies",
      business_type: "llc",
      category: "swimming",
      description: "High-performance swimming gear for competitive swimmers.",
      status: "rejected",
      submitted_at: "2024-06-04T16:20:00Z",
      rejected_at: "2024-06-06T13:10:00Z",
      rejection_reason: "Incomplete business information provided.",
    },
  ]
}

