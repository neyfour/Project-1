"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CreditCard, Calendar, Lock, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function Payment() {
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState({
    id: "",
    total: 0,
    items: [],
  })

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Get order details from URL params
    const searchParams = new URLSearchParams(location.search)
    const orderId = searchParams.get("orderId")

    if (orderId) {
      // Fetch order details
      fetch(`/api/orders/${orderId}`, {
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          }
          throw new Error("Failed to fetch order details")
        })
        .then((data) => {
          setOrderDetails(data)
        })
        .catch((error) => {
          console.error("Error fetching order details:", error)
          toast.error("Failed to load order details")
        })
    } else {
      // Redirect to cart if no order ID
      navigate("/cart")
    }
  }, [location, navigate])

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")

    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19)
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }

    return digits
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value))
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (cardNumber.length < 19) {
      toast.error("Please enter a valid card number")
      return
    }

    if (expiryDate.length < 5) {
      toast.error("Please enter a valid expiry date")
      return
    }

    if (cvv.length < 3) {
      toast.error("Please enter a valid CVV")
      return
    }

    if (!cardName) {
      toast.error("Please enter the cardholder name")
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update order payment status
      const response = await fetch(`/api/orders/${orderDetails.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_status: "paid",
        }),
        credentials: "include",
      })

      if (response.ok) {
        setPaymentSuccess(true)
        toast.success("Payment successful!")

        // Redirect to order confirmation after 3 seconds
        setTimeout(() => {
          navigate(`/order-confirmation?orderId=${orderDetails.id}`)
        }, 3000)
      } else {
        throw new Error("Failed to update payment status")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {paymentSuccess ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your payment has been processed successfully. You will be redirected to the order confirmation page
              shortly.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting...</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">Complete Your Payment</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Payment Details</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          id="cardNumber"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white py-3"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="cardName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white py-3 px-4"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="expiryDate"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Expiry Date
                        </label>
                        <div className="relative">
                          <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            id="expiryDate"
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white py-3"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="cvv"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          CVV
                        </label>
                        <div className="relative">
                          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            id="cvv"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="123"
                            maxLength={4}
                            className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white py-3"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>Pay ${orderDetails.total.toFixed(2)}</>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                      <Lock className="w-4 h-4 mr-2" />
                      Your payment information is secure and encrypted
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    {orderDetails.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.product_title} {item.quantity > 1 && `(${item.quantity})`}
                          </p>
                          {item.variant_title && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.variant_title}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">${orderDetails.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="text-gray-900 dark:text-white">Included</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-indigo-600 dark:text-indigo-400">${orderDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

