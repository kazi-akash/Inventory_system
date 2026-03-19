# Real-Time Inventory Reservation System

A high-performance inventory reservation platform for flash sales, built with FastAPI, PostgreSQL, Redis, and RabbitMQ. Handles thousands of concurrent reservation requests while preventing race conditions and overselling.

## 🏗️ System Architecture

```
┌─────────────┐
│   Next.js   │  Frontend (separate repo)
│  Frontend   │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend (API)           │
│  - JWT Authentication                   │
│  - Product Management                   │
│  - Reservation API                      │
│  - Checkout API                         │
└────┬────────────────┬───────────────────┘
     │                │
     │                ▼
     │         ┌─────────────┐
     │         │   Redis     │
     │         │  - Cache    │
     │         │  - Locks    │
     │         │  - Counters │
     │         └─────────────┘
     │
     ▼
┌─────────────┐
│  RabbitMQ   │  (Optional - for queue-based processing)
│   Queue     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Background Worker Service          │
│  - Expire old reservations              │
│  - Restore inventory                    │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### Setup & Run

1. Clone the repository:
```bash
git clone <repository-url>
cd inventory-reservation-system
```

2. Start all services:
```bash
docker compose up
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- RabbitMQ (port 5672, management UI: 15672)
- FastAPI API server (port 8000)
- Background worker for expiration handling

3. Seed the database with test data:
```bash
docker compose exec api python scripts/seed_data.py
```

4. Access the API:
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- RabbitMQ Management: http://localhost:15672 (guest/guest)

### Test Credentials

After seeding:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Products (Admin only for create/update/delete)
- `POST /api/v1/products` - Create product
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/{id}` - Get product details
- `PUT /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product

### Reservations
- `POST /api/v1/reservations` - Create reservation (holds inventory for 5 minutes)
- `GET /api/v1/reservations` - List user's reservations
- `GET /api/v1/reservations/{id}` - Get reservation details

### Checkout
- `POST /api/v1/checkout/{reservation_id}` - Complete purchase

## 🔒 Race Condition Prevention Strategy

### Multi-Layer Protection

**Layer 1: Redis Atomic Operations**
- Uses Redis DECR for atomic inventory counter
- Fast pre-check before database operations
- Prevents most race conditions at cache level

**Layer 2: PostgreSQL Row-Level Locking**
```sql
SELECT * FROM products WHERE id = ? FOR UPDATE;
```
- Locks the product row during transaction
- Prevents concurrent modifications

**Layer 3: Database Constraints**
```sql
CHECK (available_inventory >= 0)
CHECK (total_inventory >= available_inventory)
```
- Database-level validation
- Last line of defense

**Layer 4: Optimistic Locking**
- Version field incremented on each update
- Detects concurrent modifications
- Automatic retry on conflict

### Reservation Algorithm

```python
1. Redis atomic check (DECRBY)
2. If insufficient → rollback Redis, return error
3. Database transaction with row lock
4. Verify inventory availability
5. Optimistic locking update with version check
6. Create reservation with 5-minute expiration
7. On any error → rollback Redis
```

## ⚡ High Traffic Handling Strategy

### Current Implementation: Direct Processing
- Immediate reservation processing
- Redis atomic operations for speed
- Database connection pooling
- Suitable for 1000+ concurrent users

### Optional: Queue-Based Processing
- RabbitMQ integration included
- Async worker processing
- Backpressure handling
- Horizontal scaling capability

### Performance Optimizations
- Redis caching for product data
- Database indexes on critical fields
- Connection pooling (10-50 connections)
- Async I/O throughout

## 🗄️ Database Schema

### Users
- id (UUID, PK)
- email (unique)
- hashed_password
- full_name
- is_admin
- created_at

### Products
- id (UUID, PK)
- name
- price
- total_inventory
- available_inventory
- version (for optimistic locking)
- created_at, updated_at

### Reservations
- id (UUID, PK)
- user_id (FK → users)
- product_id (FK → products)
- quantity
- status (reserved/completed/expired)
- expires_at
- created_at, completed_at

## 🔧 Development

### Local Development (without Docker)

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your local database credentials
```

3. Run migrations:
```bash
alembic upgrade head
```

4. Start the API:
```bash
uvicorn app.main:app --reload
```

5. Start the worker:
```bash
python -m app.workers.expiration_handler
```

### Running Tests

```bash
pytest
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### RabbitMQ Management UI
- URL: http://localhost:15672
- Credentials: guest/guest
- Monitor queue depth and message rates

### Redis Monitoring
```bash
docker compose exec redis redis-cli INFO
```

## 🔐 Security Features

- JWT authentication with short-lived tokens (15 minutes)
- Refresh tokens for extended sessions (7 days)
- Password hashing with bcrypt
- SQL injection prevention (parameterized queries)
- Admin role verification
- CORS configuration

## 📈 Scalability

### Horizontal Scaling
- API: Multiple instances behind load balancer
- Workers: Scale based on queue depth
- Database: Read replicas for product listing

### Performance Targets
- API response time: < 100ms (p95)
- Reservation processing: < 500ms
- Support: 1000+ concurrent users
- No overselling under concurrent load

## 📝 Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Config, security, dependencies
│   ├── db/              # Database session, Redis
│   ├── models/          # SQLAlchemy models
│   ├── repositories/    # Data access layer
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── workers/         # Background workers
├── alembic/             # Database migrations
├── scripts/             # Utility scripts
├── tests/               # Test suite
├── Dockerfile
└── requirements.txt
```

## 🤝 Contributing

See IMPLEMENTATION_PLAN.md and SYSTEM_DESIGN.md for detailed architecture and development guidelines.

## 📄 License

MIT License
