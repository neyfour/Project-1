"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react"
import LazyImage from "../components/LazyImage"
import { useStore } from "../store"

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useStore()
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({})

  const handleRemoveFromWishlist = (id: string) => {
    if (confirm("Are you sure you want to remove this item from your wishlist?")) {
      removeFromWishlist(id)
    }
  }

  const handleAddToCart = (item: any) => {
    // Create a product object from the wishlist item
    const product = {
      id: item.id,
      title: item.title,
      price: item.price,
      image_url: item.image_url,
      stock: item.stock,
      user_id: item.user_id,
    }

    // Add to cart
    addToCart(product, 1)

    // Show feedback
    setAddedToCart((prev) => ({ ...prev, [item.id]: true }))
    setTimeout(() => {
      setAddedToCart((prev) => ({ ...prev, [item.id]: false }))
    }, 2000)

    // Alert user
    alert(`${item.title} added to cart`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          <Heart className="w-6 h-6 text-red-500" />
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Heart className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your wishlist is empty</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center gap-6">
                <LazyImage
                  src={item.image_url || "/placeholder.svg?height=300&width=400"}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=300&width=400"
                    e.currentTarget.onerror = null
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.stock > 0 ? (
                      <span className="text-green-600 dark:text-green-400">In Stock</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Out of Stock</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock <= 0 || addedToCart[item.id]}
                    className={`p-2 rounded-full ${
                      addedToCart[item.id]
                        ? "bg-green-500 text-white"
                        : item.stock > 0
                          ? "text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-600"
                          : "text-gray-400 border border-gray-300 cursor-not-allowed"
                    }`}
                    title={addedToCart[item.id] ? "Added to Cart" : "Add to Cart"}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-2 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 rounded-full"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist

