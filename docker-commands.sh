#!/bin/bash

# Docker Management Script for Inventory System

case "$1" in
  start)
    echo "Starting all services in production mode..."
    docker-compose up -d
    ;;
  
  start-dev)
    echo "Starting all services in development mode..."
    docker-compose -f docker-compose.dev.yml up -d
    ;;
  
  stop)
    echo "Stopping all services..."
    docker-compose down
    ;;
  
  restart)
    echo "Restarting all services..."
    docker-compose restart
    ;;
  
  build)
    echo "Building all services..."
    docker-compose build --no-cache
    ;;
  
  logs)
    if [ -z "$2" ]; then
      docker-compose logs -f
    else
      docker-compose logs -f "$2"
    fi
    ;;
  
  clean)
    echo "Cleaning up containers, volumes, and images..."
    docker-compose down -v --rmi all
    ;;
  
  reset)
    echo "Resetting database and rebuilding..."
    docker-compose down -v
    docker-compose up --build -d
    ;;
  
  status)
    echo "Service status:"
    docker-compose ps
    ;;
  
  shell-frontend)
    docker-compose exec frontend sh
    ;;
  
  shell-backend)
    docker-compose exec api sh
    ;;
  
  *)
    echo "Usage: $0 {start|start-dev|stop|restart|build|logs|clean|reset|status|shell-frontend|shell-backend}"
    echo ""
    echo "Commands:"
    echo "  start          - Start all services (production)"
    echo "  start-dev      - Start all services (development with hot-reload)"
    echo "  stop           - Stop all services"
    echo "  restart        - Restart all services"
    echo "  build          - Rebuild all services"
    echo "  logs [service] - View logs (all or specific service)"
    echo "  clean          - Remove all containers, volumes, and images"
    echo "  reset          - Reset database and rebuild"
    echo "  status         - Show service status"
    echo "  shell-frontend - Open shell in frontend container"
    echo "  shell-backend  - Open shell in backend container"
    exit 1
    ;;
esac
