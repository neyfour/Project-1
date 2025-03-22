"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, Camera, Package, Tag, Palette, Settings, ChevronRight, Plus, X } from "lucide-react"
import "../styles/AddProduct.css"

interface ProductForm {
  title: string
  description: string
  category: string
  price: string
  stock: string
  images: string[]
  brand: string
  sport_type: string
  specifications: { [key: string]: string }
  variants: ProductVariant[]
}

interface ProductVariant {
  title: string
  price: string
  stock: string
  attributes: { [key: string]: string }
}

export default function AddProduct() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ProductForm>({
    title: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    images: [],
    brand: "",
    sport_type: "",
    specifications: {},
    variants: [],
  })

  const steps = [
    { number: 1, title: "Basic Information", icon: Package },
    { number: 2, title: "Images & Media", icon: Camera },
    { number: 3, title: "Pricing & Inventory", icon: Tag },
    { number: 4, title: "Variants", icon: Palette },
    { number: 5, title: "Specifications", icon: Settings },
  ]

  const categories = ["Soccer", "Basketball", "Running", "Tennis", "Fitness", "Swimming", "Cycling", "Yoga"]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result as string],
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    navigate("/matrix/products")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter product title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="drag-drop-zone cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600">Drag and drop your images here, or click to select files</p>
            </div>
            {imagePreview && (
              <div className="relative w-32 h-32">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
              <button
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    variants: [...prev.variants, { title: "", price: "", stock: "", attributes: {} }],
                  }))
                }}
                className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="variant-card p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={variant.title}
                      onChange={(e) => {
                        const newVariants = [...formData.variants]
                        newVariants[index].title = e.target.value
                        setFormData({ ...formData, variants: newVariants })
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Variant name"
                    />
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => {
                        const newVariants = [...formData.variants]
                        newVariants[index].price = e.target.value
                        setFormData({ ...formData, variants: newVariants })
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => {
                        const newVariants = [...formData.variants]
                        newVariants[index].stock = e.target.value
                        setFormData({ ...formData, variants: newVariants })
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Stock"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
              <button
                onClick={() => {
                  const key = prompt("Enter specification key")
                  const value = prompt("Enter specification value")
                  if (key && value) {
                    setFormData((prev) => ({
                      ...prev,
                      specifications: {
                        ...prev.specifications,
                        [key]: value,
                      },
                    }))
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Specification
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{key}</p>
                    <p className="text-gray-600">{value}</p>
                  </div>
                  <button
                    onClick={() => {
                      const newSpecs = { ...formData.specifications }
                      delete newSpecs[key]
                      setFormData({ ...formData, specifications: newSpecs })
                    }}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="form-container">
        <div className="form-progress">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.number} className={`progress-step ${currentStep === step.number ? "active" : ""}`}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step.number ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="form-section">{renderStepContent()}</div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              className={`px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ${
                currentStep === 1 ? "invisible" : ""
              }`}
            >
              Previous
            </button>
            <button
              type={currentStep === steps.length ? "submit" : "button"}
              onClick={() => {
                if (currentStep < steps.length) {
                  setCurrentStep((prev) => prev + 1)
                }
              }}
              className="flex items-center gap-2 px-6 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {currentStep === steps.length ? "Submit" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

