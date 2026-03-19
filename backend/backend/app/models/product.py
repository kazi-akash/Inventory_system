"""Product model"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Boolean, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Product(Base):
    """Product model with inventory tracking and e-commerce details"""
    
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(500), nullable=True)
    short_description = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    total_inventory = Column(Integer, nullable=False)
    available_inventory = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    discount_percentage = Column(Numeric(5, 2), nullable=True)
    version = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    reservations = relationship("Reservation", back_populates="product")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('available_inventory >= 0', name='check_available_inventory'),
        CheckConstraint('total_inventory >= available_inventory', name='check_total_inventory'),
        CheckConstraint('discount_percentage >= 0 AND discount_percentage <= 100', name='check_discount_percentage'),
    )
    
    def __repr__(self):
        return f"<Product {self.name} (available: {self.available_inventory}/{self.total_inventory})>"
