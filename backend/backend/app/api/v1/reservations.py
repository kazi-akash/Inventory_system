"""Reservation endpoints"""

from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.redis import get_redis, RedisClient
from app.services.reservation import ReservationService
from app.schemas.reservation import (
    ReservationCreate, 
    ReservationResponse, 
    ReservationListResponse,
    ReservationWithDetails
)
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    reservation_data: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new reservation
    
    Reserves inventory for 5 minutes. If checkout is not completed,
    the reservation will expire and inventory will be restored.
    """
    reservation_service = ReservationService(db, redis)
    return await reservation_service.create_reservation(current_user.id, reservation_data)


@router.get("", response_model=ReservationListResponse)
async def list_user_reservations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """Get all reservations for current user"""
    reservation_service = ReservationService(db, redis)
    reservations = await reservation_service.get_user_reservations(
        current_user.id,
        skip=skip,
        limit=limit
    )
    return ReservationListResponse(reservations=reservations, total=len(reservations))


@router.get("/{reservation_id}", response_model=ReservationWithDetails)
async def get_reservation(
    reservation_id: UUID,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_user)
):
    """Get reservation details with product and user information"""
    reservation_service = ReservationService(db, redis)
    return await reservation_service.get_reservation(reservation_id, current_user.id)
