"""Product schemas"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, HttpUrl


class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=1, max_length=255)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100, decimal_places=2)


class ProductCreate(ProductBase):
    """Schema for product creation"""
    image_url: Optional[str] = Field(None, max_length=500)
    total_inventory: int = Field(..., ge=0)
    available_inventory: int = Field(..., ge=0)
    is_active: bool = True
    
    def model_post_init(self, __context):
        """Validate that available_inventory <= total_inventory"""
        if self.available_inventory > self.total_inventory:
            raise ValueError("available_inventory cannot exceed total_inventory")


class ProductUpdate(BaseModel):
    """Schema for product update"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    image_url: Optional[str] = Field(None, max_length=500)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    total_inventory: Optional[int] = Field(None, ge=0)
    available_inventory: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    discount_percentage: Optional[Decimal] = Field(None, ge=0, le=100, decimal_places=2)


class ProductResponse(ProductBase):
    """Schema for product response"""
    id: UUID
    image_url: Optional[str] = None
    total_inventory: int
    available_inventory: int
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Schema for product list response"""
    products: list[ProductResponse]
    total: int
