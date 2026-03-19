"""Worker for processing reservation queue (optional - for queue-based approach)"""

import asyncio
import json
import signal
from datetime import datetime
from uuid import UUID

from aio_pika import IncomingMessage

from app.db.session import AsyncSessionLocal
from app.db.redis import redis_client
from app.services.queue import queue_service
from app.services.reservation import ReservationService
from app.schemas.reservation import ReservationCreate


class ReservationProcessor:
    """Background worker to process reservation requests from queue"""
    
    def __init__(self):
        self.running = False
    
    async def start(self):
        """Start the reservation processor"""
        self.running = True
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        print(f"[{datetime.utcnow()}] Reservation processor started")
        
        # Connect to services
        await redis_client.connect()
        await queue_service.connect()
        
        try:
            # Start consuming messages
            await queue_service.consume_reservations(self._process_message)
            
            # Keep running
            while self.running:
                await asyncio.sleep(1)
                
        finally:
            await queue_service.disconnect()
            await redis_client.disconnect()
            print(f"[{datetime.utcnow()}] Reservation processor stopped")
    
    async def _process_message(self, message: IncomingMessage):
        """Process a single reservation message"""
        async with message.process():
            try:
                # Parse message
                body = json.loads(message.body.decode())
                user_id = UUID(body["user_id"])
                product_id = UUID(body["product_id"])
                quantity = int(body["quantity"])
                
                # Create reservation
                async with AsyncSessionLocal() as db:
                    reservation_service = ReservationService(db, redis_client)
                    reservation_data = ReservationCreate(
                        product_id=product_id,
                        quantity=quantity
                    )
                    
                    reservation = await reservation_service.create_reservation(
                        user_id=user_id,
                        reservation_data=reservation_data
                    )
                    
                    print(f"[{datetime.utcnow()}] Created reservation {reservation.id} for user {user_id}")
                    
            except Exception as e:
                print(f"[{datetime.utcnow()}] Error processing reservation: {str(e)}")
                # Message will be requeued or sent to dead letter queue
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\n[{datetime.utcnow()}] Received signal {signum}, shutting down gracefully...")
        self.running = False


async def main():
    """Main entry point for reservation processor"""
    processor = ReservationProcessor()
    await processor.start()


if __name__ == "__main__":
    asyncio.run(main())
