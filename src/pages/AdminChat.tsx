"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Send, User, Clock, Search, RefreshCw, Circle } from "lucide-react"
import { useStore } from "../store"
import SuperAdminSidebar from "../components/SuperAdminSidebar"
import { getChatRooms, getChatMessages, sendChatMessage, markRoomAsRead } from "../api/chatApi"
import { getSellers } from "../api/authApi"
import type { ChatRoom, ChatMessage } from "../types"
import toast from "react-hot-toast"

export default function AdminChat() {
  const [loading, setLoading] = useState(true)
  const [sellers, setSellers] = useState<any[]>([])
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [activeSeller, setActiveSeller] = useState<any | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
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

        // Fetch sellers
        const sellersData = await getSellers(token)

        // Add online status and last active time based on login status
        // In a real app, this would come from the backend
        const sellersWithStatus =
          sellersData?.map((seller) => {
            // For demo purposes, we'll consider the user is online if they have a recent login timestamp
            // In a real app, this would be determined by the backend based on active sessions
            const hasRecentLogin =
              seller.last_login && new Date().getTime() - new Date(seller.last_login).getTime() < 15 * 60 * 1000 // 15 minutes

            return {
              ...seller,
              isOnline: seller.is_online || hasRecentLogin || false,
              lastActive: seller.last_active ? new Date(seller.last_active) : new Date(),
            }
          }) || []

        setSellers(sellersWithStatus || [])

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

  
  }, [token])

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    if (!token) return

    try {
      const rooms = await getChatRooms(token)

      // Only update state if we got rooms back
      if (rooms && rooms.length > 0) {
        // Replace "current_user" with actual user ID in mock data if needed
        const processedRooms = rooms.map((room) => {
          if (room.participants.includes("current_user")) {
            return {
              ...room,
              participants: room.participants.map((id) => (id === "current_user" ? user?.id || id : id)),
            }
          }
          return room
        })

        // Preserve the active room when updating rooms
        setChatRooms((prevRooms) => {
          // If we have an active room, make sure it stays in the list
          if (activeRoom) {
            const activeRoomExists = processedRooms.some((room) => room.id === activeRoom)

            // If the active room doesn't exist in the new data, keep it from the previous state
            if (!activeRoomExists) {
              const currentActiveRoom = prevRooms.find((room) => room.id === activeRoom)
              if (currentActiveRoom) {
                return [...processedRooms, currentActiveRoom]
              }
            }
          }

          return processedRooms
        })

        // Only set the first room as active if no room is currently active
        if (!activeRoom && rooms.length > 0) {
          setActiveRoom(processedRooms[0].id)
          setActiveSeller(processedRooms[0].partner)

          // Mark room as read
          await markRoomAsRead(processedRooms[0].id, token)
        }
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
  }, [activeRoom, token, user?.id, user?.username]) // Add user?.id and user?.username as dependencies

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update the handleSendMessage function to ensure messages go to the correct room
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

  // Update the seller click handler to ensure proper room creation and isolation
  const handleSellerClick = (seller: any) => {
    // Find or create a chat room for this seller
    const room = chatRooms.find((r) => r.partner?.id === seller._id)

    if (room) {
      // Set this room as active and update the UI
      setActiveRoom(room.id)
      setActiveSeller({
        ...room.partner,
        // Ensure we have the latest online status from the sellers list
        isOnline: sellers.find((s) => s._id === seller._id)?.isOnline || false,
        lastActive: sellers.find((s) => s._id === seller._id)?.lastActive || new Date(),
      })

      // Clear any existing polling for messages
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current)
        chatPollingRef.current = null
      }

      // Mark room as read when switching to it
      markRoomAsRead(room.id, token).catch((error) => {
        console.error("Error marking room as read:", error)
      })

      // Fetch messages for this room immediately
      getChatMessages(room.id, token)
        .then((roomMessages) => {
          if (roomMessages && roomMessages.length >= 0) {
            // Process messages to replace "current_user" with actual user ID
            const processedMessages = roomMessages.map((message) => {
              if (message.sender_id === "current_user") {
                return {
                  ...message,
                  sender_id: user?.id || message.sender_id,
                  sender_name:
                    user?.role === "superadmin" ? "SuperAdmin" : user?.username || message.sender_name || "You",
                }
              }
              return message
            })

            setMessages(processedMessages)
          }
        })
        .catch((error) => {
          console.error(`Error fetching messages for room ${room.id}:`, error)
        })
    } else {
      // Create a new room ID using the format chat_sellerId
      const roomId = `chat_${seller._id}`

      // Create a new room object
      const newRoom: ChatRoom = {
        id: roomId,
        name: `Chat with ${seller.username || seller.full_name || "Seller"}`,
        participants: [user?.id || "", seller._id],
        created_at: new Date().toISOString(),
        partner: {
          id: seller._id,
          username: seller.username,
          full_name: seller.full_name,
          role: seller.role,
          avatar_url: seller.avatar_url,
          isOnline: seller.isOnline || false,
          lastActive: seller.lastActive || new Date(),
        },
        last_message: "",
        last_timestamp: new Date().toISOString(),
        unread_count: 0,
      }

      // Add the new room to the list and set it as active
      setChatRooms((prevRooms) => [...prevRooms, newRoom])
      setActiveRoom(newRoom.id)
      setActiveSeller(newRoom.partner)
      setMessages([]) // Clear messages when creating a new room

      // Clear any existing polling for messages
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current)
        chatPollingRef.current = null
      }
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

  // Check if user is authenticated
  if (!token || !user) {
    return (
      <div className="flex">
        <SuperAdminSidebar />
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
      <SuperAdminSidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Seller Chat</h1>
              {activeSeller && (
                <div className="ml-4 flex items-center">
                  <span className="mx-2 text-gray-400">|</span>
                  <div className="flex items-center">
                    {activeSeller.avatar_url ? (
                      <img
                        src={activeSeller.avatar_url || "/placeholder.svg?height=24&width=24"}
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
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {activeSeller.username || activeSeller.full_name || "Seller"}
                        </span>

                        {/* Online status indicator */}
                        {sellers.find((s) => s._id === activeSeller.id)?.isOnline ? (
                          <div className="flex items-center ml-2">
                            <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-1" />
                            <span className="text-xs text-green-500">Active now</span>
                          </div>
                        ) : (
                          <div className="flex items-center ml-2">
                            <Circle className="w-2 h-2 fill-gray-400 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">
                              {sellers.find((s) => s._id === activeSeller.id)?.lastActive
                                ? `Active ${formatLastActive(sellers.find((s) => s._id === activeSeller.id)?.lastActive)}`
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

              {sellers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No sellers found</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {filteredSellers.map((seller) => (
                    <li key={seller._id}>
                      <button
                        onClick={() => handleSellerClick(seller)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                          activeSeller?.id === seller._id
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="relative">
                          {seller.avatar_url ? (
                            <img
                              src={seller.avatar_url || "/placeholder.svg?height=32&width=32"}
                              alt={seller.username}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                              <span className="text-purple-600 dark:text-purple-400 font-medium">
                                {seller.username?.charAt(0).toUpperCase() || "S"}
                              </span>
                            </div>
                          )}

                          {/* Online status indicator dot */}
                          <div
                            className={`absolute bottom-0 right-2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-850 ${
                              seller.isOnline ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{seller.username || seller.full_name || "Seller"}</div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {seller.isOnline ? (
                                <span className="text-green-500">Active now</span>
                              ) : (
                                <span>Active {formatLastActive(seller.lastActive)}</span>
                              )}
                            </div>

                            {/* Show unread count if any */}
                            {chatRooms.find((r) => r.partner?.id === seller._id)?.unread_count > 0 && (
                              <div className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 inline-block">
                                {chatRooms.find((r) => r.partner?.id === seller._id)?.unread_count}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}

                  {filteredSellers.length === 0 && (
                    <li className="text-center py-4 text-gray-500 dark:text-gray-400">No sellers found</li>
                  )}
                </ul>
              )}
            </div>
          </div>

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
                        <p className="text-gray-600 dark:text-gray-400">Send a message to start the conversation</p>
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
                                      ? "bg-purple-600 text-white rounded-tr-none"
                                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none shadow-sm"
                                  }`}
                                >
                                  <p>{message.content}</p>
                                  <div
                                    className={`text-xs mt-1 flex items-center justify-end ${
                                      isCurrentUser ? "text-purple-200" : "text-gray-500 dark:text-gray-400"
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
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 rounded-l-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={sendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className={`px-5 py-3 bg-purple-600 text-white rounded-r-full transition-colors ${
                        sendingMessage || !newMessage.trim()
                          ? "bg-purple-400 cursor-not-allowed"
                          : "hover:bg-purple-700"
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

