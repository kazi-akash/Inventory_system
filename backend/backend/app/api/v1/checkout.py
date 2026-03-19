"""Checkout endpoints"""

from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.redis import get_redis, RedisClient
from app.services.reservation import ReservationService
from app.schemas.reservation import CheckoutResponse
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/checkout", tags=["Checkout"])


@router.post("/{reservation_id}", response_model=CheckoutResponse)
async def checkout_reservation(
    reservation_id: UUID,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Complete checkout for a reservation
    
    Marks the reservation as completed and finalizes the inventory reduction.
    """
    reservation_service = ReservationService(db, redis)
    reservation = await reservation_service.checkout_reservation(reservation_id, current_user.id)
    
    return CheckoutResponse(
        reservation_id=reservation.id,
        status=reservation.status,
        message="Checkout completed successfully",
        completed_at=reservation.completed_at or datetime.utcnow()
    )
