from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import os
from pymongo import MongoClient

# Import from users.py
from .users import get_current_active_user

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

router = APIRouter()

@router.get("/", response_model=Dict[str, Any])
async def get_statistics(
    current_user: dict = Depends(get_current_active_user),
    period: Optional[str] = "month",  # day, week, month, year
    seller_id: Optional[str] = None
):
    # Only admin, superadmin, or the seller themselves can access statistics
    if current_user["role"] not in ["admin", "superadmin"] and (
        seller_id and seller_id != current_user["_id"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these statistics"
        )
    
    # Set date range based on period
    now = datetime.utcnow()
    if period == "day":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif period == "year":
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_date = now - timedelta(days=30)
    
    # Build query
    query = {"created_at": {"$gte": start_date}}
    if seller_id:
        query["seller_id"] = seller_id
    
    # Get product count
    product_count = db.products.count_documents(query)
    
    # Get order statistics
    order_query = {"created_at": {"$gte": start_date}}
    if seller_id:
        order_query["items.seller_id"] = seller_id
    
    orders = list(db.orders.find(order_query))
    
    # Calculate statistics
    total_orders = len(orders)
    total_revenue = sum(order["total"] for order in orders)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Get top categories
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": "$category",
            "count": {"$sum": 1},
            "revenue": {"$sum": "$price"}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 5},
        {"$project": {
            "name": "$_id",
            "count": 1,
            "revenue": 1,
            "_id": 0
        }}
    ]
    
    top_categories = list(db.products.aggregate(pipeline))
    
    # Get top products
    pipeline = [
        {"$match": query},
        {"$sort": {"sales_count": -1}},
        {"$limit": 5},
        {"$project": {
            "_id": {"$toString": "$_id"},
            "name": "$title",
            "price": 1,
            "sales_count": 1,
            "revenue": {"$multiply": ["$price", "$sales_count"]}
        }}
    ]
    
    top_products = list(db.products.aggregate(pipeline))
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_products": product_count,
        "avg_order_value": avg_order_value,
        "top_categories": top_categories,
        "top_products": top_products
    }

@router.get("/predictions", response_model=List[Dict[str, Any]])
async def get_predictions(
    current_user: dict = Depends(get_current_active_user),
    seller_id: Optional[str] = None
):
    # Only admin, superadmin, or the seller themselves can access predictions
    if current_user["role"] not in ["admin", "superadmin"] and (
        seller_id and seller_id != current_user["_id"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access these predictions"
        )
    
    # In a real app, you would use a machine learning model to generate predictions
    # For now, we'll return mock data
    
    # Get historical data for the past 6 months
    now = datetime.utcnow()
    months = []
    predictions = []
    
    for i in range(6, 0, -1):
        month_start = now.replace(day=1) - timedelta(days=30 * i)
        month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        
        # Query for orders in this month
        query = {
            "created_at": {
                "$gte": month_start,
                "$lte": month_end
            }
        }
        
        if seller_id:
            query["items.seller_id"] = seller_id
        
        # Get actual revenue for this month
        orders = list(db.orders.find(query))
        actual_revenue = sum(order["total"] for order in orders)
        
        month_name = month_start.strftime("%b %Y")
        months.append(month_name)
        
        predictions.append({
            "period": month_name,
            "actual_revenue": actual_revenue,
            "predicted_revenue": actual_revenue,  # Same as actual for historical data
            "growth_rate": 0,
            "confidence_low": actual_revenue * 0.9,
            "confidence_high": actual_revenue * 1.1
        })
    
    # Add predictions for the next 3 months
    last_actual = predictions[-1]["actual_revenue"] if predictions else 1000
    growth_rates = [0.05, 0.08, 0.12]  # Example growth rates
    
    for i in range(1, 4):
        month_start = now.replace(day=1) + timedelta(days=30 * i)
        month_name = month_start.strftime("%b %Y")
        
        growth_rate = growth_rates[i-1]
        predicted_revenue = last_actual * (1 + growth_rate)
        
        predictions.append({
            "period": month_name,
            "predicted_revenue": predicted_revenue,
            "growth_rate": growth_rate,
            "confidence_low": predicted_revenue * 0.8,
            "confidence_high": predicted_revenue * 1.2
        })
        
        last_actual = predicted_revenue
    
    return predictions

