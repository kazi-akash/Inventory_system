"""Seed database with initial data"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import AsyncSessionLocal
from app.db.redis import redis_client
from app.models.user import User
from app.models.product import Product
from app.core.security import get_password_hash


async def seed_database():
    """Seed database with initial data"""
    print("Starting database seeding...")
    
    async with AsyncSessionLocal() as db:
        try:
            # Check if data already exists
            from sqlalchemy import select
            result = await db.execute(select(User).limit(1))
            if result.scalar_one_or_none():
                print("⚠ Database already seeded, skipping...")
                return
            
            # Create admin user
            admin = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                is_admin=True
            )
            db.add(admin)
            print("✓ Created admin user (admin@example.com / admin123)")
            
            # Create regular user
            user = User(
                email="user@example.com",
                hashed_password=get_password_hash("user123"),
                full_name="Test User",
                is_admin=False
            )
            db.add(user)
            print("✓ Created test user (user@example.com / user123)")
            
            # Create sample products
            products = [
                Product(
                    name="iPhone 15 Pro",
                    price=999.99,
                    image_url="/uploads/seeder file images/iphone 15.webp",
                    short_description="Latest iPhone with A17 Pro chip and titanium design",
                    description="The iPhone 15 Pro features a stunning titanium design, powerful A17 Pro chip, advanced camera system with 48MP main camera, and Action button for quick access to your favorite features. Available in natural titanium, blue titanium, white titanium, and black titanium.",
                    total_inventory=100,
                    available_inventory=100,
                    is_active=True,
                    discount_percentage=15.00
                ),
                Product(
                    name="Samsung Galaxy S24",
                    price=899.99,
                    image_url="/uploads/seeder file images/s25.jpg",
                    short_description="AI-powered smartphone with stunning display",
                    description="Samsung Galaxy S24 brings Galaxy AI to your fingertips with advanced photo editing, real-time translation, and smart features. Features a 6.2-inch Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, and versatile triple camera system.",
                    total_inventory=50,
                    available_inventory=50,
                    is_active=True,
                    discount_percentage=10.00
                ),
                Product(
                    name="MacBook Pro M3",
                    price=1999.99,
                    image_url="/uploads/seeder file images/macbook pro.jpg",
                    short_description="Supercharged for pros with M3 chip",
                    description="The 14-inch MacBook Pro with M3 chip delivers exceptional performance and battery life. Features a stunning Liquid Retina XDR display, up to 22 hours of battery life, and a complete array of ports. Perfect for developers, designers, and content creators.",
                    total_inventory=30,
                    available_inventory=30,
                    is_active=True,
                    discount_percentage=20.00
                ),
                Product(
                    name="Sony WH-1000XM5",
                    price=399.99,
                    image_url="/uploads/seeder file images/headphone.jpg",
                    short_description="Industry-leading noise canceling headphones",
                    description="Sony WH-1000XM5 wireless headphones deliver premium sound quality with industry-leading noise cancellation. Features 30-hour battery life, multipoint connection, speak-to-chat technology, and exceptional comfort for all-day wear.",
                    total_inventory=200,
                    available_inventory=200,
                    is_active=True,
                    discount_percentage=25.00
                ),
                Product(
                    name="iPad Air",
                    price=599.99,
                    image_url="/uploads/seeder file images/ipad.jpg",
                    short_description="Powerful, colorful, and versatile",
                    description="iPad Air features the powerful M1 chip, stunning 10.9-inch Liquid Retina display, and works with Apple Pencil and Magic Keyboard. Available in space gray, starlight, pink, purple, and blue. Perfect for creativity, productivity, and entertainment.",
                    total_inventory=75,
                    available_inventory=75,
                    is_active=True,
                    discount_percentage=12.00
                ),
            ]
            
            for product in products:
                db.add(product)
            
            await db.commit()
            print(f"✓ Created {len(products)} sample products")
            
            # Sync inventory to Redis
            await redis_client.connect()
            for product in products:
                await redis_client.set(
                    f"inventory:{product.id}",
                    str(product.available_inventory)
                )
            await redis_client.disconnect()
            print("✓ Synced inventory to Redis")
            
            print("\n✅ Database seeding completed successfully!")
            print("\nTest Credentials:")
            print("  Admin: admin@example.com / admin123")
            print("  User:  user@example.com / user123")
            
        except Exception as e:
            print(f"\n❌ Error seeding database: {str(e)}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())
