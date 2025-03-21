"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, User, Clock, RefreshCw, Circle } from "lucide-react"
import { useStore } from "../store"
import SellerSidebar from "../components/SellerSidebar"
import { getChatRooms, getChatMessages, sendChatMessage, markRoomAsRead } from "../api/chatApi"
import type { ChatRoom, ChatMessage } from "../types"
import toast from "react-hot-toast"

export default function SellerChat() {
  const [loading, setLoading] = useState(true)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [activeAdmin, setActiveAdmin] = useState<any | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatPollingRef = useRef<NodeJS.Timeout | null>(null)
  const roomsPollingRef = useRef<NodeJS.Timeout | null>(null)

  const user = useStore((state) => state.user)
  const token = useStore((state) => state.token)

  // Initial data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Check if token exists
        if (!token) {
          toast.error("Authentication required. Please log in.")
          setLoading(false)
          return
        }

        // Fetch chat rooms
        await fetchChatRooms()
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast.error("Failed to load chat data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up polling for rooms with a longer interval to reduce interference
    if (token) {
      roomsPollingRef.current = setInterval(fetchChatRooms, 30000) // Poll every 30 seconds instead of 15
    }

    return () => {
      if (roomsPollingRef.current) clearInterval(roomsPollingRef.current)
      if (chatPollingRef.current) clearInterval(chatPollingRef.current)
    }
  }, [token])

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    if (!token) return

    try {
      const rooms = await getChatRooms(token)

      // Filter for admin chats only
      const adminRooms = rooms.filter((room) => room.partner?.role === "superadmin")

      // Process rooms to replace "current_user" with actual user ID in mock data if needed
      const processedRooms = adminRooms.map((room) => {
        if (room.participants.includes("current_user")) {
          return {
            ...room,
            participants: room.participants.map((id) => (id === "current_user" ? user?.id || id : id)),
          }
        }
        return room
      })

      // Only update state if we got rooms back
      if (processedRooms && processedRooms.length > 0) {
        setChatRooms(processedRooms)

        // If no active room is set but we have rooms, set the first one as active
        if (!activeRoom) {
          setActiveRoom(processedRooms[0].id)
          setActiveAdmin({
            ...processedRooms[0].partner,
            // Set admin as online when user is logged in
            isOnline: true,
            lastActive: new Date(),
          })

          // Mark room as read
          await markRoomAsRead(processedRooms[0].id, token)
        }
      } else if (!activeRoom && rooms.length > 0) {
        // If no admin rooms but we have other rooms, create a default admin chat
        const adminId = "admin1" // This should be the actual admin ID from your system
        const roomId = `chat_${adminId}`

        const newRoom: ChatRoom = {
          id: roomId,
          name: "Admin Support",
          participants: [user?.id || "", adminId],
          created_at: new Date().toISOString(),
          partner: {
            id: adminId,
            username: "SuperAdmin",
            full_name: "System Administrator",
            role: "superadmin",
            avatar_url: "",
            isOnline: true,
            lastActive: new Date(),
          },
          last_message: "",
          last_timestamp: new Date().toISOString(),
          unread_count: 0,
        }

        setChatRooms([newRoom])
        setActiveRoom(newRoom.id)
        setActiveAdmin(newRoom.partner)
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
      // Don't show error toast on polling
      if (!roomsPollingRef.current) {
        toast.error("Failed to load chat rooms")
      }
    }
  }

  // Fetch messages when active room changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeRoom || !token) return

      try {
        const roomMessages = await getChatMessages(activeRoom, token)
        if (roomMessages && roomMessages.length >= 0) {
          // Process messages to replace "current_user" with actual user ID
          const processedMessages = roomMessages.map((message) => {
            if (message.sender_id === "current_user") {
              return {
                ...message,
                sender_id: user?.id || message.sender_id,
                sender_name: user?.username || message.sender_name || "You",
              }
            }
            // Ensure SuperAdmin is displayed for admin messages
            if (message.sender_id.includes("admin")) {
              return {
                ...message,
                sender_name: "SuperAdmin",
              }
            }
            return message
          })

          setMessages(processedMessages)

          // Mark room as read
          await markRoomAsRead(activeRoom, token)

          // Update unread count in rooms list
          setChatRooms((prev) => prev.map((room) => (room.id === activeRoom ? { ...room, unread_count: 0 } : room)))
        }
      } catch (error) {
        console.error(`Error fetching messages for room ${activeRoom}:`, error)
        // Don't show error toast on polling
        if (!chatPollingRef.current) {
          toast.error("Failed to load messages")
        }
      }
    }

    if (activeRoom) {
      fetchMessages()

      // Set up polling for messages in this room
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current)
      }

      chatPollingRef.current = setInterval(fetchMessages, 5000) // Poll every 5 seconds
    }

    return () => {
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current)
        chatPollingRef.current = null
      }
    }
  }, [activeRoom, token, user?.id, user?.username])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !activeRoom || !user || sendingMessage) return

    try {
      setSendingMessage(true)

      // Send message to the API
      let sentMessage = await sendChatMessage(activeRoom, newMessage, token)

      // If using mock data, replace "current_user" with actual user ID
      if (sentMessage.sender_id === "current_user") {
        sentMessage = {
          ...sentMessage,
          sender_id: user.id,
          sender_name: user.username || "You",
        }
      }

      // Add message to the UI
      setMessages((prev) => [...prev, sentMessage])
      setNewMessage("")

      // Refresh rooms to update last message
      fetchChatRooms()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleRefresh = async () => {
    if (refreshing) return

    setRefreshing(true)
    try {
      await fetchChatRooms()

      if (activeRoom) {
        const roomMessages = await getChatMessages(activeRoom, token)
        if (roomMessages && roomMessages.length >= 0) {
          setMessages(roomMessages)
        }
      }

      toast.success("Chat refreshed")
    } catch (error) {
      console.error("Error refreshing chat:", error)
      toast.error("Failed to refresh chat")
    } finally {
      setRefreshing(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format last active time in a human-readable way (like Facebook Messenger)
  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex">
        <SellerSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!token || !user) {
    return (
      <div className="flex">
        <SellerSidebar />
        <div className="flex-1 md:ml-64 p-6 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Authentication Required</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to access the chat.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <SellerSidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Support Chat</h1>
              {activeAdmin && (
                <div className="ml-4 flex items-center">
                  <span className="mx-2 text-gray-400">|</span>
                  <div className="flex items-center">
                    {activeAdmin.avatar_url ? (
                      <img
                        src={activeAdmin.avatar_url || "/placeholder.svg?height=24&width=24"}
                        alt={activeAdmin.username}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                          {activeAdmin.username?.charAt(0).toUpperCase() || "A"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {activeAdmin.username || activeAdmin.full_name || "Admin"}
                        </span>

                        {/* Online status indicator */}
                        {activeAdmin.isOnline ? (
                          <div className="flex items-center ml-2">
                            <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-1" />
                            <span className="text-xs text-green-500">Active now</span>
                          </div>
                        ) : (
                          <div className="flex items-center ml-2">
                            <Circle className="w-2 h-2 fill-gray-400 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">
                              {activeAdmin.lastActive
                                ? `Active ${formatLastActive(activeAdmin.lastActive)}`
                                : "Offline"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Refresh chat"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeRoom ? (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Send a message to start the conversation with the admin
                        </p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === user?.id
                        const showSenderInfo = index === 0 || messages[index - 1].sender_id !== message.sender_id

                        return (
                          <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] ${isCurrentUser ? "" : "flex"}`}>
                              {/* Avatar for other user - only show on first message in a sequence */}
                              {!isCurrentUser && showSenderInfo && (
                                <div className="flex-shrink-0 mr-2 self-end mb-1">
                                  {message.sender_avatar ? (
                                    <img
                                      src={message.sender_avatar || "/placeholder.svg?height=28&width=28"}
                                      alt={message.sender_name}
                                      className="w-7 h-7 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              )}

                              <div>
                                {/* Sender name - only show on first message in a sequence */}
                                {!isCurrentUser && showSenderInfo && (
                                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1 mb-1">
                                    {message.sender_name}
                                  </div>
                                )}

                                <div
                                  className={`rounded-2xl px-4 py-2 ${
                                    isCurrentUser
                                      ? "bg-indigo-600 text-white rounded-tr-none"
                                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none shadow-sm"
                                  }`}
                                >
                                  <p>{message.content}</p>
                                  <div
                                    className={`text-xs mt-1 flex items-center justify-end ${
                                      isCurrentUser ? "text-indigo-200" : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTime(message.timestamp)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <form onSubmit={handleSendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message to admin..."
                      className="flex-1 px-4 py-3 rounded-l-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className={`px-5 py-3 bg-indigo-600 text-white rounded-r-full transition-colors ${
                        sendingMessage || !newMessage.trim()
                          ? "bg-indigo-400 cursor-not-allowed"
                          : "hover:bg-indigo-700"
                      }`}
                    >
                      <Send className={`w-5 h-5 ${sendingMessage ? "animate-pulse" : ""}`} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Admin Support</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No active chat found. Please refresh to connect with an admin.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

