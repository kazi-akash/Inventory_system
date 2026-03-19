"""Reservation schemas"""

from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field


class ReservationCreate(BaseModel):
    """Schema for reservation creation"""
    product_id: UUID
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class ProductInfo(BaseModel):
    """Product information for reservation"""
    id: UUID
    name: str
    price: Decimal
    image_url: Optional[str] = None
    short_description: Optional[str] = None
    discount_percentage: Optional[Decimal] = None
    
    model_config = {"from_attributes": True}


class UserInfo(BaseModel):
    """User information for reservation"""
    id: UUID
    email: str
    full_name: Optional[str] = None
    
    model_config = {"from_attributes": True}


class ReservationResponse(BaseModel):
    """Schema for reservation response"""
    id: UUID
    user_id: UUID
    product_id: UUID
    quantity: int
    status: str
    expires_at: datetime
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class ReservationWithProduct(ReservationResponse):
    """Schema for reservation with product details"""
    product: ProductInfo


class ReservationWithDetails(ReservationResponse):
    """Schema for reservation with full details (product and user)"""
    product: ProductInfo
    user: UserInfo


class ReservationListResponse(BaseModel):
    """Schema for reservation list response"""
    reservations: list[ReservationWithProduct]
    total: int


class CheckoutResponse(BaseModel):
    """Schema for checkout response"""
    reservation_id: UUID
    status: str
    message: str
    completed_at: datetime
