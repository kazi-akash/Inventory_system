"""Queue service for RabbitMQ operations"""

import json
from typing import Optional
import aio_pika
from aio_pika import Message, DeliveryMode
from aio_pika.abc import AbstractConnection, AbstractChannel, AbstractQueue

from app.core.config import settings


class QueueService:
    """Service for RabbitMQ queue operations"""
    
    def __init__(self):
        self.connection: Optional[AbstractConnection] = None
        self.channel: Optional[AbstractChannel] = None
        self.queue: Optional[AbstractQueue] = None
    
    async def connect(self):
        """Establish connection to RabbitMQ"""
        if not self.connection or self.connection.is_closed:
            self.connection = await aio_pika.connect_robust(settings.rabbitmq_url)
            self.channel = await self.connection.channel()
            
            # Declare queue
            self.queue = await self.channel.declare_queue(
                settings.RABBITMQ_QUEUE,
                durable=True
            )
    
    async def disconnect(self):
        """Close RabbitMQ connection"""
        if self.channel:
            await self.channel.close()
        if self.connection:
            await self.connection.close()
    
    async def publish_reservation(self, user_id: str, product_id: str, quantity: int):
        """
        Publish reservation request to queue
        
        Args:
            user_id: User ID
            product_id: Product ID
            quantity: Quantity to reserve
        """
        if not self.connection or self.connection.is_closed:
            await self.connect()
        
        message_body = {
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity
        }
        
        message = Message(
            body=json.dumps(message_body).encode(),
            delivery_mode=DeliveryMode.PERSISTENT
        )
        
        await self.channel.default_exchange.publish(
            message,
            routing_key=settings.RABBITMQ_QUEUE
        )
    
    async def consume_reservations(self, callback):
        """
        Consume reservation messages from queue
        
        Args:
            callback: Async function to process messages
        """
        if not self.connection or self.connection.is_closed:
            await self.connect()
        
        await self.queue.consume(callback)


# Global queue service instance
queue_service = QueueService()
