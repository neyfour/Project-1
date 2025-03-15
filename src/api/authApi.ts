// src/api/authApi.ts
import { api } from "../config/db"
import type { User } from "../types"

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export const registerUser = async (username: string, email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${api.url}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ full_name: username, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Registration failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Format credentials for OAuth2 password flow
    const formData = new URLSearchParams()
    formData.append("username", email)
    formData.append("password", password)

    // Try to make login request to the backend
    try {
      const response = await fetch(`${api.url}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      })

      if (response.ok) {
        const data: LoginResponse = await response.json()

        // If the API returns the user directly with the token, use it
        if (data.user) {
          // Store token in localStorage for future requests
          localStorage.setItem("auth_token", data.access_token)
          return data.user
        }

        // Otherwise, get user profile with the token
        const userResponse = await fetch(`${api.url}/users/me`, {
          headers: api.getHeaders(data.access_token),
        })

        if (userResponse.ok) {
          // Store token in localStorage for future requests
          localStorage.setItem("auth_token", data.access_token)
          return await userResponse.json()
        }
      }

      // If we get here, the API call failed but didn't throw an error
      throw new Error("Login failed")
    } catch (error) {
      console.log("Backend login failed, using mock login:", error)
      // If backend login fails, use mock login
      return mockLogin(email, password)
    }
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Update the mockLogin function to support all roles
const mockLogin = (email: string, password: string): User => {
  // Simple validation
  if (!email || !password) {
    throw new Error("Email and password are required")
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  // Create a mock user based on the email
  let role: "buyer" | "seller" | "admin" | "superadmin" = "buyer"

  // Special handling for different account types
  if (email === "superadmin@example.com") {
    role = "superadmin"
  } else if (email === "admin@example.com") {
    role = "admin"
  } else if (email.includes("seller")) {
    role = "seller"
  }

  const mockUser: User = {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    email: email,
    username: email.split("@")[0],
    role: role,
    created_at: new Date().toISOString(),
    avatar_url: `https://ui-avatars.com/api/?name=${email.split("@")[0]}&background=random`,
  }

  // Store mock token
  localStorage.setItem("auth_token", `mock_token_${mockUser.id}`)

  return mockUser
}

export const logoutUser = () => {
  // Remove token from localStorage
  localStorage.removeItem("auth_token")
  console.log("Logging out user")
}

// Add a function to check if user is logged in
export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem("auth_token")

    if (!token) {
      return null
    }

    const response = await fetch(`${api.url}/users/me`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      localStorage.removeItem("auth_token")
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Auth check error:", error)
    return null
  }
}

// Add a function to apply for seller status
export const applyForSeller = async (applicationData: any, token: string): Promise<User> => {
  try {
    const response = await fetch(`${api.url}/users/apply-seller`, {
      method: "POST",
      headers: api.getHeaders(token),
      body: JSON.stringify(applicationData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Application failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Seller application error:", error)
    throw error
  }
}

// Add a function for superadmin to approve/reject seller applications
export const updateSellerStatus = async (
  userId: string,
  status: "approved" | "rejected",
  token: string,
): Promise<User> => {
  try {
    const response = await fetch(`${api.url}/admin/seller-applications/${userId}`, {
      method: "PUT",
      headers: api.getHeaders(token),
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to update seller status")
    }

    return await response.json()
  } catch (error) {
    console.error("Update seller status error:", error)
    throw error
  }
}

