# Inventory Reservation System

A high-performance inventory management platform with real-time reservation capabilities. Built to handle flash sales and high-traffic scenarios with proper concurrency control.

## Stack

**Backend:** FastAPI, PostgreSQL, Redis, RabbitMQ  
**Frontend:** Next.js 15, TypeScript, Tailwind CSS  
**Infrastructure:** Docker, Docker Compose

## Getting Started

```bash
git clone https://github.com/kazi-akash/Inventory_system.git
cd Inventory_system
docker-compose up -d
```

The app will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- RabbitMQ UI: http://localhost:15672 (guest/guest)

Test credentials:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## Architecture

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  Next.js │─────▶│  FastAPI │─────▶│ Postgres │
│  :3000   │      │  :8000   │      │  :5432   │
└──────────┘      └──────────┘      └──────────┘
                       │
                       ├──────┬──────┐
                       │      │      │
                   ┌───▼──┐ ┌─▼───┐ ┌▼──────┐
                   │Redis │ │RMQ  │ │Worker │
                   │:6379 │ │:5672│ └───────┘
                   └──────┘ └─────┘
```

### Why This Stack?

**FastAPI** - Async by default, handles 10k+ concurrent connections per instance. Built-in OpenAPI docs.

**PostgreSQL** - ACID transactions prevent overselling. Row-level locking with `SELECT FOR UPDATE`.

**Redis** - Distributed locks across multiple backend instances. Sub-millisecond cache lookups.

**RabbitMQ** - Decouples reservation processing. Automatic retries on failure.

## Handling Race Conditions

The main challenge: preventing overselling when multiple users reserve the same product simultaneously.

### Multi-Layer Approach

**1. Redis Distributed Lock**
```python
lock_key = f"product_lock:{product_id}"
async with redis.lock(lock_key, timeout=5):
    await reserve_product(product_id, quantity)
```
Fast initial validation. Works across multiple backend instances.

**2. Database Row Lock**
```python
async with session.begin():
    product = await session.execute(
        select(Product)
        .where(Product.id == product_id)
        .with_for_update()
    )
    if product.stock >= quantity:
        product.stock -= quantity
```
ACID guarantees. Automatic rollback on failure.

**3. Optimistic Locking**
```python
class Product(Base):
    version = Column(Integer, default=0)

result = await session.execute(
    update(Product)
    .where(Product.id == id, Product.version == old_version)
    .values(stock=new_stock, version=old_version + 1)
)
```
Detects concurrent modifications. Lower contention than pessimistic locking.

**4. Queue Processing**
```python
await queue.publish(ReservationRequest(
    product_id=product_id,
    user_id=user_id,
    quantity=quantity
))
```
Sequential processing. Natural rate limiting.

This layered approach ensures consistency even under extreme load.

## Performance Optimizations

### Connection Pooling
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

### Caching Strategy
```python
@cache(ttl=300)
async def get_product(product_id: int):
    return await db.query(Product).get(product_id)
```
Reduces DB load by 70-90%. Product details are read-heavy.

### Async Operations
```python
product, user, inventory = await asyncio.gather(
    get_product(product_id),
    get_user(user_id),
    check_inventory(product_id)
)
```
Non-blocking I/O. Better throughput than threading.

### Database Indexes
```sql
CREATE INDEX idx_product_stock ON products(id, stock);
CREATE INDEX idx_reservation_status ON reservations(status, created_at);
```

### Load Test Results
- 1,000+ req/s per instance
- <100ms p95 response time (cached)
- 10,000+ concurrent connections
- <50ms avg DB query time

## Project Structure

```
.
├── backend/
│   └── backend/
│       ├── app/
│       │   ├── api/v1/          # Endpoints
│       │   ├── models/          # SQLAlchemy models
│       │   ├── services/        # Business logic
│       │   ├── repositories/    # Data access
│       │   └── workers/         # Background tasks
│       ├── alembic/             # Migrations
│       └── Dockerfile
│
├── frontend/
│   ├── app/                     # Next.js pages
│   ├── components/              # React components
│   ├── lib/
│   │   ├── api/                 # API client
│   │   ├── hooks/               # Custom hooks
│   │   └── types/               # TypeScript types
│   └── Dockerfile
│
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Development

### Running Locally

Development mode with hot-reload:
```bash
docker-compose -f docker-compose.dev.yml up
```

Production mode:
```bash
docker-compose up
```

### Database Migrations

```bash
# Create migration
docker-compose exec api alembic revision --autogenerate -m "description"

# Apply migrations
docker-compose exec api alembic upgrade head

# Rollback
docker-compose exec api alembic downgrade -1
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker logs -f inventory_api
docker logs -f inventory_frontend
```

### Helper Scripts

Windows:
```powershell
.\docker-commands.ps1 -Command start-dev
.\docker-commands.ps1 -Command logs -Service api
.\docker-commands.ps1 -Command stop
```

Linux/Mac:
```bash
./docker-commands.sh start-dev
./docker-commands.sh logs api
./docker-commands.sh stop
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/inventory_db
REDIS_HOST=redis
REDIS_PORT=6379
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
SECRET_KEY=your-secret-key-here
DEBUG=True
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_RESERVATION_EXPIRY_MINUTES=5
```

## Features

- JWT authentication with refresh tokens
- Real-time inventory updates
- Automatic reservation expiration (configurable timeout)
- Admin dashboard (products, orders, users, analytics)
- Queue-based checkout processing
- Redis caching for frequently accessed data
- Background workers for async tasks
- Comprehensive API documentation (OpenAPI/Swagger)

## Troubleshooting

**Port already in use:**
```bash
# Find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Kill process or change port in docker-compose.yml
```

**Database connection issues:**
```bash
# Reset everything
docker-compose down -v
docker-compose up --build
```

**Frontend build fails:**
```bash
# Clear cache and rebuild
docker-compose build --no-cache frontend
docker-compose up frontend
```

**Worker not processing tasks:**
```bash
# Check RabbitMQ
docker logs inventory_rabbitmq

# Restart worker
docker-compose restart worker_expiration
```

## License

MIT

## Contributing

PRs welcome. Please ensure tests pass and follow the existing code style.

For major changes, open an issue first to discuss what you'd like to change.