// src/config/db.ts
import mongoose from "mongoose"

// Use environment variables with fallback values
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || "mongodb://localhost:27017/matrix-ecommerce"
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const connectDB = async () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      console.log("Browser environment detected - using API for MongoDB operations")
      return
    }

    // Server environment - connect directly to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    // Don't exit process in browser environment
    if (typeof window === "undefined") {
      process.exit(1)
    }
  }
}

export const disconnectDB = async () => {
  try {
    if (typeof window !== "undefined") {
      console.log("Browser environment detected - no need to disconnect")
      return
    }

    await mongoose.disconnect()
    console.log("MongoDB disconnected successfully")
  } catch (error) {
    console.error("MongoDB disconnection error:", error)
  }
}

export const api = {
  url: API_URL,

  // Function to create headers with authentication token
  getHeaders: (token?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  },
}

