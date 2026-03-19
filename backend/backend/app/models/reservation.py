"""Reservation model"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Reservation(Base):
    """Reservation model for inventory holds"""
    
    __tablename__ = "reservations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="reserved", index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="reservations")
    product = relationship("Product", back_populates="reservations")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('reserved', 'completed', 'expired')", name='check_status'),
        CheckConstraint('quantity > 0', name='check_quantity'),
    )
    
    def __repr__(self):
        return f"<Reservation {self.id} ({self.status})>"
