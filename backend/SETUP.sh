#!/bin/bash

# Inventory Reservation System - Setup Script
# This script sets up and starts the entire system

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
        docker --version
    else
        print_error "Docker is not installed"
        echo "Please install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if command -v docker compose &> /dev/null; then
        print_success "Docker Compose is installed"
        docker compose version
    else
        print_error "Docker Compose is not installed"
        echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo ""
}

# Setup environment
setup_environment() {
    print_header "Setting Up Environment"
    
    if [ ! -f "backend/.env" ]; then
        print_info "Creating .env file from .env.example"
        cp backend/.env.example backend/.env
        
        # Generate a random secret key
        SECRET_KEY=$(openssl rand -hex 32)
        
        # Update .env with generated secret key (works on both Linux and macOS)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/your-secret-key-change-in-production-please-use-strong-key-min-32-chars/$SECRET_KEY/" backend/.env
        else
            # Linux
            sed -i "s/your-secret-key-change-in-production-please-use-strong-key-min-32-chars/$SECRET_KEY/" backend/.env
        fi
        
        print_success "Created .env file with generated secret key"
    else
        print_info ".env file already exists"
    fi
    
    echo ""
}

# Build and start services
start_services() {
    print_header "Building and Starting Services"
    
    print_info "This may take a few minutes on first run..."
    docker compose up -d --build
    
    print_success "Services started"
    echo ""
}

# Wait for services to be ready
wait_for_services() {
    print_header "Waiting for Services to be Ready"
    
    print_info "Waiting for PostgreSQL..."
    sleep 5
    
    MAX_TRIES=30
    TRIES=0
    
    while [ $TRIES -lt $MAX_TRIES ]; do
        if docker compose exec -T postgres pg_isready -U postgres &> /dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi
        TRIES=$((TRIES+1))
        sleep 1
    done
    
    if [ $TRIES -eq $MAX_TRIES ]; then
        print_error "PostgreSQL failed to start"
        exit 1
    fi
    
    print_info "Waiting for Redis..."
    sleep 2
    
    if docker compose exec -T redis redis-cli ping &> /dev/null; then
        print_success "Redis is ready"
    else
        print_error "Redis failed to start"
        exit 1
    fi
    
    print_info "Waiting for API to be ready..."
    sleep 5
    
    TRIES=0
    while [ $TRIES -lt $MAX_TRIES ]; do
        if curl -s http://localhost:8000/health &> /dev/null; then
            print_success "API is ready"
            break
        fi
        TRIES=$((TRIES+1))
        sleep 1
    done
    
    if [ $TRIES -eq $MAX_TRIES ]; then
        print_error "API failed to start"
        exit 1
    fi
    
    echo ""
}

# Seed database
seed_database() {
    print_header "Seeding Database"
    
    print_info "Creating test users and products..."
    docker compose exec -T api python scripts/seed_data.py
    
    print_success "Database seeded successfully"
    echo ""
}

# Run tests
run_tests() {
    print_header "Running Integration Tests"
    
    print_info "This will verify the system is working correctly..."
    docker compose exec -T api python scripts/test_system.py
    
    echo ""
}

# Print summary
print_summary() {
    print_header "Setup Complete!"
    
    echo -e "${GREEN}✓ All services are running${NC}"
    echo ""
    echo "Access the system:"
    echo "  • API:              http://localhost:8000"
    echo "  • API Docs:         http://localhost:8000/docs"
    echo "  • Health Check:     http://localhost:8000/health"
    echo "  • RabbitMQ UI:      http://localhost:15672 (guest/guest)"
    echo ""
    echo "Test Credentials:"
    echo "  • Admin:  admin@example.com / admin123"
    echo "  • User:   user@example.com / user123"
    echo ""
    echo "Useful Commands:"
    echo "  • View logs:        docker compose logs -f"
    echo "  • Stop services:    docker compose down"
    echo "  • Restart:          docker compose restart"
    echo "  • Run tests:        docker compose exec api python scripts/test_system.py"
    echo ""
    echo "Documentation:"
    echo "  • Quick Start:      QUICKSTART.md"
    echo "  • API Examples:     API_EXAMPLES.md"
    echo "  • Full Docs:        INDEX.md"
    echo ""
    echo -e "${BLUE}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    clear
    
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════╗"
    echo "║  Inventory Reservation System - Setup     ║"
    echo "║  FastAPI + PostgreSQL + Redis + RabbitMQ  ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    check_prerequisites
    setup_environment
    start_services
    wait_for_services
    seed_database
    
    # Ask if user wants to run tests
    echo -e "${YELLOW}Would you like to run integration tests? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        run_tests
    fi
    
    print_summary
}

# Run main function
main
