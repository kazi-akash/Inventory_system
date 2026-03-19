"""Product service"""

from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.product import ProductRepository
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.db.redis import RedisClient


class ProductService:
    """Service for product operations"""
    
    def __init__(self, db: AsyncSession, redis: RedisClient):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.redis = redis
    
    async def create_product(self, product_data: ProductCreate) -> Product:
        """
        Create a new product
        
        Args:
            product_data: Product creation data
            
        Returns:
            Created product
        """
        product = Product(
            name=product_data.name,
            price=product_data.price,
            image_url=product_data.image_url,
            short_description=product_data.short_description,
            description=product_data.description,
            total_inventory=product_data.total_inventory,
            available_inventory=product_data.available_inventory,
            is_active=product_data.is_active,
            discount_percentage=product_data.discount_percentage
        )
        
        product = await self.product_repo.create(product)
        await self.db.commit()
        
        # Initialize Redis counter
        await self._sync_redis_inventory(product.id, product.available_inventory)
        
        return product
    
    async def get_product(self, product_id: UUID) -> Optional[Product]:
        """Get product by ID"""
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product
    
    async def list_products(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Product]:
        """List all products with pagination"""
        return await self.product_repo.get_all(skip=skip, limit=limit, active_only=active_only)
    
    async def update_product(self, product_id: UUID, product_data: ProductUpdate) -> Product:
        """
        Update product
        
        Args:
            product_id: Product ID
            product_data: Product update data
            
        Returns:
            Updated product
        """
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Update fields
        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product = await self.product_repo.update(product)
        await self.db.commit()
        
        # Sync Redis if inventory changed
        if "available_inventory" in update_data:
            await self._sync_redis_inventory(product.id, product.available_inventory)
        
        return product
    
    async def delete_product(self, product_id: UUID) -> None:
        """Delete product"""
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        await self.product_repo.delete(product)
        await self.db.commit()
        
        # Remove from Redis
        await self.redis.delete(f"inventory:{product_id}")
    
    async def get_available_inventory(self, product_id: UUID) -> int:
        """
        Get available inventory from Redis (fast check)
        Falls back to database if not in cache
        """
        redis_key = f"inventory:{product_id}"
        
        # Try Redis first
        inventory = await self.redis.get(redis_key)
        if inventory is not None:
            return int(inventory)
        
        # Fallback to database
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Sync to Redis
        await self._sync_redis_inventory(product_id, product.available_inventory)
        return product.available_inventory
    
    async def _sync_redis_inventory(self, product_id: UUID, inventory: int) -> None:
        """Synchronize inventory count to Redis"""
        redis_key = f"inventory:{product_id}"
        await self.redis.set(redis_key, str(inventory))
