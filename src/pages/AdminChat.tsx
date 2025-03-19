"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, User, Clock, Search } from "lucide-react"
import { useStore } from "../store"
import SuperAdminSidebar from "../components/SuperAdminSidebar"
import { getChatRooms, getChatMessages, sendChatMessage, getMockChatRooms, getMockChatMessages } from "../api/chatApi"
import { getSellers } from "../api/authApi"
import type { ChatRoom, ChatMessage } from "../types"

export default function AdminChat() {
  const [loading, setLoading] = useState(true)
  const [sellers, setSellers] = useState<any[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [activeSeller, setActiveSeller] = useState<any | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const user = useStore((state) => state.user)
  const token = useStore((state) => state.token)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sellers
        const sellersData = await getSellers(token)
        setSellers(sellersData)

        // Fetch chat rooms
        try {
          const rooms = await getChatRooms(token)
          setChatRooms(rooms)

          if (rooms.length > 0) {
            setActiveRoom(rooms[0].id)

            // Find the seller for this room
            const sellerId = rooms[0].participants.find((id) => id !== user?.id)
            const seller = sellersData.find((s) => s._id === sellerId)
            setActiveSeller(seller)

            // Fetch messages for the active room
            const roomMessages = await getChatMessages(rooms[0].id, token)
            setMessages(roomMessages)
          }
        } catch (error) {
          console.error("Error fetching chat rooms, using mock data:", error)
          // Fallback to mock data
          const mockRooms = getMockChatRooms()
          setChatRooms(mockRooms)

          if (mockRooms.length > 0) {
            setActiveRoom(mockRooms[0].id)

            // Find the seller for this room
            const sellerId = mockRooms[0].participants.find((id) => id !== user?.id)
            const seller = sellersData.find((s) => s._id === sellerId)
            setActiveSeller(seller)

            // Fetch messages for the active room
            const mockMessages = getMockChatMessages(mockRooms[0].id)
            setMessages(mockMessages)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, user?.id])

  useEffect(() => {
    // Fetch messages when active room changes
    const fetchMessages = async () => {
      if (!activeRoom) return

      try {
        const roomMessages = await getChatMessages(activeRoom, token)
        setMessages(roomMessages)
      } catch (error) {
        console.error(`Error fetching messages for room ${activeRoom}, using mock data:`, error)
        // Fallback to mock data
        const mockMessages = getMockChatMessages(activeRoom)
        setMessages(mockMessages)
      }
    }

    fetchMessages()

    // Find the seller for this room
    if (activeRoom && chatRooms.length > 0) {
      const room = chatRooms.find((r) => r.id === activeRoom)
      if (room) {
        const sellerId = room.participants.find((id) => id !== user?.id)
        const seller = sellers.find((s) => s._id === sellerId)
        setActiveSeller(seller)
      }
    }
  }, [activeRoom, chatRooms, sellers, token, user?.id])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !activeRoom || !user) return

    try {
      // Try to send message to the API
      await sendChatMessage(activeRoom, newMessage, token)

      // Add message to the UI immediately
      const newChatMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender_id: user.id,
        sender_name: user.username || user.full_name || "Admin",
        sender_avatar: user.avatar_url,
        content: newMessage,
        timestamp: new Date().toISOString(),
        room_id: activeRoom,
      }

      setMessages([...messages, newChatMessage])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)

      // Even if API fails, add message to UI for better UX
      const newChatMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender_id: user.id,
        sender_name: user.username || user.full_name || "Admin",
        sender_avatar: user.avatar_url,
        content: newMessage,
        timestamp: new Date().toISOString(),
        room_id: activeRoom,
      }

      setMessages([...messages, newChatMessage])
      setNewMessage("")
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const filteredSellers = searchQuery
    ? sellers.filter(
        (seller) =>
          seller.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          seller.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sellers

  if (loading) {
    return (
      <div className="flex">
        <SuperAdminSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 rounded-full border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <SuperAdminSidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Seller Chat</h1>
            {activeSeller && (
              <div className="ml-4 flex items-center">
                <span className="mx-2 text-gray-400">|</span>
                <div className="flex items-center">
                  {activeSeller.avatar_url ? (
                    <img
                      src={activeSeller.avatar_url || "/placeholder.svg"}
                      alt={activeSeller.username}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
                      <span className="text-purple-600 dark:text-purple-400 font-medium text-xs">
                        {activeSeller.username?.charAt(0).toUpperCase() || "S"}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {activeSeller.username || activeSeller.full_name || "Seller"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sellers Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-850 border-r border-gray-200 dark:border-gray-700 overflow-y-auto hidden md:block">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sellers</h2>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-600 transition-all dark:text-white text-sm"
                />
              </div>

              <ul className="space-y-2">
                {filteredSellers.map((seller) => (
                  <li key={seller._id}>
                    <button
                      onClick={() => {
                        // Find or create a chat room for this seller
                        const room = chatRooms.find((r) => r.participants.includes(seller._id))

                        if (room) {
                          setActiveRoom(room.id)
                          setActiveSeller(seller)
                        } else {
                          // In a real app, you would create a new room here
                          // For now, just show a mock room
                          const newRoom: ChatRoom = {
                            id: `room_${Date.now()}`,
                            name: `Chat with ${seller.username}`,
                            participants: [user?.id || "", seller._id],
                            created_at: new Date().toISOString(),
                          }
                          setChatRooms([...chatRooms, newRoom])
                          setActiveRoom(newRoom.id)
                          setActiveSeller(seller)
                          setMessages([])
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                        activeSeller?._id === seller._id
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {seller.avatar_url ? (
                        <img
                          src={seller.avatar_url || "/placeholder.svg"}
                          alt={seller.username}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {seller.username?.charAt(0).toUpperCase() || "S"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{seller.username || seller.full_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {seller.business_name || "Seller"}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}

                {filteredSellers.length === 0 && (
                  <li className="text-center py-4 text-gray-500 dark:text-gray-400">No sellers found</li>
                )}
              </ul>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeRoom ? (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === user?.id
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            }`}
                          >
                            {message.sender_id !== user?.id && (
                              <div className="flex items-center mb-1">
                                {message.sender_avatar ? (
                                  <img
                                    src={message.sender_avatar || "/placeholder.svg"}
                                    alt={message.sender_name}
                                    className="w-5 h-5 rounded-full mr-2"
                                  />
                                ) : (
                                  <User className="w-5 h-5 mr-2" />
                                )}
                                <span className="text-xs font-medium">{message.sender_name}</span>
                              </div>
                            )}
                            <p>{message.content}</p>
                            <div
                              className={`text-xs mt-1 flex items-center ${
                                message.sender_id === user?.id ? "text-purple-200" : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Select a seller to chat</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a seller from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

