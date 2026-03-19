"""Admin endpoints for system management and analytics"""

from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, case

from app.db.session import get_db
from app.db.redis import get_redis, RedisClient
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.models.reservation import Reservation
from app.models.product import Product
from app.schemas.reservation import ReservationWithDetails
from app.repositories.reservation import ReservationRepository
from app.repositories.product import ProductRepository
from app.repositories.user import UserRepository
from pydantic import BaseModel
from decimal import Decimal


router = APIRouter(prefix="/admin", tags=["Admin"])


class ReservationListResponse(BaseModel):
    """Admin reservation list with user and product details"""
    reservations: list[ReservationWithDetails]
    total: int
    page: int
    page_size: int


class UserStats(BaseModel):
    """User statistics"""
    id: UUID
    email: str
    full_name: Optional[str]
    total_reservations: int
    completed_reservations: int
    expired_reservations: int
    total_spent: Decimal
    created_at: datetime


class ProductStats(BaseModel):
    """Product statistics"""
    id: UUID
    name: str
    price: Decimal
    image_url: Optional[str]
    total_inventory: int
    available_inventory: int
    total_reservations: int
    completed_sales: int
    revenue: Decimal
    is_active: bool


class SystemStats(BaseModel):
    """Overall system statistics"""
    total_users: int
    total_products: int
    active_products: int
    total_reservations: int
    active_reservations: int
    completed_reservations: int
    expired_reservations: int
    total_revenue: Decimal
    revenue_today: Decimal
    revenue_this_week: Decimal
    revenue_this_month: Decimal
    top_selling_products: list[dict]
    recent_activity: dict


@router.get("/reservations", response_model=ReservationListResponse)
async def list_all_reservations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None, regex="^(reserved|completed|expired)$"),
    user_id: Optional[UUID] = None,
    product_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all reservations with filters (Admin only)
    
    Filters:
    - status: Filter by reservation status
    - user_id: Filter by specific user
    - product_id: Filter by specific product
    """
    from sqlalchemy.orm import joinedload
    
    # Build query
    query = select(Reservation).options(
        joinedload(Reservation.product),
        joinedload(Reservation.user)
    )
    
    # Apply filters
    filters = []
    if status:
        filters.append(Reservation.status == status)
    if user_id:
        filters.append(Reservation.user_id == user_id)
    if product_id:
        filters.append(Reservation.product_id == product_id)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Get total count
    count_query = select(func.count()).select_from(Reservation)
    if filters:
        count_query = count_query.where(and_(*filters))
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get paginated results
    query = query.order_by(Reservation.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    reservations = result.unique().scalars().all()
    
    return ReservationListResponse(
        reservations=reservations,
        total=total,
        page=skip // limit + 1,
        page_size=limit
    )


@router.get("/users/stats")
async def get_user_statistics(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get user statistics with reservation and spending data (Admin only)"""
    
    # Query users with their reservation stats
    query = select(
        User.id,
        User.email,
        User.full_name,
        User.created_at,
        func.count(Reservation.id).label('total_reservations'),
        func.sum(
            case(
                (Reservation.status == 'completed', 1),
                else_=0
            )
        ).label('completed_reservations'),
        func.sum(
            case(
                (Reservation.status == 'expired', 1),
                else_=0
            )
        ).label('expired_reservations'),
        func.coalesce(
            func.sum(
                case(
                    (Reservation.status == 'completed', Product.price * Reservation.quantity),
                    else_=0
                )
            ),
            0
        ).label('total_spent')
    ).select_from(User).outerjoin(
        Reservation, User.id == Reservation.user_id
    ).outerjoin(
        Product, Reservation.product_id == Product.id
    ).where(
        User.is_admin == False
    ).group_by(
        User.id, User.email, User.full_name, User.created_at
    ).order_by(
        func.coalesce(
            func.sum(
                case(
                    (Reservation.status == 'completed', Product.price * Reservation.quantity),
                    else_=0
                )
            ),
            0
        ).desc()
    ).offset(skip).limit(limit)
    
    result = await db.execute(query)
    users = result.all()
    
    user_stats = [
        UserStats(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            total_reservations=user.total_reservations or 0,
            completed_reservations=user.completed_reservations or 0,
            expired_reservations=user.expired_reservations or 0,
            total_spent=Decimal(str(user.total_spent or 0)),
            created_at=user.created_at
        )
        for user in users
    ]
    
    return {"users": user_stats, "total": len(user_stats)}


@router.get("/products/stats")
async def get_product_statistics(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get product statistics with sales data (Admin only)"""
    
    # Query products with their reservation stats
    query = select(
        Product.id,
        Product.name,
        Product.price,
        Product.image_url,
        Product.total_inventory,
        Product.available_inventory,
        Product.is_active,
        func.count(Reservation.id).label('total_reservations'),
        func.sum(
            case(
                (Reservation.status == 'completed', Reservation.quantity),
                else_=0
            )
        ).label('completed_sales'),
        func.coalesce(
            func.sum(
                case(
                    (Reservation.status == 'completed', Product.price * Reservation.quantity),
                    else_=0
                )
            ),
            0
        ).label('revenue')
    ).select_from(Product).outerjoin(
        Reservation, Product.id == Reservation.product_id
    ).group_by(
        Product.id, Product.name, Product.price, Product.image_url,
        Product.total_inventory, Product.available_inventory, Product.is_active
    ).order_by(
        func.coalesce(
            func.sum(
                case(
                    (Reservation.status == 'completed', Product.price * Reservation.quantity),
                    else_=0
                )
            ),
            0
        ).desc()
    ).offset(skip).limit(limit)
    
    result = await db.execute(query)
    products = result.all()
    
    product_stats = [
        ProductStats(
            id=product.id,
            name=product.name,
            price=product.price,
            image_url=product.image_url,
            total_inventory=product.total_inventory,
            available_inventory=product.available_inventory,
            total_reservations=product.total_reservations or 0,
            completed_sales=product.completed_sales or 0,
            revenue=Decimal(str(product.revenue or 0)),
            is_active=product.is_active
        )
        for product in products
    ]
    
    return {"products": product_stats, "total": len(product_stats)}


@router.get("/stats/overview", response_model=SystemStats)
async def get_system_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get overall system statistics and analytics (Admin only)"""
    
    # Total users (non-admin)
    user_count = await db.execute(
        select(func.count()).select_from(User).where(User.is_admin == False)
    )
    total_users = user_count.scalar()
    
    # Total products
    product_count = await db.execute(select(func.count()).select_from(Product))
    total_products = product_count.scalar()
    
    # Active products
    active_product_count = await db.execute(
        select(func.count()).select_from(Product).where(Product.is_active == True)
    )
    active_products = active_product_count.scalar()
    
    # Reservation statistics
    reservation_stats = await db.execute(
        select(
            func.count(Reservation.id).label('total'),
            func.sum(case((Reservation.status == 'reserved', 1), else_=0)).label('active'),
            func.sum(case((Reservation.status == 'completed', 1), else_=0)).label('completed'),
            func.sum(case((Reservation.status == 'expired', 1), else_=0)).label('expired')
        ).select_from(Reservation)
    )
    res_stats = reservation_stats.first()
    
    # Revenue calculations
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=now.weekday())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Total revenue
    total_revenue_query = await db.execute(
        select(
            func.coalesce(
                func.sum(Product.price * Reservation.quantity),
                0
            )
        ).select_from(Reservation).join(
            Product, Reservation.product_id == Product.id
        ).where(Reservation.status == 'completed')
    )
    total_revenue = Decimal(str(total_revenue_query.scalar() or 0))
    
    # Today's revenue
    today_revenue_query = await db.execute(
        select(
            func.coalesce(
                func.sum(Product.price * Reservation.quantity),
                0
            )
        ).select_from(Reservation).join(
            Product, Reservation.product_id == Product.id
        ).where(
            and_(
                Reservation.status == 'completed',
                Reservation.completed_at >= today_start
            )
        )
    )
    revenue_today = Decimal(str(today_revenue_query.scalar() or 0))
    
    # This week's revenue
    week_revenue_query = await db.execute(
        select(
            func.coalesce(
                func.sum(Product.price * Reservation.quantity),
                0
            )
        ).select_from(Reservation).join(
            Product, Reservation.product_id == Product.id
        ).where(
            and_(
                Reservation.status == 'completed',
                Reservation.completed_at >= week_start
            )
        )
    )
    revenue_this_week = Decimal(str(week_revenue_query.scalar() or 0))
    
    # This month's revenue
    month_revenue_query = await db.execute(
        select(
            func.coalesce(
                func.sum(Product.price * Reservation.quantity),
                0
            )
        ).select_from(Reservation).join(
            Product, Reservation.product_id == Product.id
        ).where(
            and_(
                Reservation.status == 'completed',
                Reservation.completed_at >= month_start
            )
        )
    )
    revenue_this_month = Decimal(str(month_revenue_query.scalar() or 0))
    
    # Top selling products
    top_products_query = await db.execute(
        select(
            Product.name,
            Product.price,
            func.sum(Reservation.quantity).label('units_sold'),
            func.sum(Product.price * Reservation.quantity).label('revenue')
        ).select_from(Product).join(
            Reservation, Product.id == Reservation.product_id
        ).where(
            Reservation.status == 'completed'
        ).group_by(
            Product.id, Product.name, Product.price
        ).order_by(
            func.sum(Reservation.quantity).desc()
        ).limit(5)
    )
    top_products = [
        {
            "name": row.name,
            "price": float(row.price),
            "units_sold": row.units_sold,
            "revenue": float(row.revenue)
        }
        for row in top_products_query.all()
    ]
    
    # Recent activity (last 24 hours)
    yesterday = now - timedelta(days=1)
    recent_reservations = await db.execute(
        select(func.count()).select_from(Reservation).where(
            Reservation.created_at >= yesterday
        )
    )
    recent_completions = await db.execute(
        select(func.count()).select_from(Reservation).where(
            and_(
                Reservation.status == 'completed',
                Reservation.completed_at >= yesterday
            )
        )
    )
    
    recent_activity = {
        "new_reservations_24h": recent_reservations.scalar(),
        "completed_orders_24h": recent_completions.scalar()
    }
    
    return SystemStats(
        total_users=total_users,
        total_products=total_products,
        active_products=active_products,
        total_reservations=res_stats.total or 0,
        active_reservations=res_stats.active or 0,
        completed_reservations=res_stats.completed or 0,
        expired_reservations=res_stats.expired or 0,
        total_revenue=total_revenue,
        revenue_today=revenue_today,
        revenue_this_week=revenue_this_week,
        revenue_this_month=revenue_this_month,
        top_selling_products=top_products,
        recent_activity=recent_activity
    )


@router.get("/reservations/recent")
async def get_recent_reservations(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get most recent reservations across all users (Admin only)"""
    from sqlalchemy.orm import joinedload
    
    query = select(Reservation).options(
        joinedload(Reservation.product),
        joinedload(Reservation.user)
    ).order_by(Reservation.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    reservations = result.unique().scalars().all()
    
    return {"reservations": reservations, "total": len(reservations)}


@router.get("/orders/recent")
async def get_recent_orders(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get most recent completed orders (Admin only)"""
    from sqlalchemy.orm import joinedload
    
    query = select(Reservation).options(
        joinedload(Reservation.product),
        joinedload(Reservation.user)
    ).where(
        Reservation.status == 'completed'
    ).order_by(Reservation.completed_at.desc()).limit(limit)
    
    result = await db.execute(query)
    orders = result.unique().scalars().all()
    
    return {"orders": orders, "total": len(orders)}
