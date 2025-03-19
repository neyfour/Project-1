import { api } from "../config/db"
import type { Product } from "../types"

const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:8000"

// Get all products
export const getProducts = async (filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  brand?: string
  inStock?: boolean
  rating?: number
  color?: string
  size?: string
}): Promise<Product[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams()

    if (filters) {
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.minPrice !== undefined) queryParams.append("min_price", filters.minPrice.toString())
      if (filters.maxPrice !== undefined) queryParams.append("max_price", filters.maxPrice.toString())
      if (filters.search) queryParams.append("search", filters.search)
      if (filters.brand) queryParams.append("brand", filters.brand)
      if (filters.inStock) queryParams.append("in_stock", "true")
      if (filters.rating) queryParams.append("min_rating", filters.rating.toString())
      if (filters.color) queryParams.append("color", filters.color)
      if (filters.size) queryParams.append("size", filters.size)
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    // Fetch products from API
    const response = await fetch(`${api.url}/products${queryString}`, {
      headers: {},
    })

    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching products:", error)
    // Return mock data if API fails
    return getMockProducts(filters?.category)
  }
}

// Get product by ID
export const getProductById = async (id: string, token?: string): Promise<Product | null> => {
  try {
    const response = await fetch(`${api.url}/products/${id}`, {
      headers: token ? api.getHeaders(token) : {},
    })

    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error)
    return null
  }
}

// Get product categories
export const getProductCategories = async (token?: string): Promise<string[]> => {
  try {
    const response = await fetch(`${api.url}/products/categories`, {
      headers: token ? api.getHeaders(token) : {},
    })

    if (!response.ok) {
      throw new Error(`Error fetching categories: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching categories:", error)
    // Return default categories if API fails
    return ["Electronics", "Clothing", "Home & Kitchen", "Sports & Outdoors", "Books", "Beauty & Personal Care"]
  }
}

export const incrementProductViews = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${api.url}/products/${id}/views`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Error incrementing views: ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error incrementing views for product ${id}:`, error)
  }
}

export const incrementProductClicks = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${api.url}/products/${id}/clicks`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Error incrementing clicks: ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error incrementing clicks for product ${id}:`, error)
  }
}

export const searchProducts = async (query: string, token?: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${api.url}/products?search=${encodeURIComponent(query)}`, {
      headers: token ? api.getHeaders(token) : {},
    })

    if (!response.ok) {
      throw new Error(`Error searching products: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error searching products with query ${query}:`, error)
    throw error
  }
}

// Mock products data for fallback
export const getMockProducts = (category?: string): Product[] => {
  // Make sure all products have valid image URLs
  const ensureValidImageUrl = (url: string) => {
    // If URL is empty or invalid, return a placeholder
    if (!url || url.trim() === "" || !url.startsWith("http")) {
      return `/placeholder.svg?height=300&width=400&text=${encodeURIComponent("Product Image")}`
    }
    return url
  }

  const allProducts = [
    // Soccer Products
    {
      id: "soccer-1",
      user_id: "seller1",
      title: "Professional Soccer Ball - World Cup Edition",
      description:
        "Official match ball used in international tournaments with premium materials for optimal performance and durability.",
      price: 59.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1614632537423-5e1c478e56c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Soccer",
      stock: 35,
      rating: 4.8,
      reviews_count: 152,
      views_count: 1850,
      clicks_count: 1200,
      sales_count: 95,
      sku: "SC-BL-001",
      brand: "GoalMaster",
      created_at: "2023-04-12T00:00:00Z",
    },
    {
      id: "soccer-2",
      user_id: "seller2",
      title: "Soccer Cleats - Precision Strike",
      description: "Professional soccer cleats for optimal ball control and traction on all field types.",
      price: 129.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Soccer",
      stock: 32,
      rating: 4.6,
      reviews_count: 98,
      views_count: 1320,
      clicks_count: 870,
      sales_count: 65,
      sku: "SC-CL-002",
      brand: "StrikeForce",
      created_at: "2024-02-05T00:00:00Z",
    },
    {
      id: "soccer-3",
      user_id: "seller3",
      title: "Soccer Training Goal Set",
      description: "Portable soccer goal set for backyard practice and training sessions.",
      price: 89.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Soccer",
      stock: 18,
      rating: 4.5,
      reviews_count: 76,
      views_count: 980,
      clicks_count: 650,
      sales_count: 42,
      sku: "SC-GL-003",
      brand: "GoalMaster",
      created_at: "2023-08-15T00:00:00Z",
    },

    // Basketball Products
    {
      id: "basketball-1",
      user_id: "seller1",
      title: "Professional Basketball",
      description: "Official size and weight basketball for professional play with superior grip and durability.",
      price: 49.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Basketball",
      stock: 25,
      rating: 4.8,
      reviews_count: 124,
      views_count: 1250,
      clicks_count: 850,
      sales_count: 75,
      sku: "BB-PRO-001",
      brand: "SportsPro",
      created_at: "2023-01-15T00:00:00Z",
    },
    {
      id: "basketball-2",
      user_id: "seller3",
      title: "Basketball Shoes - Court Dominator",
      description: "High-performance basketball shoes with ankle support and cushioning for explosive movements.",
      price: 159.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1579338559194-a162d19bf842?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Basketball",
      stock: 28,
      rating: 4.7,
      reviews_count: 112,
      views_count: 1450,
      clicks_count: 980,
      sales_count: 85,
      sku: "BB-SH-002",
      brand: "JumpMaster",
      created_at: "2024-01-20T00:00:00Z",
    },
    {
      id: "basketball-3",
      user_id: "seller2",
      title: "Basketball Hoop - Pro Slam",
      description: "Professional-grade basketball hoop with breakaway rim and adjustable height.",
      price: 299.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1544919982-4513019562d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Basketball",
      stock: 12,
      rating: 4.9,
      reviews_count: 87,
      views_count: 1050,
      clicks_count: 720,
      sales_count: 35,
      sku: "BB-HP-003",
      brand: "SportsPro",
      created_at: "2023-11-08T00:00:00Z",
    },

    // Running Products
    {
      id: "running-1",
      user_id: "seller2",
      title: "Running Shoes - Marathon Pro",
      description: "Lightweight running shoes designed for marathon runners with superior cushioning and support.",
      price: 129.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Running",
      stock: 42,
      rating: 4.9,
      reviews_count: 208,
      views_count: 2100,
      clicks_count: 1500,
      sales_count: 120,
      sku: "RN-SH-001",
      brand: "SpeedRunner",
      created_at: "2023-02-10T00:00:00Z",
    },
    {
      id: "running-2",
      user_id: "seller1",
      title: "Running Jacket - Weather Shield",
      description: "Waterproof and breathable running jacket for all-weather training.",
      price: 89.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Running",
      stock: 30,
      rating: 4.6,
      reviews_count: 95,
      views_count: 1250,
      clicks_count: 820,
      sales_count: 65,
      sku: "RN-JK-002",
      brand: "SpeedRunner",
      created_at: "2023-09-22T00:00:00Z",
    },
    {
      id: "running-3",
      user_id: "seller3",
      title: "GPS Running Watch - Performance Tracker",
      description: "Advanced GPS running watch with heart rate monitoring and performance metrics.",
      price: 199.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Running",
      stock: 18,
      rating: 4.8,
      reviews_count: 132,
      views_count: 1680,
      clicks_count: 1120,
      sales_count: 75,
      sku: "RN-WT-003",
      brand: "FitTech",
      created_at: "2023-07-14T00:00:00Z",
    },

    // Tennis Products
    {
      id: "tennis-1",
      user_id: "seller1",
      title: "Tennis Racket - Pro Series",
      description: "Professional tennis racket with carbon fiber frame for power and control.",
      price: 189.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1617083934551-ac1f1d1aacc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Tennis",
      stock: 18,
      rating: 4.7,
      reviews_count: 86,
      views_count: 950,
      clicks_count: 620,
      sales_count: 45,
      sku: "TN-RK-001",
      brand: "AceTech",
      created_at: "2023-03-05T00:00:00Z",
    },
    {
      id: "tennis-2",
      user_id: "seller1",
      title: "Tennis Balls - Tournament Pack",
      description: "Pack of 12 premium tennis balls for tournament play with consistent bounce and durability.",
      price: 24.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Tennis",
      stock: 45,
      rating: 4.5,
      reviews_count: 72,
      views_count: 820,
      clicks_count: 540,
      sales_count: 55,
      sku: "TN-BL-002",
      brand: "AceTech",
      created_at: "2024-02-18T00:00:00Z",
    },
    {
      id: "tennis-3",
      user_id: "seller2",
      title: "Tennis Court Shoes - All Surface",
      description: "Specialized tennis shoes designed for all court surfaces with lateral support and durability.",
      price: 119.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Tennis",
      stock: 24,
      rating: 4.6,
      reviews_count: 68,
      views_count: 890,
      clicks_count: 580,
      sales_count: 42,
      sku: "TN-SH-003",
      brand: "AceTech",
      created_at: "2023-10-12T00:00:00Z",
    },

    // Fitness Products
    {
      id: "fitness-1",
      user_id: "seller2",
      title: "Fitness Tracker - Health Pro",
      description: "Advanced fitness tracker with heart rate monitoring, GPS, and sleep tracking.",
      price: 149.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Fitness",
      stock: 15,
      rating: 4.9,
      reviews_count: 210,
      views_count: 2500,
      clicks_count: 1800,
      sales_count: 130,
      sku: "FT-TR-001",
      brand: "FitTech",
      created_at: "2023-08-22T00:00:00Z",
    },
    {
      id: "fitness-2",
      user_id: "seller3",
      title: "Adjustable Dumbbell Set - Home Gym",
      description:
        "Space-saving adjustable dumbbell set for home workouts with multiple weight settings in one compact design.",
      price: 299.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Fitness",
      stock: 10,
      rating: 4.8,
      reviews_count: 145,
      views_count: 1850,
      clicks_count: 1250,
      sales_count: 85,
      sku: "FT-DB-002",
      brand: "PowerFlex",
      created_at: "2023-06-18T00:00:00Z",
    },
    {
      id: "fitness-3",
      user_id: "seller1",
      title: "Resistance Bands Set - Full Body Workout",
      description: "Complete set of resistance bands for strength training and rehabilitation exercises.",
      price: 49.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Fitness",
      stock: 35,
      rating: 4.7,
      reviews_count: 178,
      views_count: 1650,
      clicks_count: 1080,
      sales_count: 95,
      sku: "FT-RB-003",
      brand: "PowerFlex",
      created_at: "2023-12-05T00:00:00Z",
    },

    // Swimming Products
    {
      id: "swimming-1",
      user_id: "seller1",
      title: "Swimming Goggles - Pro Racer",
      description: "Anti-fog racing goggles with UV protection and adjustable straps for competitive swimming.",
      price: 29.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1599407384144-1a4e9ffc6c8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Swimming",
      stock: 60,
      rating: 4.5,
      reviews_count: 78,
      views_count: 620,
      clicks_count: 410,
      sales_count: 55,
      sku: "SW-GG-001",
      brand: "AquaSpeed",
      created_at: "2023-06-08T00:00:00Z",
    },
    {
      id: "swimming-2",
      user_id: "seller2",
      title: "Competition Swimsuit - Hydrodynamic",
      description:
        "Professional racing swimsuit with water-repellent fabric for reduced drag and improved performance.",
      price: 89.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Swimming",
      stock: 28,
      rating: 4.7,
      reviews_count: 92,
      views_count: 780,
      clicks_count: 520,
      sales_count: 48,
      sku: "SW-SS-002",
      brand: "AquaSpeed",
      created_at: "2023-09-14T00:00:00Z",
    },
    {
      id: "swimming-3",
      user_id: "seller3",
      title: "Swim Training Fins - Power Kick",
      description: "Training fins for improving leg strength and kick technique in the water.",
      price: 39.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Swimming",
      stock: 42,
      rating: 4.6,
      reviews_count: 65,
      views_count: 580,
      clicks_count: 380,
      sales_count: 40,
      sku: "SW-FN-003",
      brand: "AquaSpeed",
      created_at: "2024-01-22T00:00:00Z",
    },

    // Cycling Products
    {
      id: "cycling-1",
      user_id: "seller3",
      title: "Cycling Helmet - Aero Elite",
      description: "Aerodynamic cycling helmet with adjustable fit system and ventilation for road racing.",
      price: 89.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1557687647-6978a4f08b0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Cycling",
      stock: 22,
      rating: 4.7,
      reviews_count: 64,
      views_count: 890,
      clicks_count: 580,
      sales_count: 40,
      sku: "CY-HM-001",
      brand: "VeloTech",
      created_at: "2023-07-15T00:00:00Z",
    },
    {
      id: "cycling-2",
      user_id: "seller2",
      title: "Cycling Jersey - Pro Team",
      description: "Aerodynamic cycling jersey with moisture-wicking fabric and rear pockets for essentials.",
      price: 79.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1565677913671-ce5a5c0ae655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Cycling",
      stock: 24,
      rating: 4.6,
      reviews_count: 58,
      views_count: 750,
      clicks_count: 490,
      sales_count: 35,
      sku: "CY-JR-002",
      brand: "VeloTech",
      created_at: "2024-03-10T00:00:00Z",
    },
    {
      id: "cycling-3",
      user_id: "seller1",
      title: "Cycling Shoes - Carbon Pro",
      description: "Lightweight cycling shoes with carbon fiber soles for maximum power transfer and comfort.",
      price: 159.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Cycling",
      stock: 18,
      rating: 4.8,
      reviews_count: 72,
      views_count: 820,
      clicks_count: 540,
      sales_count: 38,
      sku: "CY-SH-003",
      brand: "VeloTech",
      created_at: "2023-11-28T00:00:00Z",
    },

    // Yoga Products
    {
      id: "yoga-1",
      user_id: "seller2",
      title: "Yoga Mat - Premium",
      description: "Extra thick yoga mat with non-slip surface and alignment markings for proper positioning.",
      price: 39.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Yoga",
      stock: 50,
      rating: 4.6,
      reviews_count: 95,
      views_count: 780,
      clicks_count: 520,
      sales_count: 65,
      sku: "YG-MT-001",
      brand: "ZenFlex",
      created_at: "2023-05-20T00:00:00Z",
    },
    {
      id: "yoga-2",
      user_id: "seller3",
      title: "Yoga Block Set - Eco-Friendly",
      description: "Set of 2 eco-friendly cork yoga blocks for improved stability and alignment in poses.",
      price: 29.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Yoga",
      stock: 38,
      rating: 4.8,
      reviews_count: 85,
      views_count: 920,
      clicks_count: 680,
      sales_count: 70,
      sku: "YG-BL-002",
      brand: "ZenFlex",
      created_at: "2024-01-25T00:00:00Z",
    },
    {
      id: "yoga-3",
      user_id: "seller1",
      title: "Yoga Wheel - Back Support",
      description: "Yoga wheel for back support, improved flexibility, and deeper stretches in practice.",
      price: 34.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Yoga",
      stock: 25,
      rating: 4.7,
      reviews_count: 62,
      views_count: 680,
      clicks_count: 450,
      sales_count: 38,
      sku: "YG-WH-003",
      brand: "ZenFlex",
      created_at: "2023-08-30T00:00:00Z",
    },

    // Golf Products
    {
      id: "golf-1",
      user_id: "seller1",
      title: "Golf Clubs Set - Tour Edition",
      description: "Complete set of professional golf clubs with premium bag for serious players.",
      price: 799.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Golf",
      stock: 8,
      rating: 4.8,
      reviews_count: 45,
      views_count: 680,
      clicks_count: 420,
      sales_count: 15,
      sku: "GL-CS-001",
      brand: "ParMaster",
      created_at: "2023-09-10T00:00:00Z",
    },
    {
      id: "golf-2",
      user_id: "seller2",
      title: "Golf Balls - Premium Distance",
      description: "Pack of 12 premium golf balls designed for maximum distance and control on the course.",
      price: 39.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1591491634026-77cd4ba18827?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Golf",
      stock: 45,
      rating: 4.6,
      reviews_count: 78,
      views_count: 720,
      clicks_count: 480,
      sales_count: 52,
      sku: "GL-BL-002",
      brand: "ParMaster",
      created_at: "2023-11-15T00:00:00Z",
    },
    {
      id: "golf-3",
      user_id: "seller3",
      title: "Golf Rangefinder - Precision Pro",
      description:
        "Advanced golf rangefinder with slope calculation and pin-seeking technology for accurate distance measurement.",
      price: 249.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1535743686920-55e4145369b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Golf",
      stock: 12,
      rating: 4.9,
      reviews_count: 56,
      views_count: 650,
      clicks_count: 420,
      sales_count: 28,
      sku: "GL-RF-003",
      brand: "ParMaster",
      created_at: "2024-02-08T00:00:00Z",
    },

    // Hiking Products
    {
      id: "hiking-1",
      user_id: "seller2",
      title: "Hiking Boots - Mountain Explorer",
      description: "Waterproof hiking boots with superior ankle support and grip for challenging terrain.",
      price: 149.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Hiking",
      stock: 25,
      rating: 4.7,
      reviews_count: 92,
      views_count: 920,
      clicks_count: 650,
      sales_count: 50,
      sku: "HK-BT-001",
      brand: "TrailMaster",
      created_at: "2023-11-12T00:00:00Z",
    },
    {
      id: "hiking-2",
      user_id: "seller1",
      title: "Hiking Backpack - Trail Pro 45L",
      description: "Durable 45-liter hiking backpack with hydration system compatibility and multiple compartments.",
      price: 129.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1501554728187-ce583db33af7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Hiking",
      stock: 18,
      rating: 4.8,
      reviews_count: 75,
      views_count: 850,
      clicks_count: 580,
      sales_count: 42,
      sku: "HK-BP-002",
      brand: "TrailMaster",
      created_at: "2023-07-25T00:00:00Z",
    },
    {
      id: "hiking-3",
      user_id: "seller3",
      title: "Trekking Poles - Carbon Fiber",
      description:
        "Lightweight carbon fiber trekking poles with shock absorption and adjustable height for all terrains.",
      price: 89.99,
      image_url: ensureValidImageUrl(
        "https://images.unsplash.com/photo-1473181488821-2d23949a045a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      ),
      category: "Hiking",
      stock: 30,
      rating: 4.6,
      reviews_count: 68,
      views_count: 720,
      clicks_count: 480,
      sales_count: 35,
      sku: "HK-TP-003",
      brand: "TrailMaster",
      created_at: "2024-01-10T00:00:00Z",
    },
  ]

  // Process all products to ensure valid image URLs
  const processedProducts = allProducts.map((product) => ({
    ...product,
    image_url: ensureValidImageUrl(product.image_url),
  }))

  // If a category is specified, filter products by that category
  if (category && category !== "all") {
    return processedProducts.filter((product) => product.category.toLowerCase() === category.toLowerCase())
  }

  // Otherwise return all products
  return processedProducts
}

export const createProduct = async (productData: Partial<Product>, token: string): Promise<Product> => {
  try {
    const response = await fetch(`${api.url}/products`, {
      method: "POST",
      headers: api.getHeaders(token),
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error creating product")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

// Update a product
export const updateProduct = async (id: string, productData: Partial<Product>, token: string): Promise<Product> => {
  try {
    const response = await fetch(`${api.url}/products/${id}`, {
      method: "PUT",
      headers: api.getHeaders(token),
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error updating product with id ${id}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// Delete a product
export const deleteProduct = async (id: string, token: string): Promise<void> => {
  try {
    const response = await fetch(`${api.url}/products/${id}`, {
      method: "DELETE",
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Error deleting product with id ${id}`)
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

