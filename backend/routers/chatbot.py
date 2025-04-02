from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import httpx
import os
from dotenv import load_dotenv
import json
from pymongo import MongoClient
from bson import ObjectId
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb+srv://amine:amine200%40@cluster-0.iiu2z.mongodb.net/ecommerce_db?retryWrites=true&w=majority")
client = MongoClient(MONGO_URI)
db = client.get_database("ecommerce_db")

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not found in environment variables")

# Initialize router
router = APIRouter(prefix="/chatbot", tags=["chatbot"])

# Models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

# Helper function to convert ObjectId to string for JSON serialization
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

# Helper to get database context based on query
def get_db_context(query: str) -> str:
    """
    Retrieve relevant information from the database based on the user's query.
    """
    context = []
    
    # Check if query is about products
    if any(keyword in query.lower() for keyword in ["product", "item", "buy", "purchase", "price"]):
        try:
            # Get top 2 products (reduced from 5 to save tokens)
            products = list(db.products.find().limit(2))
            if products:
                # Simplify product data to reduce token count
                simplified_products = []
                for p in products:
                    simplified_products.append({
                        "name": p.get("title", ""),
                        "price": p.get("price", 0),
                        "category": p.get("category", "")
                    })
                products_info = json.dumps(simplified_products, cls=JSONEncoder)
                context.append(f"Products: {products_info}")
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
    
    # Check if query is about orders or shipping
    if any(keyword in query.lower() for keyword in ["order", "shipping", "delivery", "track"]):
        try:
            order_info = "Orders include: order ID, customer info, product details, shipping address, payment method, and status."
            context.append(order_info)
        except Exception as e:
            logger.error(f"Error with order info: {e}")
    
    # Check if query is about sellers
    if any(keyword in query.lower() for keyword in ["seller", "vendor", "sell", "selling"]):
        try:
            seller_info = "To become a seller: register, complete profile, submit application for review."
            context.append(seller_info)
        except Exception as e:
            logger.error(f"Error with seller info: {e}")
    
    return "\n".join(context)

# Simplified system prompt to reduce token count
SYSTEM_PROMPT = """
You are Matrix Assistant for Matrix Marketplace, a sports equipment e-commerce platform.
Be helpful, friendly, and concise. Focus on marketplace features, products, orders, and seller information.
"""

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat request and return an AI-generated response.
    """
    try:
        # Validate Groq API key
        if not GROQ_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Chatbot service is currently unavailable"
            )
        
        # Extract the latest user message
        if not request.messages or len(request.messages) == 0:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "No messages provided"}
            )
        
        latest_user_message = next((m.content for m in reversed(request.messages) if m.role == "user"), None)
        
        if not latest_user_message:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "No user message found"}
            )
        
        # Get relevant database context
        db_context = get_db_context(latest_user_message)
        
        # Prepare messages for Groq API
        groq_messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        
        # Add database context if available (but keep it brief)
        if db_context:
            groq_messages.append({
                "role": "system", 
                "content": f"Context: {db_context}"
            })
        
        # Add conversation history (limited to last 5 messages to reduce token count)
        for msg in request.messages[-5:]:
            groq_messages.append({"role": msg.role, "content": msg.content})
        
        # Call Groq API
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama3-8b-8192",  # Using smaller model to avoid token limits
            "messages": groq_messages,
            "max_tokens": 500,
            "temperature": 0.7,
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            
            if response.status_code != 200:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                
                # If we hit token limits, try with an even smaller context
                if response.status_code == 413 or "too large" in response.text.lower():
                    # Retry with minimal context
                    minimal_messages = [
                        {"role": "system", "content": "You are Matrix Assistant. Be brief."},
                        {"role": "user", "content": latest_user_message}
                    ]
                    
                    payload["messages"] = minimal_messages
                    retry_response = await client.post(GROQ_API_URL, json=payload, headers=headers)
                    
                    if retry_response.status_code == 200:
                        response_data = retry_response.json()
                        ai_response = response_data["choices"][0]["message"]["content"]
                    else:
                        # If still failing, use fallback response
                        ai_response = "I'm sorry, I'm having trouble processing your request right now. Could you try asking a simpler question or try again later?"
                else:
                    # For other errors, use fallback response
                    ai_response = "I'm sorry, I'm having trouble connecting to my knowledge base. Please try again later."
            else:
                response_data = response.json()
                ai_response = response_data["choices"][0]["message"]["content"]
        
        # Log the interaction
        if request.user_id:
            try:
                db.chat_logs.insert_one({
                    "user_id": request.user_id,
                    "timestamp": datetime.now(),
                    "user_message": latest_user_message,
                    "bot_response": ai_response
                })
            except Exception as e:
                logger.error(f"Error logging chat: {e}")
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        # Return a fallback response instead of an error
        return ChatResponse(
            response="I'm sorry, I'm having trouble processing your request. Please try again later.",
            timestamp=datetime.now()
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the chatbot service.
    """
    return {"status": "healthy", "timestamp": datetime.now()}