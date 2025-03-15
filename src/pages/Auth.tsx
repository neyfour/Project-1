"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Store, Mail, Lock, ArrowRight } from "lucide-react"
import { useStore } from "../store"

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const setUser = useStore((state) => state.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      setUser({
        id: "1",
        email: email,
        full_name: "Test User",
      })
      navigate("/matrix")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Store className="w-12 h-12 text-indigo-600 mx-auto" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin
                ? "Sign in to manage your products and view insights"
                : "Join our community of successful sellers"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-end">
                <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span>{isLogin ? "Sign in" : "Create account"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "New to Matrix Commerce?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-4 w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? "Create an account" : "Sign in to your account"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-purple-600/90 mix-blend-multiply" />
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=2000"
          alt="Authentication background"
        />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="max-w-md text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Transform Your Business with AI-Powered Insights</h2>
            <p className="text-lg text-gray-100">
              Join thousands of successful sellers who use our platform to grow their business and reach customers
              worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

