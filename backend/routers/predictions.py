from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from bson import ObjectId
import os
import numpy as np
from sklearn.linear_model import LinearRegression
from pymongo import MongoClient

# Import from users.py
from .users import get_current_user, get_current_active_user

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

router = APIRouter()

@router.get("/sales/{product_id}", response_model=Dict[str, Any])
async def predict_product_sales(
    product_id: str,
    days: int = 30,
    current_user: dict = Depends(get_current_active_user)
):
    # Get product
    product = db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user has permission to view this product's predictions
    is_owner = str(product["seller_id"]) == current_user["_id"]
    is_superadmin = current_user["role"] == "superadmin"
    
    if not (is_owner or is_superadmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this product's predictions"
        )
    
    # Get historical sales data
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=90)  # Use last 90 days for training
    
    pipeline = [
        {
            "$match": {
                "items.product_id": product_id,
                "status": "completed",
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {"$unwind": "$items"},
        {
            "$match": {
                "items.product_id": product_id
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day": {"$dayOfMonth": "$created_at"}
                },
                "quantity": {"$sum": "$items.quantity"},
                "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
    ]
    
    sales_data = list(db.orders.aggregate(pipeline))
    
    # Prepare data for prediction
    if not sales_data:
        # No historical data, return zeros
        return {
            "product_id": product_id,
            "product_name": product["name"],
            "prediction_days": days,
            "predicted_sales": [0] * days,
            "predicted_revenue": [0] * days,
            "total_predicted_sales": 0,
            "total_predicted_revenue": 0,
            "confidence": 0
        }
    
    # Convert sales data to time series
    dates = []
    quantities = []
    revenues = []
    
    for data in sales_data:
        year = data["_id"]["year"]
        month = data["_id"]["month"]
        day = data["_id"]["day"]
        date = datetime(year, month, day)
        dates.append(date)
        quantities.append(data["quantity"])
        revenues.append(data["revenue"])
    
    # Convert dates to numeric (days since first date)
    first_date = min(dates)
    X = np.array([(date - first_date).days for date in dates]).reshape(-1, 1)
    y_quantity = np.array(quantities)
    y_revenue = np.array(revenues)
    
    # Train linear regression models
    model_quantity = LinearRegression()
    model_revenue = LinearRegression()
    
    model_quantity.fit(X, y_quantity)
    model_revenue.fit(X, y_revenue)
    
    # Generate predictions
    last_day = (max(dates) - first_date).days
    future_days = np.array(range(last_day + 1, last_day + days + 1)).reshape(-1, 1)
    
    predicted_quantities = model_quantity.predict(future_days)
    predicted_revenues = model_revenue.predict(future_days)
    
    # Ensure no negative predictions
    predicted_quantities = np.maximum(predicted_quantities, 0)
    predicted_revenues = np.maximum(predicted_revenues, 0)
    
    # Calculate confidence (R² score)
    confidence_quantity = model_quantity.score(X, y_quantity)
    confidence_revenue = model_revenue.score(X, y_revenue)
    confidence = (confidence_quantity + confidence_revenue) / 2
    
    # Format predictions
    predictions = []
    for i in range(days):
        day = (first_date + timedelta(days=int(future_days[i][0]))).strftime("%Y-%m-%d")
        predictions.append({
            "date": day,
            "quantity": round(float(predicted_quantities[i]), 2),
            "revenue": round(float(predicted_revenues[i]), 2)
        })
    
    return {
        "product_id": product_id,
        "product_name": product["name"],
        "prediction_days": days,
        "predictions": predictions,
        "total_predicted_sales": round(float(sum(predicted_quantities)), 2),
        "total_predicted_revenue": round(float(sum(predicted_revenues)), 2),
        "confidence": round(confidence, 2)
    }

@router.get("/sales/seller/{seller_id}", response_model=Dict[str, Any])
async def predict_seller_sales(
    seller_id: str = None,
    days: int = 30,
    current_user: dict = Depends(get_current_active_user)
):
    # If no seller_id provided, use current user
    if not seller_id:
        seller_id = current_user["_id"]
    
    # Check if user has permission to view this seller's predictions
    is_self = seller_id == current_user["_id"]
    is_superadmin = current_user["role"] == "superadmin"
    
    if not (is_self or is_superadmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this seller's predictions"
        )
    
    # Get seller's products
    products = list(db.products.find({"seller_id": ObjectId(seller_id)}))
    product_ids = [str(product["_id"]) for product in products]
    
    if not product_ids:
        return {
            "seller_id": seller_id,
            "prediction_days": days,
            "predictions": [],
            "total_predicted_sales": 0,
            "total_predicted_revenue": 0,
            "confidence": 0,
            "total_predicted_sales": 0,
            "total_predicted_revenue": 0,
            "products": []
        }
    
    # Get historical sales data
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=90)  # Use last 90 days for training
    
    pipeline = [
        {
            "$match": {
                "items.seller_id": seller_id,
                "status": "completed",
                "created_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {"$unwind": "$items"},
        {
            "$match": {
                "items.seller_id": seller_id
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day": {"$dayOfMonth": "$created_at"}
                },
                "quantity": {"$sum": "$items.quantity"},
                "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
    ]
    
    sales_data = list(db.orders.aggregate(pipeline))
    
    # Prepare data for prediction
    if not sales_data:
        # No historical data, return zeros
        return {
            "seller_id": seller_id,
            "prediction_days": days,
            "predictions": [],
            "total_predicted_sales": 0,
            "total_predicted_revenue": 0,
            "confidence": 0,
            "products": [{"product_id": p_id, "name": next((p["name"] for p in products if str(p["_id"]) == p_id), "")} for p_id in product_ids]
        }
    
    # Convert sales data to time series
    dates = []
    quantities = []
    revenues = []
    
    for data in sales_data:
        year = data["_id"]["year"]
        month = data["_id"]["month"]
        day = data["_id"]["day"]
        date = datetime(year, month, day)
        dates.append(date)
        quantities.append(data["quantity"])
        revenues.append(data["revenue"])
    
    # Convert dates to numeric (days since first date)
    first_date = min(dates)
    X = np.array([(date - first_date).days for date in dates]).reshape(-1, 1)
    y_quantity = np.array(quantities)
    y_revenue = np.array(revenues)
    
    # Train linear regression models
    model_quantity = LinearRegression()
    model_revenue = LinearRegression()
    
    model_quantity.fit(X, y_quantity)
    model_revenue.fit(X, y_revenue)
    
    # Generate predictions
    last_day = (max(dates) - first_date).days
    future_days = np.array(range(last_day + 1, last_day + days + 1)).reshape(-1, 1)
    
    predicted_quantities = model_quantity.predict(future_days)
    predicted_revenues = model_revenue.predict(future_days)
    
    # Ensure no negative predictions
    predicted_quantities = np.maximum(predicted_quantities, 0)
    predicted_revenues = np.maximum(predicted_revenues, 0)
    
    # Calculate confidence (R² score)
    confidence_quantity = model_quantity.score(X, y_quantity)
    confidence_revenue = model_revenue.score(X, y_revenue)
    confidence = (confidence_quantity + confidence_revenue) / 2
    
    # Format predictions
    predictions = []
    for i in range(days):
        day = (first_date + timedelta(days=int(future_days[i][0]))).strftime("%Y-%m-%d")
        predictions.append({
            "date": day,
            "quantity": round(float(predicted_quantities[i]), 2),
            "revenue": round(float(predicted_revenues[i]), 2)
        })
    
    return {
        "seller_id": seller_id,
        "prediction_days": days,
        "predictions": predictions,
        "total_predicted_sales": round(float(sum(predicted_quantities)), 2),
        "total_predicted_revenue": round(float(sum(predicted_revenues)), 2),
        "confidence": round(confidence, 2),
        "products": [{"product_id": p_id, "name": next((p["name"] for p in products if str(p["_id"]) == p_id), "")} for p_id in product_ids]
    }

