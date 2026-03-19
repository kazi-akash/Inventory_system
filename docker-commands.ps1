# Docker Management Script for Inventory System (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    [string]$Service
)

switch ($Command) {
    "start" {
        Write-Host "Starting all services in production mode..." -ForegroundColor Green
        docker-compose up -d
    }
    
    "start-dev" {
        Write-Host "Starting all services in development mode..." -ForegroundColor Green
        docker-compose -f docker-compose.dev.yml up -d
    }
    
    "stop" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        docker-compose down
    }
    
    "restart" {
        Write-Host "Restarting all services..." -ForegroundColor Yellow
        docker-compose restart
    }
    
    "build" {
        Write-Host "Building all services..." -ForegroundColor Green
        docker-compose build --no-cache
    }
    
    "logs" {
        if ($Service) {
            docker-compose logs -f $Service
        } else {
            docker-compose logs -f
        }
    }
    
    "clean" {
        Write-Host "Cleaning up containers, volumes, and images..." -ForegroundColor Red
        docker-compose down -v --rmi all
    }
    
    "reset" {
        Write-Host "Resetting database and rebuilding..." -ForegroundColor Yellow
        docker-compose down -v
        docker-compose up --build -d
    }
    
    "status" {
        Write-Host "Service status:" -ForegroundColor Cyan
        docker-compose ps
    }
    
    "shell-frontend" {
        docker-compose exec frontend sh
    }
    
    "shell-backend" {
        docker-compose exec api sh
    }
    
    default {
        Write-Host "Usage: .\docker-commands.ps1 -Command <command> [-Service <service>]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  start          - Start all services (production)"
        Write-Host "  start-dev      - Start all services (development with hot-reload)"
        Write-Host "  stop           - Stop all services"
        Write-Host "  restart        - Restart all services"
        Write-Host "  build          - Rebuild all services"
        Write-Host "  logs           - View logs (use -Service for specific service)"
        Write-Host "  clean          - Remove all containers, volumes, and images"
        Write-Host "  reset          - Reset database and rebuild"
        Write-Host "  status         - Show service status"
        Write-Host "  shell-frontend - Open shell in frontend container"
        Write-Host "  shell-backend  - Open shell in backend container"
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Green
        Write-Host "  .\docker-commands.ps1 -Command start-dev"
        Write-Host "  .\docker-commands.ps1 -Command logs -Service frontend"
    }
}
