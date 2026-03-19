# Inventory Reservation System

This is a simple full-stack inventory reservation system where users can reserve products for a limited time. The main goal was to handle concurrent reservations properly and keep the stock consistent even under load.

Backend is built with FastAPI, frontend with Next.js, and the system uses PostgreSQL, Redis, and RabbitMQ.

## Getting Started

### What you need
- Docker (Docker Desktop is fine)
- Git

### Run locally

```bash
git clone https://github.com/kazi-akash/Inventory_system.git
cd Inventory_system
docker-compose up -d
```

To check if everything is running:
```bash
docker-compose ps
```

### Access

- Frontend → http://localhost:3000
- Backend → http://localhost:8000
- API Docs → http://localhost:8000/docs
- RabbitMQ → http://localhost:15672 (guest/guest)

### Test Credentials

- Admin → `admin@example.com` / `admin123`
- User → `user@example.com` / `user123`

## System Overview

The system is split into a few main parts:

- **Frontend (Next.js)** → UI + API calls
- **Backend (FastAPI)** → handles logic + reservation
- **PostgreSQL** → main database
- **Redis** → caching + locking
- **RabbitMQ** → background jobs (like reservation expiry)
- **Worker** → processes async tasks

Basic flow:
```
User → Frontend → API → DB
                    ↓
                Redis / Queue
```

Nothing too complex, but enough to simulate a real-world system.

## Race Condition Handling

This part was important for the assignment.

**Problem:** If multiple users try to reserve the same product at the same time, stock can go negative or become inconsistent.

### What I did

I didn't rely on just one method. Used a combination:

#### 1. DB Row Lock (main protection)

When updating stock, I lock the row:

```python
SELECT ... FOR UPDATE
```

This ensures only one transaction updates stock at a time.

#### 2. Redis Lock (extra safety)

Before hitting DB, I also use a Redis lock per product:
- avoids multiple parallel requests from different instances
- lock auto-expires (so no deadlock)

#### 3. Background Queue

Reservations are also pushed to RabbitMQ for async handling (like expiry).

This helps avoid too many direct DB hits at once.

## High Traffic Handling

Didn't over-engineer, but covered the basics:

### 1. Async backend
FastAPI async endpoints → handles many requests without blocking

### 2. Redis caching
Used for:
- product data (read-heavy)
- temporary reservation info

### 3. Connection pooling
Database connections are reused instead of opening new ones each time.

### 4. Queue (RabbitMQ)
Heavy or delayed tasks are moved to background worker.

### 5. Can scale horizontally
Backend can be scaled with multiple instances if needed.

## Project Structure

```
.
├── backend/
├── frontend/
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

Nothing fancy, just kept it clean and separated.

## Tech Stack

**Backend**
- FastAPI
- PostgreSQL
- Redis
- RabbitMQ

**Frontend**
- Next.js
- TypeScript
- Tailwind CSS

## Setup Notes

If something doesn't work:

Try rebuilding:
```bash
docker-compose up --build
```

Reset everything:
```bash
docker-compose down -v
docker-compose up --build
```

## Final Note

This project was built as part of a technical assessment, so I focused more on:
- correctness
- handling concurrency
- clean structure

rather than adding too many extra features.