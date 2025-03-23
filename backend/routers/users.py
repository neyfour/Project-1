from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, EmailStr
import jwt
from passlib.context import CryptContext
from bson import ObjectId
import os
from pymongo import MongoClient
from google.oauth2 import id_token
from google.auth.transport import requests

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://amine:amine200%40@cluster-0.iiu2z.mongodb.net/ecommerce_db?retryWrites=true&w=majority")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "2ca83451c4cfa6b46d3826319fec5fc877c946cec7ce0d0cdaf266fedb7d9ae1")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "290426604593-h3gdolqn5kl581sgq70nlgn3lrjffovu.apps.googleusercontent.com")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

# Models
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    token: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class SellerApplication(BaseModel):
    business_name: str
    business_type: str
    description: str
    address: str
    phone: str
    tax_id: Optional[str] = None

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    
    # Convert ObjectId to string
    user["_id"] = str(user["_id"])
    return user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Routes
@router.post("/register", response_model=Token)
async def register_user(user: UserCreate):
    # Check if user already exists
    if db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "role": "customer",  # Default role
        "created_at": datetime.utcnow(),
        "balance": 0,  # Initial balance for sellers
        "is_active": True
    }
    
    result = db.users.insert_one(user_data)
    user_id = str(result.inserted_id)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    # Return user without password
    user_data["_id"] = user_id
    del user_data["hashed_password"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.users.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    
    # Return user without password
    user["_id"] = str(user["_id"])
    del user["hashed_password"]
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/google-login", response_model=Token)
async def google_login(google_data: GoogleLogin):
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            google_data.token, requests.Request(), GOOGLE_CLIENT_ID
        )
        
        # Check if the token is valid
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer",
            )
        
        # Get user info from token
        email = idinfo['email']
        name = idinfo.get('name', '')
        
        # Check if user exists
        user = db.users.find_one({"email": email})
        
        if not user:
            # Create new user
            user_data = {
                "email": email,
                "username": email.split('@')[0],
                "full_name": name,
                "role": "customer",  # Default role
                "created_at": datetime.utcnow(),
                "balance": 0,
                "is_active": True,
                "google_id": idinfo['sub']  # Store Google ID
            }
            
            result = db.users.insert_one(user_data)
            user_id = str(result.inserted_id)
            user_data["_id"] = user_id
        else:
            # Update existing user with Google ID if not present
            if 'google_id' not in user:
                db.users.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"google_id": idinfo['sub']}}
                )
            
            user_id = str(user["_id"])
            
            # Remove hashed_password if exists
            if "hashed_password" in user:
                del user["hashed_password"]
            
            user["_id"] = user_id
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user if user else user_data
        }
        
    except ValueError:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

@router.get("/me", response_model=Dict[str, Any])
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/become-seller")
async def become_seller(
    application: SellerApplication,
    current_user: dict = Depends(get_current_user)
):
    # Check if user is already a seller
    if current_user["role"] == "seller":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a seller"
        )
    
    # Create seller application
    seller_application = {
        "user_id": current_user["_id"],
        "business_name": application.business_name,
        "business_type": application.business_type,
        "description": application.description,
        "address": application.address,
        "phone": application.phone,
        "tax_id": application.tax_id,
        "status": "pending",  # pending, approved, rejected
        "created_at": datetime.utcnow()
    }
    
    db.seller_applications.insert_one(seller_application)
    
    # Create notification for superadmin
    notification = {
        "user_id": None,  # For superadmin
        "type": "seller_application",
        "title": "New Seller Application",
        "message": f"User {current_user['username']} has applied to become a seller",
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    db.notifications.insert_one(notification)
    
    return {"message": "Your seller application has been submitted for review"}

@router.get("/sellers", response_model=List[Dict[str, Any]])
async def get_sellers(current_user: dict = Depends(get_current_user)):
    # Only superadmin can view all sellers
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view sellers"
        )
    
    sellers = list(db.users.find({"role": "seller"}))
    
    # Convert ObjectId to string and remove passwords
    for seller in sellers:
        seller["_id"] = str(seller["_id"])
        if "hashed_password" in seller:
            del seller["hashed_password"]
        
        # Get seller application details
        application = db.seller_applications.find_one({"user_id": seller["_id"]})
        if application:
            seller["business_name"] = application.get("business_name")
            seller["business_type"] = application.get("business_type")
            seller["application_status"] = application.get("status")
        
        # Get seller statistics
        pipeline = [
            {"$match": {"seller_id": seller["_id"]}},
            {"$group": {
                "_id": None,
                "total_products": {"$sum": 1}
            }}
        ]
        product_stats = list(db.products.aggregate(pipeline))
        seller["total_products"] = product_stats[0]["total_products"] if product_stats else 0
        
        # Get order statistics
        pipeline = [
            {"$match": {"items.seller_id": seller["_id"], "status": "completed"}},
            {"$unwind": "$items"},
            {"$match": {"items.seller_id": seller["_id"]}},
            {"$group": {
                "_id": None,
                "total_sales": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}},
                "total_orders": {"$sum": 1}
            }}
        ]
        order_stats = list(db.orders.aggregate(pipeline))
        if order_stats:
            seller["total_sales"] = order_stats[0]["total_sales"]
            seller["total_orders"] = order_stats[0]["total_orders"]
        else:
            seller["total_sales"] = 0
            seller["total_orders"] = 0
    
    return sellers

@router.get("/seller-applications", response_model=List[Dict[str, Any]])
async def get_seller_applications(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = None
):
    # Only superadmin can view seller applications
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view seller applications"
        )
    
    # Build query
    query = {}
    if status:
        query["status"] = status
    
    applications = list(db.seller_applications.find(query).sort("created_at", -1))
    
    # Convert ObjectId to string
    for app in applications:
        app["_id"] = str(app["_id"])
        
        # Get user details
        user = db.users.find_one({"_id": ObjectId(app["user_id"])})
        if user:
            app["user"] = {
                "_id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "full_name": user.get("full_name")
            }
    
    return applications

@router.put("/seller-applications/{application_id}/approve")
async def approve_seller_application(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Only superadmin can approve seller applications
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to approve seller applications"
        )
    
    # Get application
    application = db.seller_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Update application status
    db.seller_applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {
            "status": "approved",
            "approved_by": current_user["_id"],
            "approved_at": datetime.utcnow()
        }}
    )
    
    # Update user role
    db.users.update_one(
        {"_id": ObjectId(application["user_id"])},
        {"$set": {"role": "seller"}}
    )
    
    # Create notification for user
    notification = {
        "user_id": application["user_id"],
        "type": "seller_application_approved",
        "title": "Seller Application Approved",
        "message": "Your application to become a seller has been approved",
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    db.notifications.insert_one(notification)
    
    return {"message": "Seller application approved successfully"}

@router.put("/seller-applications/{application_id}/reject")
async def reject_seller_application(
    application_id: str,
    reason: Dict[str, str] = Body(...),
    current_user: dict = Depends(get_current_user)
):
    # Only superadmin can reject seller applications
    if current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to reject seller applications"
        )
    
    # Get application
    application = db.seller_applications.find_one({"_id": ObjectId(application_id)})
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Update application status
    db.seller_applications.update_one(
        {"_id": ObjectId(application_id)},
        {"$set": {
            "status": "rejected",
            "rejected_by": current_user["_id"],
            "rejected_at": datetime.utcnow(),
            "rejection_reason": reason.get("reason", "")
        }}
    )
    
    # Create notification for user
    notification = {
        "user_id": application["user_id"],
        "type": "seller_application_rejected",
        "title": "Seller Application Rejected",
        "message": f"Your application to become a seller has been rejected. Reason: {reason.get('reason', '')}",
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    db.notifications.insert_one(notification)
    
    return {"message": "Seller application rejected successfully"}

@router.get("/notifications", response_model=List[Dict[str, Any]])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    unread_only: bool = False
):
    # Build query
    query = {}
    
    if current_user["role"] == "superadmin":
        # Superadmin sees notifications for superadmin and those without a specific user
        query["$or"] = [
            {"user_id": current_user["_id"]},
            {"user_id": None}
        ]
    else:
        # Regular users only see their own notifications
        query["user_id"] = current_user["_id"]
    
    if unread_only:
        query["read"] = False
    
    # Get notifications
    notifications = list(
        db.notifications.find(query)
        .sort("created_at", -1)
        .limit(50)
    )
    
    # Convert ObjectId to string
    for notification in notifications:
        notification["_id"] = str(notification["_id"])
        if notification["user_id"]:
            notification["user_id"] = str(notification["user_id"])
    
    return notifications

@router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Get notification
    notification = db.notifications.find_one({"_id": ObjectId(notification_id)})
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check if user has permission to mark this notification as read
    if notification["user_id"] and notification["user_id"] != current_user["_id"] and current_user["role"] != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this notification as read"
        )
    
    # Mark as read
    db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"read": True}}
    )
    
    return {"message": "Notification marked as read"}

@router.put("/notifications/read-all")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user)
):
    # Build query
    query = {}
    
    if current_user["role"] == "superadmin":
        # Superadmin can mark all superadmin notifications as read
        query["$or"] = [
            {"user_id": current_user["_id"]},
            {"user_id": None}
        ]
    else:
        # Regular users only mark their own notifications as read
        query["user_id"] = current_user["_id"]
    
    # Mark all as read
    db.notifications.update_many(
        query,
        {"$set": {"read": True}}
    )
    
    return {"message": "All notifications marked as read"}

