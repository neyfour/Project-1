"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Minus, Plus, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react"
import LazyImage from "../components/LazyImage"
import { useStore } from "../store"

const Cart = () => {
  const { cart, updateCartItemQuantity, removeFromCart, clearCart, getCartTotal } = useStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const subtotal = getCartTotal()
  const shipping = 10
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleQuantityChange = (id: string, change: number, currentQty: number) => {
    const newQty = Math.max(1, currentQty + change)
    updateCartItemQuantity(id, newQty)
  }

  const handleRemoveItem = (id: string) => {
    if (confirm("Are you sure you want to remove this item from your cart?")) {
      removeFromCart(id)
    }
  }

  const handleCheckout = () => {
    // Create a cart object with items and total
    const checkoutData = {
      items: cart,
      subtotal,
      shipping,
      tax,
      total,
    }

    // Save to localStorage for the payment page to access
    localStorage.setItem("cart", JSON.stringify(checkoutData))

    // Navigate to payment page
    setIsLoading(true)
    setTimeout(() => {
      navigate("/payment")
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
          <ShoppingBag className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your cart is empty</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center gap-6"
                >
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
                    {item.variant && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.variant.color && <span className="mr-2">Color: {item.variant.color}</span>}
                        {item.variant.size && <span>Size: {item.variant.size}</span>}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-600 dark:text-gray-300">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Remove item"
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
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your cart?")) {
                      clearCart()
                    }
                  }}
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full mt-6 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : null}
                  {isLoading ? "Processing..." : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

