"""Reservation service with race condition prevention"""

from typing import List
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.reservation import ReservationRepository
from app.repositories.product import ProductRepository
from app.models.reservation import Reservation
from app.schemas.reservation import ReservationCreate
from app.db.redis import RedisClient
from app.core.config import settings


class ReservationService:
    """Service for reservation operations with concurrency control"""
    
    def __init__(self, db: AsyncSession, redis: RedisClient):
        self.db = db
        self.reservation_repo = ReservationRepository(db)
        self.product_repo = ProductRepository(db)
        self.redis = redis
    
    async def create_reservation(self, user_id: UUID, reservation_data: ReservationCreate) -> Reservation:
        """
        Create reservation with multi-layer race condition prevention
        
        Strategy:
        1. Redis atomic check (fast pre-validation)
        2. Database row-level lock (SELECT FOR UPDATE)
        3. Database constraint validation
        4. Optimistic locking with version field
        
        Args:
            user_id: User ID making the reservation
            reservation_data: Reservation details
            
        Returns:
            Created reservation
            
        Raises:
            HTTPException: If insufficient inventory or product not found
        """
        product_id = reservation_data.product_id
        quantity = reservation_data.quantity
        redis_key = f"inventory:{product_id}"
        
        # Layer 1: Redis atomic pre-check
        remaining = await self.redis.decrby(redis_key, quantity)
        
        if remaining < 0:
            # Rollback Redis
            await self.redis.incrby(redis_key, quantity)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient inventory available"
            )
        
        try:
            # Layer 2: Database transaction with row-level lock
            async with self.db.begin_nested():
                # Lock product row
                product = await self.product_repo.get_with_lock(product_id)
                
                if not product:
                    await self.redis.incrby(redis_key, quantity)
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Product not found"
                    )
                
                # Layer 3: Verify inventory availability
                if product.available_inventory < quantity:
                    await self.redis.incrby(redis_key, quantity)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient inventory. Available: {product.available_inventory}, Requested: {quantity}"
                    )
                
                # Layer 4: Optimistic locking - decrease inventory
                success = await self.product_repo.decrease_inventory(
                    product_id=product_id,
                    quantity=quantity,
                    expected_version=product.version
                )
                
                if not success:
                    await self.redis.incrby(redis_key, quantity)
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Inventory was modified by another transaction. Please retry."
                    )
                
                # Create reservation
                expires_at = datetime.utcnow() + timedelta(minutes=settings.RESERVATION_EXPIRY_MINUTES)
                reservation = await self.reservation_repo.create_reservation(
                    user_id=user_id,
                    product_id=product_id,
                    quantity=quantity,
                    expires_at=expires_at
                )
            
            await self.db.commit()
            return reservation
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            # Rollback Redis on any error
            await self.redis.incrby(redis_key, quantity)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create reservation: {str(e)}"
            )
    
    async def get_user_reservations(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Reservation]:
        """Get all reservations for a user"""
        return await self.reservation_repo.get_by_user(user_id, skip=skip, limit=limit)
    
    async def get_reservation(self, reservation_id: UUID, user_id: UUID) -> Reservation:
        """
        Get reservation by ID with full details (product and user)
        
        Args:
            reservation_id: Reservation ID
            user_id: User ID (for authorization)
            
        Returns:
            Reservation with product and user details
            
        Raises:
            HTTPException: If not found or unauthorized
        """
        reservation = await self.reservation_repo.get_by_id_with_details(reservation_id)
        
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reservation not found"
            )
        
        if reservation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this reservation"
            )
        
        return reservation
    
    async def checkout_reservation(self, reservation_id: UUID, user_id: UUID) -> Reservation:
        """
        Complete checkout for a reservation
        
        Args:
            reservation_id: Reservation ID
            user_id: User ID (for authorization)
            
        Returns:
            Completed reservation
            
        Raises:
            HTTPException: If reservation invalid or expired
        """
        reservation = await self.reservation_repo.get_by_id(reservation_id)
        
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reservation not found"
            )
        
        if reservation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to checkout this reservation"
            )
        
        if reservation.status != "reserved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Reservation cannot be checked out. Current status: {reservation.status}"
            )
        
        if reservation.expires_at <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reservation has expired"
            )
        
        # Mark as completed
        reservation.status = "completed"
        reservation.completed_at = datetime.utcnow()
        
        await self.reservation_repo.update(reservation)
        await self.db.commit()
        
        return reservation
    
    async def expire_reservations(self) -> int:
        """
        Expire old reservations and restore inventory
        Called by background worker
        
        Returns:
            Number of reservations expired
        """
        expired_reservations = await self.reservation_repo.get_expired_reservations(limit=100)
        count = 0
        
        for reservation in expired_reservations:
            try:
                async with self.db.begin_nested():
                    # Lock product row
                    product = await self.product_repo.get_with_lock(reservation.product_id)
                    
                    if product:
                        # Restore inventory
                        await self.product_repo.increase_inventory(
                            product_id=reservation.product_id,
                            quantity=reservation.quantity
                        )
                        
                        # Update Redis counter
                        redis_key = f"inventory:{reservation.product_id}"
                        await self.redis.incrby(redis_key, reservation.quantity)
                    
                    # Mark reservation as expired
                    reservation.status = "expired"
                    await self.reservation_repo.update(reservation)
                
                count += 1
                
            except Exception as e:
                # Log error but continue processing other reservations
                print(f"Error expiring reservation {reservation.id}: {str(e)}")
                continue
        
        if count > 0:
            await self.db.commit()
        
        return count
