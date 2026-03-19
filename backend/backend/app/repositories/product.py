"""Product repository"""

from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    """Repository for product operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Product, db)
    
    async def get_with_lock(self, product_id: UUID) -> Optional[Product]:
        """Get product with row-level lock (SELECT FOR UPDATE)"""
        result = await self.db.execute(
            select(Product)
            .where(Product.id == product_id)
            .with_for_update()
        )
        return result.scalar_one_or_none()
    
    async def decrease_inventory(self, product_id: UUID, quantity: int, expected_version: int) -> bool:
        """
        Decrease inventory with optimistic locking
        
        Returns:
            True if update successful, False if version mismatch
        """
        result = await self.db.execute(
            update(Product)
            .where(
                Product.id == product_id,
                Product.version == expected_version,
                Product.available_inventory >= quantity
            )
            .values(
                available_inventory=Product.available_inventory - quantity,
                version=Product.version + 1
            )
        )
        return result.rowcount > 0
    
    async def increase_inventory(self, product_id: UUID, quantity: int) -> bool:
        """
        Increase inventory (for reservation expiration)
        
        Returns:
            True if update successful
        """
        result = await self.db.execute(
            update(Product)
            .where(Product.id == product_id)
            .values(
                available_inventory=Product.available_inventory + quantity,
                version=Product.version + 1
            )
        )
        return result.rowcount > 0
    
    async def get_available_products(self, skip: int = 0, limit: int = 100) -> List[Product]:
        """Get products with available inventory"""
        result = await self.db.execute(
            select(Product)
            .where(Product.available_inventory > 0)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Product]:
        """Get all products with optional active filter"""
        query = select(Product)
        
        if active_only:
            query = query.where(Product.is_active == True)
        
        query = query.offset(skip).limit(limit).order_by(Product.created_at.desc())
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
