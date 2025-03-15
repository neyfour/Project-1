"""
Database migration script for Matrix Commerce backend.
This script ensures all required collections are created and properly indexed.
"""

import asyncio
import motor.motor_asyncio
from pymongo import IndexModel, ASCENDING, TEXT
from bson import ObjectId
from datetime import datetime
from config import settings
import bcrypt

# Connect to MongoDB
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

async def create_collections():
    """Create all required collections if they don't exist"""
    collections = await db.list_collection_names()
    
    required_collections = [
        "users",
        "products",
        "orders",
        "notifications",
        "chat_rooms",
        "chat_messages",
        "seller_applications"
    ]
    
    for collection in required_collections:
        if collection not in collections:
            await db.create_collection(collection)
            print(f"Created collection: {collection}")

async def create_indexes():
    """Create necessary indexes for performance"""
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True, sparse=True)
    await db.users.create_index("role")
    
    # Products collection indexes
    await db.products.create_index("seller_id")
    await db.products.create_index("category")
    await db.products.create_index([("title", TEXT), ("description", TEXT), ("tags", TEXT)])
    
    # Orders collection indexes
    await db.orders.create_index("user_id")
    await db.orders.create_index("status")
    await db.orders.create_index([("created_at", ASCENDING)])
    
    # Notifications collection indexes
    await db.notifications.create_index("user_id")
    await db.notifications.create_index([("created_at", ASCENDING)])
    
    # Chat indexes
    await db.chat_rooms.create_index("participants")
    await db.chat_messages.create_index("room_id")
    await db.chat_messages.create_index([("timestamp", ASCENDING)])
    
    # Seller applications indexes
    await db.seller_applications.create_index("user_id", unique=True)
    await db.seller_applications.create_index("status")
    
    print("Created all required indexes")

async def create_default_superadmin():
    """Create a default superadmin account if it doesn't exist"""
    superadmin = await db.users.find_one({"role": "superadmin"})
    
    if not superadmin:
        # Hash the password
        password = "admin123"
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        # Create superadmin user
        superadmin_data = {
            "email": "superadmin@example.com",
            "password": hashed_password.decode('utf-8'),
            "full_name": "Super Admin",
            "role": "superadmin",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.users.insert_one(superadmin_data)
        print("Created default superadmin account:")
        print("Email: superadmin@example.com")
        print("Password: admin123")
    else:
        print("Superadmin account already exists")

async def run_migration():
    """Run the full migration process"""
    print("Starting database migration...")
    
    await create_collections()
    await create_indexes()
    await create_default_superadmin()
    
    print("Database migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())

