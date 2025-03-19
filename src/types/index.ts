export type UserRole = "buyer" | "seller" | "admin" | "superadmin"

export interface User {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  created_at: string
  seller_application?: {
    status: "pending" | "approved" | "rejected"
    business_name?: string
    business_type?: string
    category?: string
    description?: string
    submitted_at: string
  }
}

export interface Product {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string
  created_at: string
  stock: number
  rating: number
  reviews_count: number
  views_count: number
  clicks_count: number
  sales_count: number
  sku: string
  brand?: string
  sport_type?: string
  variants?: ProductVariant[]
  specifications?: Record<string, string>
  seller?: {
    full_name: string
    avatar_url?: string
    rating: number
  }
}

export interface ProductVariant {
  id: string
  product_id: string
  title: string
  price: number
  stock: number
  sku: string
  attributes: Record<string, string>
  color?: string
  size?: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  user_name: string
  user_avatar?: string
  helpful_count: number
}

export interface Order {
  id: string
  user_id: string
  seller_id: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  created_at: string
  shipping_address: Address
  billing_address: Address
  items: OrderItem[]
  payment_status: "pending" | "paid" | "failed"
  tracking_number?: string
  tracking_updates?: TrackingUpdate[]
}

export interface OrderItem {
  product_id: string
  quantity: number
  price: number
  product_title: string
  product_image: string
  variant_title?: string
}

export interface Address {
  full_name: string
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
}

export interface TrackingUpdate {
  status: string
  location: string
  timestamp: string
  description: string
}

export interface SalesPrediction {
  period: string
  actual_revenue?: number
  predicted_revenue: number
  confidence_score: number
  growth_rate: number
  factors: {
    seasonal_impact: number
    market_trend: number
    competition_index: number
  }
}

export interface MarketInsight {
  category: string
  market_size: number
  growth_rate: number
  competition_level: "low" | "medium" | "high"
  opportunity_score: number
  trending_keywords: string[]
  price_range: {
    min: number
    max: number
    optimal: number
  }
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
}

export interface Event {
  id: string
  user_id: string
  title: string
  description: string
  type: "tournament" | "training" | "other"
  sport: string
  date: string
  location: string
  price?: number
  max_participants?: number
  current_participants: number
  image_url?: string
}

export type Theme = "light" | "dark"

export interface Notification {
  id: string
  type: "seller_application" | "order_update" | "system"
  title: string
  message: string
  user_id: string
  read: boolean
  created_at: string
  data?: any
}

// Add a message type for the forum/chat
export interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  timestamp: string
  room_id?: string
  is_system?: boolean
}

// Add a chat room type
export interface ChatRoom {
  id: string
  name: string
  participants: string[]
  last_message?: ChatMessage
  created_at: string
}

// Add these types at the end of the file

export interface CartItem {
  id: string
  title: string
  price: number
  image_url: string
  quantity: number
  stock: number
  user_id: string
  variant?: {
    id: string
    title: string
    color?: string
    size?: string
  }
}

export interface WishlistItem {
  id: string
  title: string
  price: number
  image_url: string
  stock: number
  user_id: string
}

