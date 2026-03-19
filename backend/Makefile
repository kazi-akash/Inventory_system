.PHONY: help build up down logs shell migrate seed test clean

help:
	@echo "Available commands:"
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - View logs"
	@echo "  make shell    - Open shell in API container"
	@echo "  make migrate  - Run database migrations"
	@echo "  make seed     - Seed database with test data"
	@echo "  make test     - Run tests"
	@echo "  make clean    - Remove containers and volumes"

build:
	docker compose build

up:
	docker compose up -d
	@echo "Services started. API available at http://localhost:8000"
	@echo "API docs at http://localhost:8000/docs"

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec api /bin/sh

migrate:
	docker compose exec api alembic upgrade head

seed:
	docker compose exec api python scripts/seed_data.py

test:
	docker compose exec api pytest

clean:
	docker compose down -v
	docker system prune -f
