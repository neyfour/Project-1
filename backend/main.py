import os
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List, Dict, Any
from datetime import datetime
import jwt
from pymongo import MongoClient
from bson import ObjectId
import json
from dotenv import load_dotenv
from routers import users, products, orders, payments, chat, predictions, promotions, seller_payouts

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="E-Commerce API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

# Initialize WebSocket connection manager for chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.user_connections[user_id] = websocket
        
        # For seller-admin chat, create a room
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user and user.get("role") == "seller":
            room_id = f"seller_{user_id}"
            if room_id not in self.active_connections:
                self.active_connections[room_id] = []
            self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        
        # Remove from seller-admin chat room if applicable
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user and user.get("role") == "seller":
            room_id = f"seller_{user_id}"
            if room_id in self.active_connections:
                self.active_connections[room_id] = [
                    conn for conn in self.active_connections[room_id] if conn != websocket
                ]
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.user_connections:
            await self.user_connections[user_id].send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(message)

manager = ConnectionManager()

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(promotions.router, prefix="/api/promotions", tags=["promotions"])
app.include_router(seller_payouts.router, prefix="/api/payouts", tags=["payouts"])

# WebSocket endpoint for chat
@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
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
            
            # Send to receiver if online
            if message.get("receiver_id") in manager.user_connections:
                await manager.send_personal_message(json.dumps(message), message.get("receiver_id"))
            
            # For seller-admin chat, also broadcast to room
            sender = db.users.find_one({"_id": ObjectId(user_id)})
            if sender and sender.get("role") == "seller":
                room_id = f"seller_{user_id}"
                await manager.broadcast_to_room(json.dumps(message), room_id)
            
            # Send confirmation back to sender
            await websocket.send_text(json.dumps({"status": "sent", "message_id": message["_id"]}))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.get("/")
async def root():
    return {"message": "Welcome to the E-commerce API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

