"use client"

import { useState } from "react"
import { Heart, Trash2, ShoppingCart } from "lucide-react"

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: "1",
      name: "Product 1",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    },
    {
      id: "2",
      name: "Product 2",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    },
  ])

  const removeFromWishlist = (id: string) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id))
  }

  const addToCart = (id: string) => {
    // Implement add to cart functionality
    console.log("Added to cart:", id)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <Heart className="w-6 h-6 text-red-500" />
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-500">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => addToCart(item.id)} className="p-2 text-indigo-600 hover:text-indigo-800">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button onClick={() => removeFromWishlist(item.id)} className="p-2 text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist

