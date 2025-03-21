// src/api/chatApi.ts
import { api } from "../config/db"
import type { ChatMessage, ChatRoom } from "../types"

export const getChatRooms = async (token: string): Promise<ChatRoom[]> => {
  try {
    const response = await fetch(`${api.url}/chat/rooms`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error("Error fetching chat rooms")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching chat rooms:", error)
    throw error
  }
}

export const getChatMessages = async (roomId: string, token: string): Promise<ChatMessage[]> => {
  try {
    const response = await fetch(`${api.url}/chat/rooms/${roomId}/messages`, {
      headers: api.getHeaders(token),
    })

    if (!response.ok) {
      throw new Error(`Error fetching messages for room ${roomId}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching messages for room ${roomId}:`, error)
    throw error
  }
}

export const sendChatMessage = async (roomId: string, content: string, token: string): Promise<ChatMessage> => {
  try {
    const response = await fetch(`${api.url}/chat/rooms/${roomId}/messages`, {
      method: "POST",
      headers: api.getHeaders(token),
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error(`Error sending message to room ${roomId}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error sending message to room ${roomId}:`, error)
    throw error
  }
}

// Mock data for chat rooms and messages
export const getMockChatRooms = (): ChatRoom[] => {
  return [
    {
      id: "room1",
      name: "General",
      participants: ["superadmin", "seller1", "seller2", "seller3"],
      created_at: "2024-05-01T10:00:00Z",
    },
    {
      id: "room2",
      name: "Support",
      participants: ["superadmin", "seller1"],
      created_at: "2024-05-05T14:30:00Z",
    },
    {
      id: "room3",
      name: "Product Discussion",
      participants: ["superadmin", "seller2", "seller3"],
      created_at: "2024-05-10T09:15:00Z",
    },
  ]
}

export const getMockChatMessages = (roomId: string): ChatMessage[] => {
  const messages: Record<string, ChatMessage[]> = {
    room1: [
      {
        id: "msg1",
        sender_id: "superadmin",
        sender_name: "Admin",
        content: "Welcome to the general chat room!",
        timestamp: "2024-06-01T10:00:00Z",
        room_id: "room1",
      },
      {
        id: "msg2",
        sender_id: "seller1",
        sender_name: "John Smith",
        content: "Hello everyone! Excited to be here.",
        timestamp: "2024-06-01T10:05:00Z",
        room_id: "room1",
      },
      {
        id: "msg3",
        sender_id: "seller2",
        sender_name: "Sarah Johnson",
        content: "Hi all! Looking forward to collaborating.",
        timestamp: "2024-06-01T10:10:00Z",
        room_id: "room1",
      },
    ],
    room2: [
      {
        id: "msg4",
        sender_id: "superadmin",
        sender_name: "Admin",
        content: "This is a private support channel for John Smith.",
        timestamp: "2024-06-05T14:30:00Z",
        room_id: "room2",
      },
      {
        id: "msg5",
        sender_id: "seller1",
        sender_name: "John Smith",
        content: "I'm having an issue with uploading product images.",
        timestamp: "2024-06-05T14:35:00Z",
        room_id: "room2",
      },
      {
        id: "msg6",
        sender_id: "superadmin",
        sender_name: "Admin",
        content: "Let me help you with that. What error are you seeing?",
        timestamp: "2024-06-05T14:40:00Z",
        room_id: "room2",
      },
    ],
    room3: [
      {
        id: "msg7",
        sender_id: "superadmin",
        sender_name: "Admin",
        content: "Let's discuss the upcoming product categories.",
        timestamp: "2024-06-10T09:15:00Z",
        room_id: "room3",
      },
      {
        id: "msg8",
        sender_id: "seller2",
        sender_name: "Sarah Johnson",
        content: "I think we should expand the fitness equipment section.",
        timestamp: "2024-06-10T09:20:00Z",
        room_id: "room3",
      },
      {
        id: "msg9",
        sender_id: "seller3",
        sender_name: "Michael Brown",
        content: "Agreed. There's a growing demand for home fitness products.",
        timestamp: "2024-06-10T09:25:00Z",
        room_id: "room3",
      },
    ],
  }

  return messages[roomId] || []
}

