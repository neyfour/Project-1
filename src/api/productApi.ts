// src/api/productApi.ts
import { api } from "../config/db"
import type { Product } from "../types"

// Mock products data with more categories
const mockProducts: Product[] = [
  // Electronics
  {
    id: "1",
    title: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    price: 249.99,
    category: "Electronics",
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    stock: 45,
    seller_id: "seller1",
    created_at: "2023-01-15T08:30:00Z",
    updated_at: "2023-01-15T08:30:00Z",
    brand: "SoundMaster",
    tags: ["wireless", "headphones", "audio"],
    discount_percent: 10,
    variants: [
      { color: "Black", size: null, price: 249.99, stock: 25 },
      { color: "White", size: null, price: 249.99, stock: 20 },
    ],
  },
  {
    id: "2",
    title: 'Ultra HD Smart TV 55"',
    description: "55-inch 4K Ultra HD Smart TV with HDR and built-in streaming apps.",
    price: 699.99,
    category: "Electronics",
    image_url:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.6,
    stock: 18,
    seller_id: "seller2",
    created_at: "2023-01-20T10:15:00Z",
    updated_at: "2023-01-20T10:15:00Z",
    brand: "VisionTech",
    tags: ["tv", "smart tv", "4k", "ultra hd"],
    discount_percent: 15,
    variants: [
      { color: "Black", size: '55"', price: 699.99, stock: 10 },
      { color: "Black", size: '65"', price: 999.99, stock: 8 },
    ],
  },
  {
    id: "3",
    title: "Professional DSLR Camera",
    description: "High-end DSLR camera with 24.2MP sensor, 4K video recording, and interchangeable lenses.",
    price: 1299.99,
    category: "Electronics",
    image_url:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.9,
    stock: 12,
    seller_id: "seller1",
    created_at: "2023-02-05T14:20:00Z",
    updated_at: "2023-02-05T14:20:00Z",
    brand: "PhotoPro",
    tags: ["camera", "dslr", "photography", "4k"],
    discount_percent: 0,
    variants: [{ color: "Black", size: null, price: 1299.99, stock: 12 }],
  },

  // Clothing
  {
    id: "4",
    title: "Men's Casual Denim Jacket",
    description: "Classic denim jacket for men, perfect for casual everyday wear.",
    price: 79.99,
    category: "Clothing",
    image_url:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.5,
    stock: 35,
    seller_id: "seller3",
    created_at: "2023-02-10T09:45:00Z",
    updated_at: "2023-02-10T09:45:00Z",
    brand: "UrbanStyle",
    tags: ["men", "jacket", "denim", "casual"],
    discount_percent: 0,
    variants: [
      { color: "Blue", size: "S", price: 79.99, stock: 8 },
      { color: "Blue", size: "M", price: 79.99, stock: 12 },
      { color: "Blue", size: "L", price: 79.99, stock: 10 },
      { color: "Blue", size: "XL", price: 79.99, stock: 5 },
    ],
  },
  {
    id: "5",
    title: "Women's Summer Floral Dress",
    description: "Lightweight floral dress perfect for summer, made with breathable fabric.",
    price: 59.99,
    category: "Clothing",
    image_url:
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.7,
    stock: 28,
    seller_id: "seller3",
    created_at: "2023-02-15T11:30:00Z",
    updated_at: "2023-02-15T11:30:00Z",
    brand: "ElegantWear",
    tags: ["women", "dress", "summer", "floral"],
    discount_percent: 20,
    variants: [
      { color: "Blue Floral", size: "XS", price: 59.99, stock: 5 },
      { color: "Blue Floral", size: "S", price: 59.99, stock: 8 },
      { color: "Blue Floral", size: "M", price: 59.99, stock: 10 },
      { color: "Pink Floral", size: "S", price: 59.99, stock: 5 },
    ],
  },

  // Home & Kitchen
  {
    id: "6",
    title: "Professional Chef's Knife Set",
    description: "Premium 8-piece chef's knife set with high-carbon stainless steel blades.",
    price: 129.99,
    category: "Home & Kitchen",
    image_url:
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    stock: 20,
    seller_id: "seller4",
    created_at: "2023-02-20T13:15:00Z",
    updated_at: "2023-02-20T13:15:00Z",
    brand: "CulinaryPro",
    tags: ["kitchen", "knives", "cooking", "chef"],
    discount_percent: 0,
    variants: [{ color: "Silver", size: null, price: 129.99, stock: 20 }],
  },
  {
    id: "7",
    title: "Modern Coffee Table",
    description: "Stylish mid-century modern coffee table with solid wood legs and tempered glass top.",
    price: 249.99,
    category: "Home & Kitchen",
    image_url:
      "https://images.unsplash.com/photo-1567016526105-22da7c13161a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.6,
    stock: 8,
    seller_id: "seller5",
    created_at: "2023-02-25T15:40:00Z",
    updated_at: "2023-02-25T15:40:00Z",
    brand: "ModernLiving",
    tags: ["furniture", "coffee table", "living room", "modern"],
    discount_percent: 10,
    variants: [
      { color: "Walnut/Glass", size: null, price: 249.99, stock: 5 },
      { color: "Oak/Glass", size: null, price: 249.99, stock: 3 },
    ],
  },

  // Sports & Outdoors
  {
    id: "8",
    title: "Lightweight Hiking Backpack",
    description: "Durable 40L hiking backpack with multiple compartments and hydration system compatibility.",
    price: 89.99,
    category: "Sports & Outdoors",
    image_url:
      "https://images.unsplash.com/photo-1622260614153-03223fb72052?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.7,
    stock: 25,
    seller_id: "seller6",
    created_at: "2023-03-01T08:20:00Z",
    updated_at: "2023-03-01T08:20:00Z",
    brand: "TrailMaster",
    tags: ["hiking", "backpack", "outdoors", "camping"],
    discount_percent: 15,
    variants: [
      { color: "Green", size: null, price: 89.99, stock: 10 },
      { color: "Black", size: null, price: 89.99, stock: 15 },
    ],
  },
  {
    id: "9",
    title: "Professional Tennis Racket",
    description: "Tournament-grade tennis racket with carbon fiber frame for optimal performance.",
    price: 159.99,
    category: "Sports & Outdoors",
    image_url:
      "https://images.unsplash.com/photo-1617083934551-ac1f1d1aacc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    stock: 15,
    seller_id: "seller6",
    created_at: "2023-03-05T10:45:00Z",
    updated_at: "2023-03-05T10:45:00Z",
    brand: "AceSports",
    tags: ["tennis", "racket", "sports", "professional"],
    discount_percent: 0,
    variants: [{ color: "Blue/Black", size: null, price: 159.99, stock: 15 }],
  },

  // Books
  {
    id: "10",
    title: "The Art of Strategy",
    description: "Bestselling book on business strategy and competitive advantage in modern markets.",
    price: 24.99,
    category: "Books",
    image_url:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.9,
    stock: 40,
    seller_id: "seller7",
    created_at: "2023-03-10T12:30:00Z",
    updated_at: "2023-03-10T12:30:00Z",
    brand: "Business Press",
    tags: ["book", "business", "strategy", "bestseller"],
    discount_percent: 0,
    variants: [
      { color: null, size: "Hardcover", price: 24.99, stock: 20 },
      { color: null, size: "Paperback", price: 18.99, stock: 20 },
    ],
  },
  {
    id: "11",
    title: "The Quantum Universe",
    description: "Fascinating exploration of quantum physics for the general reader.",
    price: 19.99,
    category: "Books",
    image_url:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.7,
    stock: 30,
    seller_id: "seller7",
    created_at: "2023-03-15T14:15:00Z",
    updated_at: "2023-03-15T14:15:00Z",
    brand: "Science Publications",
    tags: ["book", "science", "physics", "quantum"],
    discount_percent: 10,
    variants: [{ color: null, size: "Paperback", price: 19.99, stock: 30 }],
  },

  // Beauty & Personal Care
  {
    id: "12",
    title: "Luxury Skincare Set",
    description:
      "Complete skincare routine with cleanser, toner, serum, and moisturizer made with natural ingredients.",
    price: 89.99,
    category: "Beauty & Personal Care",
    image_url:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.8,
    stock: 22,
    seller_id: "seller8",
    created_at: "2023-03-20T09:10:00Z",
    updated_at: "2023-03-20T09:10:00Z",
    brand: "NaturalGlow",
    tags: ["skincare", "beauty", "natural", "organic"],
    discount_percent: 0,
    variants: [{ color: null, size: null, price: 89.99, stock: 22 }],
  },
  {
    id: "13",
    title: "Professional Hair Styling Kit",
    description: "Complete hair styling kit with dryer, straightener, curler, and accessories.",
    price: 149.99,
    category: "Beauty & Personal Care",
    image_url:
      "https://images.unsplash.com/photo-1522338140262-f46f5913618a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    rating: 4.6,
    stock: 18,
    seller_id: "seller8",
    created_at: "2023-03-25T11:25:00Z",
    updated_at: "2023-03-25T11:25:00Z",
    brand: "StylePro",
    tags: ["hair", "styling", "beauty", "professional"],
    discount_percent: 15,
    variants: [
      { color: "Black", size: null, price: 149.99, stock: 10 },
      { color: "Pink", size: null, price: 149.99, stock: 8 },
    ],
  },
]

// Get all products
export const getProducts = async (
  token?: string,
  filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    search?: string
    brand?: string
    inStock?: boolean
    rating?: number
    color?: string
    size?: string
  },
): Promise<Product[]> => {
  try {
    // Try to fetch from API first
    if (token) {
      const response = await fetch(`${api.url}/products`, {
        headers: api.getHeaders(token),
      })

      if (response.ok) {
        return await response.json()
      }
    }
  } catch (error) {
    console.log("Error fetching products from API, using mock data:", error)
  }

  // Filter mock products based on provided filters
  let filteredProducts = [...mockProducts]

  if (filters) {
    if (filters.category) {
      filteredProducts = filteredProducts.filter((product) => product.category === filters.category)
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter((product) => product.price >= filters.minPrice!)
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter((product) => product.price <= filters.maxPrice!)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower) ||
          (product.brand && product.brand.toLowerCase().includes(searchLower)),
      )
    }

    if (filters.brand) {
      filteredProducts = filteredProducts.filter((product) => product.brand === filters.brand)
    }

    if (filters.inStock) {
      filteredProducts = filteredProducts.filter((product) => product.stock > 0)
    }

    if (filters.rating) {
      filteredProducts = filteredProducts.filter((product) => product.rating >= filters.rating!)
    }

    if (filters.color) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants?.some((variant) => variant.color === filters.color),
      )
    }

    if (filters.size) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants?.some((variant) => variant.size === filters.size),
      )
    }
  }

  return filteredProducts
}

// Get product by ID
export const getProductById = async (id: string, token?: string): Promise<Product | null> => {
  try {
    // Try to fetch from API first
    if (token) {
      const response = await fetch(`${api.url}/products/${id}`, {
        headers: api.getHeaders(token),
      })

      if (response.ok) {
        return await response.json()
      }
    }
  } catch (error) {
    console.log("Error fetching product from API, using mock data:", error)
  }

  // Return mock product if found
  const product = mockProducts.find((p) => p.id === id)
  return product || null
}

// Get product categories
export const getProductCategories = async (token?: string): Promise<string[]> => {
  try {
    // Try to fetch from API first
    if (token) {
      const response = await fetch(`${api.url}/products/categories`, {
        headers: api.getHeaders(token),
      })

      if (response.ok) {
        return await response.json()
      }
    }
  } catch (error) {
    console.log("Error fetching categories from API, using mock data:", error)
  }

  // Extract unique categories from mock products
  const categories = [...new Set(mockProducts.map((product) => product.category))]
  return categories
}

export const incrementProductViews = async (id: string): Promise<void> => {
  try {
    // In a real implementation, this would call an API endpoint
    // For now, just log it
    console.log(`Incrementing views for product ${id}`)
  } catch (error) {
    console.error(`Error incrementing views for product ${id}:`, error)
    throw error
  }
}

export const incrementProductClicks = async (id: string): Promise<void> => {
  try {
    // In a real implementation, this would call an API endpoint
    // For now, just log it
    console.log(`Incrementing clicks for product ${id}`)
  } catch (error) {
    console.error(`Error incrementing clicks for product ${id}:`, error)
    throw error
  }
}

export const searchProducts = async (query: string, token?: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${api.url}/search?query=${encodeURIComponent(query)}&type=products`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error searching products")
    }

    const data = await response.json()
    return data.results
  } catch (error) {
    console.error(`Error searching products with query ${query}:`, error)
    // Return filtered mock data if API fails
    const mockProducts = getMockProducts()
    return mockProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()),
    )
  }
}

// Mock products data for fallback
export const getMockProducts = (category?: string): Product[] => {
  const allProducts = [
    // Soccer Products
    {
      id: "soccer-1",
      user_id: "seller1",
      title: "Professional Soccer Ball - World Cup Edition",
      description:
        "Official match ball used in international tournaments with premium materials for optimal performance and durability.",
      price: 59.99,
      image_url:
        "https://images.unsplash.com/photo-1614632537423-5e1c478e56c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1579338559194-a162d19bf842?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1544919982-4513019562d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1617083934551-ac1f1d1aacc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1599407384144-1a4e9ffc6c8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1557687647-6978a4f08b0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1565677913671-ce5a5c0ae655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1591491634026-77cd4ba18827?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1535743686920-55e4145369b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1501554728187-ce583db33af7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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
      image_url:
        "https://images.unsplash.com/photo-1473181488821-2d23949a045a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
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

  // If a category is specified, filter products by that category
  if (category && category !== "all") {
    return allProducts.filter((product) => product.category.toLowerCase() === category.toLowerCase())
  }

  // Otherwise return all products
  return allProducts
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

