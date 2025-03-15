import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Product, Theme, Notification, ChatMessage, ChatRoom } from "../types"
import { loginUser, registerUser, checkAuthStatus } from "../api/authApi"

interface StoreState {
  user: User | null
  token: string | null
  products: Product[]
  theme: Theme
  notifications: Notification[]
  chatMessages: ChatMessage[]
  chatRooms: ChatRoom[]
  activeRoom: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  toggleTheme: () => void
  loginUser: (email: string, password: string) => Promise<void>
  registerUser: (userData: { email: string; password: string; full_name: string; role?: string }) => Promise<void>
  logoutUser: () => void
  checkAuth: () => Promise<boolean>
  applyForSeller: (applicationData: any) => Promise<void>
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  clearNotifications: () => void
  addChatMessage: (message: ChatMessage) => void
  setChatRooms: (rooms: ChatRoom[]) => void
  setActiveRoom: (roomId: string | null) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      products: [],
      theme: "light",
      notifications: [],
      chatMessages: [],
      chatRooms: [],
      activeRoom: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setProducts: (products) => set({ products }),
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),
      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
        })),
      deleteProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        })),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      loginUser: async (email, password) => {
        try {
          const userData = await loginUser(email, password)
          set({ user: userData, token: localStorage.getItem("auth_token") || "sample-token" })
        } catch (error) {
          console.error("Login failed:", error)
          throw error
        }
      },
      registerUser: async (userData) => {
        try {
          const user = await registerUser(userData.full_name, userData.email, userData.password)
          // After registration, log the user in
          const loggedInUser = await loginUser(userData.email, userData.password)
          set({ user: loggedInUser, token: localStorage.getItem("auth_token") || "sample-token" })
        } catch (error) {
          console.error("Registration failed:", error)
          throw error
        }
      },
      logoutUser: () => {
        localStorage.removeItem("auth_token")
        set({ user: null, token: null })
      },
      checkAuth: async () => {
        try {
          const user = await checkAuthStatus()
          if (user) {
            set({ user, token: localStorage.getItem("auth_token") || "sample-token" })
            return true
          }
          return false
        } catch (error) {
          console.error("Auth check failed:", error)
          set({ user: null, token: null })
          return false
        }
      },
      applyForSeller: async (applicationData) => {
        try {
          // In a real app, you would make an API call to submit the application
          // For now, we'll just update the user object locally
          const { user } = get()
          if (!user) throw new Error("User not authenticated")

          const updatedUser = {
            ...user,
            seller_application: {
              status: "pending",
              ...applicationData,
              submitted_at: new Date().toISOString(),
            },
          }

          set({ user: updatedUser })

          // Add a notification for the superadmin (in a real app, this would be done on the server)
          const notification: Notification = {
            id: Date.now().toString(),
            type: "seller_application",
            title: "New Seller Application",
            message: `${user.username || user.full_name} has applied to become a seller`,
            user_id: "superadmin", // This would be the superadmin's ID in a real app
            read: false,
            created_at: new Date().toISOString(),
            data: { applicant_id: user.id },
          }

          get().addNotification(notification)

          return Promise.resolve()
        } catch (error) {
          console.error("Seller application failed:", error)
          throw error
        }
      },
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        })),
      clearNotifications: () => set({ notifications: [] }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      setChatRooms: (rooms) => set({ chatRooms: rooms }),
      setActiveRoom: (roomId) => set({ activeRoom: roomId }),
    }),
    {
      name: "matrix-store",
    },
  ),
)

