"""Reservation repository"""

from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.reservation import Reservation
from app.repositories.base import BaseRepository


class ReservationRepository(BaseRepository[Reservation]):
    """Repository for reservation operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Reservation, db)
    
    async def get_by_user(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Reservation]:
        """Get reservations by user ID with product info"""
        result = await self.db.execute(
            select(Reservation)
            .where(Reservation.user_id == user_id)
            .options(joinedload(Reservation.product))
            .order_by(Reservation.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.unique().scalars().all())
    
    async def get_by_id_with_details(self, reservation_id: UUID) -> Optional[Reservation]:
        """Get reservation by ID with product and user info"""
        result = await self.db.execute(
            select(Reservation)
            .where(Reservation.id == reservation_id)
            .options(
                joinedload(Reservation.product),
                joinedload(Reservation.user)
            )
        )
        return result.unique().scalar_one_or_none()
    
    async def get_expired_reservations(self, limit: int = 100) -> List[Reservation]:
        """Get expired reservations that need to be processed"""
        result = await self.db.execute(
            select(Reservation)
            .where(
                and_(
                    Reservation.status == "reserved",
                    Reservation.expires_at <= datetime.utcnow()
                )
            )
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def create_reservation(
        self,
        user_id: UUID,
        product_id: UUID,
        quantity: int,
        expires_at: datetime
    ) -> Reservation:
        """Create new reservation"""
        reservation = Reservation(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
            status="reserved",
            expires_at=expires_at
        )
        return await self.create(reservation)