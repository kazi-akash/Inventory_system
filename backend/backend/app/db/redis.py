"""Redis connection and utilities"""

from typing import Optional
import redis.asyncio as redis
from app.core.config import settings


class RedisClient:
    """Redis client wrapper for async operations"""
    
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
    
    async def connect(self):
        """Establish Redis connection"""
        self.redis = await redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True
        )
    
    async def disconnect(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()
    
    async def get(self, key: str) -> Optional[str]:
        """Get value by key"""
        if not self.redis:
            await self.connect()
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set key-value pair with optional expiration"""
        if not self.redis:
            await self.connect()
        return await self.redis.set(key, value, ex=ex)
    
    async def delete(self, key: str) -> int:
        """Delete key"""
        if not self.redis:
            await self.connect()
        return await self.redis.delete(key)
    
    async def incr(self, key: str) -> int:
        """Increment value atomically"""
        if not self.redis:
            await self.connect()
        return await self.redis.incr(key)
    
    async def decr(self, key: str) -> int:
        """Decrement value atomically"""
        if not self.redis:
            await self.connect()
        return await self.redis.decr(key)
    
    async def incrby(self, key: str, amount: int) -> int:
        """Increment value by amount atomically"""
        if not self.redis:
            await self.connect()
        return await self.redis.incrby(key, amount)
    
    async def decrby(self, key: str, amount: int) -> int:
        """Decrement value by amount atomically"""
        if not self.redis:
            await self.connect()
        return await self.redis.decrby(key, amount)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        if not self.redis:
            await self.connect()
        return await self.redis.exists(key) > 0
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration on key"""
        if not self.redis:
            await self.connect()
        return await self.redis.expire(key, seconds)


# Global Redis client instance
redis_client = RedisClient()


async def get_redis() -> RedisClient:
    """Dependency for getting Redis client"""
    if not redis_client.redis:
        await redis_client.connect()
    return redis_client
