from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
import os
import json
from pymongo import MongoClient

# Import from users.py
from .users import get_current_user, get_current_active_user

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)
    
    async def broadcast(self, message: str, exclude_user_id: str = None):
        for user_id, connection in self.active_connections.items():
            if user_id != exclude_user_id:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        # Validate token and get user
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            return
        
        # Get user from database
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            await websocket.close(code=1008)
            return
        
        # Connect to WebSocket
        await manager.connect(websocket, user_id)
        
        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Save message to database
                message = {
                    "sender_id": user_id,
                    "receiver_id": message_data.get("receiver_id"),
                    "content": message_data.get("content"),
                    "timestamp": datetime.utcnow(),
                    "read": False
                }
                
                result = db.chat_messages.insert_one(message)
                message["_id"] = str(result.inserted_id)
                message["sender_id"] = str(message["sender_id"])
                message["receiver_id"] = str(message["receiver_id"])
                
                # Send message to receiver if online
                receiver_id = message["receiver_id"]
                await manager.send_personal_message(json.dumps(message), receiver_id)
                
                # Create notification for receiver
                notification = {
                    "user_id": receiver_id,
                    "type": "chat_message",
                    "title": "New Message",
                    "message": f"You have a new message from {user['username']}",
                    "read": False,
                    "created_at": datetime.utcnow(),
                    "data": {
                        "sender_id": user_id,
                        "sender_name": user["username"],
                        "message_id": message["_id"]
                    }
                }
                
                db.notifications.insert_one(notification)
                
        except WebSocketDisconnect:
            manager.disconnect(user_id)
        
    except Exception as e:
        await websocket.close(code=1008)

@router.get("/messages", response_model=List[Dict[str, Any]])
async def get_chat_messages(
    current_user: dict = Depends(get_current_active_user),
    other_user_id: str = None,
    skip: int = 0,
    limit: int = 50
):
    # Build query
    query = {
        "$or": [
            {"sender_id": current_user["_id"], "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": current_user["_id"]}
        ]
    }
    
    # If no specific user, get all messages for current user
    if not other_user_id:
        query = {
            "$or": [
                {"sender_id": current_user["_id"]},
                {"receiver_id": current_user["_id"]}
            ]
        }
    
    # Get messages
    messages = list(
        db.chat_messages.find(query)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )
    
    # Convert ObjectId to string
    for message in messages:
        message["_id"] = str(message["_id"])
        message["sender_id"] = str(message["sender_id"])
        message["receiver_id"] = str(message["receiver_id"])
    
    # Mark messages as read
    if other_user_id:
        db.chat_messages.update_many(
            {"sender_id": other_user_id, "receiver_id": current_user["_id"], "read": False},
            {"$set": {"read": True}}
        )
    
    return messages

@router.get("/contacts", response_model=List[Dict[str, Any]])
async def get_chat_contacts(
    current_user: dict = Depends(get_current_active_user)
):
    # Get all users who have exchanged messages with current user
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"sender_id": current_user["_id"]},
                    {"receiver_id": current_user["_id"]}
                ]
            }
        },
        {
            "$group": {
                "_id": {
                    "$cond": [
                        {"$eq": ["$sender_id", current_user["_id"]]},
                        "$receiver_id",
                        "$sender_id"
                    ]
                },
                "last_message": {"$last": "$content"},
                "last_timestamp": {"$max": "$timestamp"},
                "unread_count": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    {"$eq": ["$receiver_id", current_user["_id"]]},
                                    {"$eq": ["$read", False]}
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {"$sort": {"last_timestamp": -1}}
    ]
    
    contacts = list(db.chat_messages.aggregate(pipeline))
    
    # Get user details for each contact
    result = []
    for contact in contacts:
        user_id = contact["_id"]
        user = db.users.find_one({"_id": ObjectId(user_id)})
        
        if user:
            result.append({
                "user_id": str(user["_id"]),
                "username": user["username"],
                "full_name": user.get("full_name"),
                "role": user["role"],
                "last_message": contact["last_message"],
                "last_timestamp": contact["last_timestamp"],
                "unread_count": contact["unread_count"]
            })
    
    return result

