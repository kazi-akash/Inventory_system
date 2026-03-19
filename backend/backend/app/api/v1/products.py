"""Product management endpoints"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import os
import uuid as uuid_lib
from pathlib import Path

from app.db.session import get_db
from app.db.redis import get_redis, RedisClient
from app.services.product import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.core.dependencies import get_current_admin_user, get_current_user
from app.models.user import User


router = APIRouter(prefix="/products", tags=["Products"])

# Configure upload directory
UPLOAD_DIR = Path("/app/uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload-image", status_code=status.HTTP_201_CREATED)
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload product image (Admin only)"""
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid_lib.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Return URL path
    image_url = f"/uploads/products/{unique_filename}"
    return {"image_url": image_url, "filename": unique_filename}


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new product (Admin only)"""
    product_service = ProductService(db, redis)
    return await product_service.create_product(product_data)


@router.get("", response_model=ProductListResponse)
async def list_products(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis)
):
    """List all products - PUBLIC endpoint (no authentication required)"""
    product_service = ProductService(db, redis)
    products = await product_service.list_products(skip=skip, limit=limit, active_only=active_only)
    total = await product_service.product_repo.count()
    return ProductListResponse(products=products, total=total)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis)
):
    """Get product details - PUBLIC endpoint (no authentication required)"""
    product_service = ProductService(db, redis)
    return await product_service.get_product(product_id)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_admin_user)
):
    """Update product (Admin only)"""
    product_service = ProductService(db, redis)
    return await product_service.update_product(product_id, product_data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    redis: RedisClient = Depends(get_redis),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete product (Admin only)"""
    product_service = ProductService(db, redis)
    await product_service.delete_product(product_id)
