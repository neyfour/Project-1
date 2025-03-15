// Update the Shop page to display products from categories
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { Filter, Search, SlidersHorizontal, Star, X } from "lucide-react"
import { getProducts, getProductCategories } from "../api/productApi"
import { useStore } from "../store"
import LazyImage from "../components/LazyImage"
import type { Product } from "../types"

export default function Shop() {
  const location = useLocation()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const token = useStore((state) => state.token)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedBrand, setSelectedBrand] = useState<string>("")
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 })
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [minRating, setMinRating] = useState<number>(0)
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")

  // Get unique colors and sizes from products
  const colors = [...new Set(products.flatMap((p) => p.variants?.map((v) => v.color).filter(Boolean) || []))].filter(
    Boolean,
  ) as string[]
  const sizes = [...new Set(products.flatMap((p) => p.variants?.map((v) => v.size).filter(Boolean) || []))].filter(
    Boolean,
  ) as string[]

  useEffect(() => {
    // Parse search params from URL
    const params = new URLSearchParams(location.search)
    const searchFromUrl = params.get("search")
    const categoryFromUrl = params.get("category")

    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }

    fetchCategories()
    fetchProducts()
  }, [location.search])

  const fetchCategories = async () => {
    try {
      const categoriesData = await getProductCategories(token)
      setCategories(categoriesData)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load categories")
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(location.search)
      const searchFromUrl = params.get("search")
      const categoryFromUrl = params.get("category")

      const productsData = await getProducts(token, {
        search: searchFromUrl || undefined,
        category: categoryFromUrl || undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        brand: selectedBrand || undefined,
        inStock: inStockOnly,
        rating: minRating > 0 ? minRating : undefined,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      })

      setProducts(productsData)

      // Extract unique brands
      const uniqueBrands = [...new Set(productsData.map((p) => p.brand).filter(Boolean))]
      setBrands(uniqueBrands as string[])
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const applyFilters = () => {
    fetchProducts()
    if (window.innerWidth < 768) {
      setFiltersOpen(false)
    }
  }

  const resetFilters = () => {
    setSelectedCategory("")
    setSelectedBrand("")
    setPriceRange({ min: 0, max: 1000 })
    setMinRating(0)
    setInStockOnly(false)
    setSelectedColor("")
    setSelectedSize("")

    // Keep the search query as it might be from the URL
    setTimeout(() => {
      fetchProducts()
    }, 0)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg mb-4"
        >
          <SlidersHorizontal size={18} />
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters Sidebar */}
        <div
          className={`w-full md:w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 transition-all duration-300 ${
            filtersOpen ? "block" : "hidden md:block"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Filter size={18} />
              Filters
            </h2>
            <button onClick={resetFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Reset All
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white"
              />
            </form>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category}</span>
                </label>
              ))}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                >
                  <X size={12} className="mr-1" />
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number.parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Min"
              />
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <input
                type="number"
                min="0"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number.parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Brands</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center">
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === brand}
                      onChange={() => setSelectedBrand(brand)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{brand}</span>
                  </label>
                ))}
                {selectedBrand && (
                  <button
                    onClick={() => setSelectedBrand("")}
                    className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                  >
                    <X size={12} className="mr-1" />
                    Clear selection
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Rating</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(rating)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-1">& Up</span>
                  </span>
                </label>
              ))}
              {minRating > 0 && (
                <button
                  onClick={() => setMinRating(0)}
                  className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                >
                  <X size={12} className="mr-1" />
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      selectedColor === color
                        ? "bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300"
                        : "bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      selectedSize === size
                        ? "bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300"
                        : "bg-white border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* In Stock Only */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
            </label>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={applyFilters}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>

        {/* Products Grid */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No products found</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory || "All Products"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{products.length} products</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <LazyImage
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      {product.discount_percent > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {product.discount_percent}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {product.title}
                        </h3>
                        <div className="flex items-center">
                          <Star size={16} className="fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">{product.rating}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          {product.discount_percent > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ${(product.price * (1 - product.discount_percent / 100)).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

