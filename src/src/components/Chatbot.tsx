"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Matrix Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I'd be happy to help you with that!",
        "Let me check that for you.",
        "Great question! Our sports equipment is designed for professional athletes and enthusiasts alike.",
        "You can find that in our shop section under the categories tab.",
        "We offer free shipping on orders over $100.",
        "Our return policy allows returns within 30 days of purchase.",
        "Is there anything else I can help you with?",
      ]

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50"
        aria-label="Chat with us"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-xl z-50 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          {/* Chat Header */}
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-medium">Matrix Assistant</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.sender === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    <span className="text-xs opacity-75">{message.sender === "bot" ? "Matrix Assistant" : "You"}</span>
                  </div>
                  <p>{message.text}</p>
                  <span className="text-xs opacity-75 block text-right mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded-r-lg hover:bg-indigo-700 transition-colors"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

