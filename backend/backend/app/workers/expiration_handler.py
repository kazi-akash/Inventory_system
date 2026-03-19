"""Worker for handling reservation expiration"""

import asyncio
import signal
import sys
from datetime import datetime

from app.db.session import AsyncSessionLocal
from app.db.redis import redis_client
from app.services.reservation import ReservationService


class ExpirationHandler:
    """Background worker to expire old reservations"""
    
    def __init__(self):
        self.running = False
        self.interval = 30  # Check every 30 seconds
    
    async def start(self):
        """Start the expiration handler"""
        self.running = True
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        print(f"[{datetime.utcnow()}] Expiration handler started")
        
        # Connect to Redis
        await redis_client.connect()
        
        try:
            while self.running:
                await self._process_expired_reservations()
                await asyncio.sleep(self.interval)
        finally:
            await redis_client.disconnect()
            print(f"[{datetime.utcnow()}] Expiration handler stopped")
    
    async def _process_expired_reservations(self):
        """Process expired reservations"""
        try:
            async with AsyncSessionLocal() as db:
                reservation_service = ReservationService(db, redis_client)
                count = await reservation_service.expire_reservations()
                
                if count > 0:
                    print(f"[{datetime.utcnow()}] Expired {count} reservations and restored inventory")
                    
        except Exception as e:
            print(f"[{datetime.utcnow()}] Error processing expired reservations: {str(e)}")
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\n[{datetime.utcnow()}] Received signal {signum}, shutting down gracefully...")
        self.running = False


async def main():
    """Main entry point for expiration handler"""
    handler = ExpirationHandler()
    await handler.start()


if __name__ == "__main__":
    asyncio.run(main())
