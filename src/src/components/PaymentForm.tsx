"use client"

import type React from "react"
import { useState } from "react"
import { CreditCard, Calendar, Lock, Check, ShieldCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { createOrder } from "../api/orderApi"
import { useStore } from "../store"

interface PaymentFormProps {
  totalAmount: number
  items: Array<{
    product_id: string
    quantity: number
    price: number
    product_title: string
    product_image: string
  }>
  shippingAddress?: {
    full_name: string
    street: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
}

export default function PaymentForm({ totalAmount, items, shippingAddress }: PaymentFormProps) {
  const navigate = useNavigate()
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSameAddress, setIsSameAddress] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const user = useStore((state) => state.user)

  // Add these functions at the top of the component
  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")

    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19)
  }

  const formatCardExpiry = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "")

    // Format as MM/YY
    if (digits.length >= 3) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`
    } else if (digits.length === 2) {
      return `${digits}/`
    }

    return digits
  }

  const [cardNumberError, setCardNumberError] = useState("")
  const [cardNameError, setCardNameError] = useState("")
  const [cardExpiryError, setCardExpiryError] = useState("")
  const [cardCvcError, setCardCvcError] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  // Update the handleCardNumberChange function
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)

    // Validate card number
    const isValid = /^(\d{4}\s?){3}\d{4}$/.test(formatted.replace(/\s/g, ""))
    setCardNumberError(!isValid && formatted.length > 0 ? "Invalid card number" : "")
  }

  // Update the handleCardExpiryChange function
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardExpiry(e.target.value)
    setCardExpiry(formatted)

    // Validate expiry date
    if (formatted.length > 0) {
      const [month, year] = formatted.split("/")
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1

      const monthNum = Number.parseInt(month || "0")
      const yearNum = Number.parseInt(year || "0")

      if (monthNum < 1 || monthNum > 12) {
        setCardExpiryError("Invalid month")
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        setCardExpiryError("Card expired")
      } else {
        setCardExpiryError("")
      }
    } else {
      setCardExpiryError("")
    }
  }

  // Update the handleCardCvcChange function
  const handleCardCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 4 characters
    const value = e.target.value.replace(/\D/g, "").substring(0, 4)
    setCardCvc(value)

    // Validate CVC
    setCardCvcError(value.length < 3 && value.length > 0 ? "CVC must be 3-4 digits" : "")
  }

  // Update the handleCardNameChange function
  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardName(e.target.value)

    // Validate name
    setCardNameError(e.target.value.length < 3 && e.target.value.length > 0 ? "Name is too short" : "")
  }

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case "cardNumber":
        if (value.replace(/\s/g, "").length < 16) {
          newErrors.cardNumber = "Please enter a valid 16-digit card number"
        } else {
          delete newErrors.cardNumber
        }
        break
      case "cardName":
        if (!value.trim()) {
          newErrors.cardName = "Cardholder name is required"
        } else {
          delete newErrors.cardName
        }
        break
      case "expiryDate":
        if (value.length < 5) {
          newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)"
        } else {
          const [month, year] = value.split("/")
          const currentYear = new Date().getFullYear() % 100
          const currentMonth = new Date().getMonth() + 1

          if (Number.parseInt(month) < 1 || Number.parseInt(month) > 12) {
            newErrors.expiryDate = "Month must be between 01 and 12"
          } else if (
            Number.parseInt(year) < currentYear ||
            (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth)
          ) {
            newErrors.expiryDate = "Card has expired"
          } else {
            delete newErrors.expiryDate
          }
        }
        break
      case "cvv":
        if (value.length < 3) {
          newErrors.cvv = "CVV must be 3 or 4 digits"
        } else {
          delete newErrors.cvv
        }
        break
    }

    setErrors(newErrors)
  }

  // Add a validateForm function
  const validateForm = () => {
    let isValid = true

    // Validate card number
    if (!cardNumber || !/^(\d{4}\s?){3}\d{4}$/.test(cardNumber.replace(/\s/g, ""))) {
      setCardNumberError("Valid card number is required")
      isValid = false
    }

    // Validate expiry date
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setCardExpiryError("Valid expiry date is required")
      isValid = false
    } else {
      const [month, year] = cardExpiry.split("/")
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1

      const monthNum = Number.parseInt(month)
      const yearNum = Number.parseInt(year)

      if (monthNum < 1 || monthNum > 12) {
        setCardExpiryError("Invalid month")
        isValid = false
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        setCardExpiryError("Card expired")
        isValid = false
      }
    }

    // Validate CVC
    if (!cardCvc || cardCvc.length < 3) {
      setCardCvcError("Valid CVC is required")
      isValid = false
    }

    // Validate name
    if (!cardName || cardName.length < 3) {
      setCardNameError("Cardholder name is required")
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm()) {
      toast.error("Please correct the errors in the form")
      return
    }

    if (!user) {
      toast.error("Please log in to complete your purchase")
      navigate("/auth")
      return
    }

    if (!shippingAddress) {
      toast.error("Please provide a shipping address")
      return
    }

    setIsProcessing(true)

    try {
      // Create a new order
      const order = await createOrder({
        user_id: user.id,
        items,
        total: totalAmount,
        shipping_address: shippingAddress,
        billing_address: isSameAddress ? shippingAddress : shippingAddress, // In a real app, you'd collect billing address if different
        payment_status: "paid",
      })

      // Clear cart
      localStorage.removeItem("cart")

      // Show success message
      toast.success("Payment successful! Your order has been placed.")

      // Redirect to order confirmation
      navigate(`/order-confirmation/${order.id}`)
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("There was an error processing your payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Information</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
            <div className="relative">
              <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className={`pl-10 w-full rounded-lg border ${
                  cardNumberError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                } focus:border-transparent dark:bg-gray-700 dark:text-white py-3`}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            {cardNumberError && <p className="mt-1 text-sm text-red-500">{cardNumberError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cardholder Name</label>
            <input
              type="text"
              value={cardName}
              onChange={handleCardNameChange}
              className={`w-full rounded-lg border ${
                cardNameError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
              } focus:border-transparent dark:bg-gray-700 dark:text-white py-3 px-4`}
              placeholder="John Doe"
              required
            />
            {cardNameError && <p className="mt-1 text-sm text-red-500">{cardNameError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleCardExpiryChange}
                  className={`pl-10 w-full rounded-lg border ${
                    cardExpiryError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  } focus:border-transparent dark:bg-gray-700 dark:text-white py-3`}
                  placeholder="MM/YY"
                  required
                />
              </div>
              {cardExpiryError && <p className="mt-1 text-sm text-red-500">{cardExpiryError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security Code (CVV)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={cardCvc}
                  onChange={handleCardCvcChange}
                  className={`pl-10 w-full rounded-lg border ${
                    cardCvcError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  } focus:border-transparent dark:bg-gray-700 dark:text-white py-3`}
                  placeholder="123"
                  required
                />
              </div>
              {cardCvcError && <p className="mt-1 text-sm text-red-500">{cardCvcError}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="same-address"
              type="checkbox"
              checked={isSameAddress}
              onChange={() => setIsSameAddress(!isSameAddress)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="same-address" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Billing address is the same as shipping address
            </label>
          </div>

          <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
            <p className="text-sm text-indigo-700 dark:text-indigo-300">
              Your payment information is secure. We use encryption to protect your data.
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">${(totalAmount * 0.9).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="text-gray-900 dark:text-white">${(totalAmount * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Complete Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

