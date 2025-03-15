from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
import os
from pymongo import MongoClient

# Import from users.py
from .users import get_current_user, get_current_active_user

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
async def get_orders(
    current_user: dict = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None
):
    # Build query based on user role
    query = {}
    
    if current_user["role"] == "customer":
        # Customers can only see their own orders
        query["user_id"] = current_user["_id"]
    elif current_user["role"] == "seller":
        # Sellers can see orders containing their products
        query["items.seller_id"] = current_user["_id"]
    # Superadmin can see all orders (no additional filter)
    
    if status:
        query["status"] = status
    
    # Get orders
    orders = list(
        db.orders.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    # Convert ObjectId to string
    for order in orders:
        order["_id"] = str(order["_id"])
        order["user_id"] = str(order["user_id"])
        
        # Convert seller_id in items
        for item in order.get("items", []):
            if "seller_id" in item:
                item["seller_id"] = str(item["seller_id"])
            if "product_id" in item:
                item["product_id"] = str(item["product_id"])
    
    return orders

@router.get("/count", response_model=Dict[str, int])
async def get_order_count(
    current_user: dict = Depends(get_current_active_user),
    status: Optional[str] = None
):
    # Build query
    query = {"user_id": current_user["_id"]}
    
    # For sellers, get orders that contain their products
    if current_user["role"] == "seller":
        query = {"items.seller_id": current_user["_id"]}
    
    # For admin/superadmin, they can see all orders
    if current_user["role"] in ["admin", "superadmin"]:
        query = {}
    
    if status:
        query["status"] = status
    
    # Count orders
    count = db.orders.count_documents(query)
    
    return {"count": count}

@router.get("/{order_id}", response_model=Dict[str, Any])
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    is_owner = order["user_id"] == current_user["_id"]
    is_seller = any(item.get("seller_id") == current_user["_id"] for item in order.get("items", []))
    is_superadmin = current_user["role"] == "superadmin"
    
    if not (is_owner or is_seller or is_superadmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    # Convert ObjectId to string
    order["_id"] = str(order["_id"])
    order["user_id"] = str(order["user_id"])
    
    return order

@router.post("/", response_model=Dict[str, Any])
async def create_order(
    order_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    # Validate items
    items = order_data.get("items", [])
    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )
    
    # Calculate total and prepare items with seller info
    total = 0
    processed_items = []
    
    for item in items:
        product_id = item.get("product_id")
        quantity = item.get("quantity", 1)
        
        # Get product
        product = db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        # Check stock
        if product.get("stock", 0) < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for product {product['name']}"
            )
        
        # Calculate item total
        item_price = product["price"]
        item_total = item_price * quantity
        total += item_total
        
        # Add to processed items
        processed_items.append({
            "product_id": product_id,
            "name": product["name"],
            "price": item_price,
            "quantity": quantity,
            "total": item_total,
            "seller_id": str(product["seller_id"]),
            "image_url": product.get("image_url")
        })
        
        # Update product stock
        db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$inc": {"stock": -quantity}}
        )
    
    # Create order
    order = {
        "user_id": current_user["_id"],
        "items": processed_items,
        "total": total,
        "status": "pending",  # pending, processing, shipped, delivered, cancelled
        "shipping_address": order_data.get("shipping_address"),
        "payment_status": "pending",  # pending, paid, failed
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = db.orders.insert_one(order)
    order_id = str(result.inserted_id)
    
    # Create notifications for sellers
    seller_ids = set(item["seller_id"] for item in processed_items)
    
    for seller_id in seller_ids:
        notification = {
            "user_id": seller_id,
            "type": "new_order",
            "title": "New Order",
            "message": f"You have received a new order #{order_id}",
            "read": False,
            "created_at": datetime.utcnow()
        }
        
        db.notifications.insert_one(notification)
    
    # Return created order
    order["_id"] = order_id
    order["user_id"] = str(order["user_id"])
    
    return order

@router.put("/{order_id}/status", response_model=Dict[str, Any])
async def update_order_status(
    order_id: str,
    status_update: Dict[str, str],
    current_user: dict = Depends(get_current_user)
):
    order = db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to update this order
    is_seller = any(item.get("seller_id") == current_user["_id"] for item in order.get("items", []))
    is_superadmin = current_user["role"] == "superadmin"
    
    if not (is_seller or is_superadmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    new_status = status_update.get("status")
    if new_status not in ["pending", "processing", "shipped", "delivered", "cancelled", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    # Update order status
    db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {
            "$set": {
                "status": new_status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # If order is completed, update seller balance
    if new_status == "completed":
        for item in order.get("items", []):
            seller_id = item.get("seller_id")
            item_total = item.get("total", 0)
            
            # Calculate platform fee (e.g., 10%)
            platform_fee_percentage = 0.10
            platform_fee = item_total * platform_fee_percentage
            seller_earnings = item_total - platform_fee
            
            # Update seller balance
            db.users.update_one(
                {"_id": ObjectId(seller_id)},
                {"$inc": {"balance": seller_earnings}}
            )
    
    # Create notification for customer
    notification = {
        "user_id": order["user_id"],
        "type": "order_status",
        "title": "Order Status Update",
        "message": f"Your order #{order_id} has been updated to: {new_status}",
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    db.notifications.insert_one(notification)
    
    # Get updated order
    updated_order = db.orders.find_one({"_id": ObjectId(order_id)})
    updated_order["_id"] = str(updated_order["_id"])
    updated_order["user_id"] = str(updated_order["user_id"])
    
    return updated_order

@router.get("/track/{order_number}", response_model=Dict[str, Any])
async def track_order(order_number: str):
    # Get order by order number
    order = db.orders.find_one({"order_number": order_number})
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Convert ObjectId to string
    order["_id"] = str(order["_id"])
    order["user_id"] = str(order["user_id"])
    
    # Convert seller_id in items
    for item in order.get("items", []):
        if "seller_id" in item:
            item["seller_id"] = str(item["seller_id"])
        if "product_id" in item:
            item["product_id"] = str(item["product_id"])
    
    # Get tracking history
    tracking_history = list(db.order_tracking.find({"order_id": order["_id"]}))
    
    # Convert ObjectId to string
    for entry in tracking_history:
        entry["_id"] = str(entry["_id"])
        entry["order_id"] = str(entry["order_id"])
    
    order["tracking_history"] = tracking_history
    
    return order

