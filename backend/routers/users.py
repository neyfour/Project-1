from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, EmailStr
import jwt
from passlib.context import CryptContext
from bson import ObjectId
import os
from pymongo import MongoClient

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
    
    # Automatically approve for now (in a real app, this would be reviewed by admin)
    db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"role": "seller"}}
    )
    
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
    
    return {"message": "Your seller application has been approved"}

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
    
    return sellers

@router.get("/seller/{seller_id}/revenue", response_model=Dict[str, Any])
async def get_seller_revenue(
    seller_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Only superadmin or the seller can view their revenue
    if current_user["role"] != "superadmin" and current_user["_id"] != seller_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this seller's revenue"
        )
    
    # Get seller
    seller = db.users.find_one({"_id": ObjectId(seller_id), "role": "seller"})
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    # Calculate total revenue from orders
    pipeline = [
        {"$match": {"items.seller_id": seller_id, "status": "completed"}},
        {"$unwind": "$items"},
        {"$match": {"items.seller_id": seller_id}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}},
            "total_orders": {"$sum": 1}
        }}
    ]
    
    result = list(db.orders.aggregate(pipeline))
    
    total_revenue = 0
    total_orders = 0
    
    if result:
        total_revenue = result[0].get("total_revenue", 0)
        total_orders = result[0].get("total_orders", 0)
    
    # Calculate platform fee (e.g., 10%)
    platform_fee_percentage = 0.10
    platform_fee = total_revenue * platform_fee_percentage
    seller_earnings = total_revenue - platform_fee
    
    # Get current balance
    current_balance = seller.get("balance", 0)
    
    # Get pending payout requests
    pending_payouts = list(db.payout_requests.find({
        "seller_id": seller_id,
        "status": "pending"
    }))
    
    pending_amount = sum(payout.get("amount", 0) for payout in pending_payouts)
    
    return {
        "seller_id": seller_id,
        "total_revenue": total_revenue,
        "platform_fee": platform_fee,
        "seller_earnings": seller_earnings,
        "current_balance": current_balance,
        "pending_payouts": pending_amount,
        "total_orders": total_orders
    }

