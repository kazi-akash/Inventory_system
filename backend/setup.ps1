# Inventory Reservation System - Windows Setup Script
# Run this script from PowerShell in the project root directory

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Header {
    param($Message)
    Write-Host ""
    Write-Host "================================" -ForegroundColor $Blue
    Write-Host $Message -ForegroundColor $Blue
    Write-Host "================================" -ForegroundColor $Blue
}

function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error-Message {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor $Yellow
}

# Main setup
Clear-Host

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor $Blue
Write-Host "║  Inventory Reservation System - Setup     ║" -ForegroundColor $Blue
Write-Host "║  FastAPI + PostgreSQL + Redis + RabbitMQ  ║" -ForegroundColor $Blue
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor $Blue
Write-Host ""

# Check prerequisites
Write-Header "Checking Prerequisites"

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Success "Docker is installed"
    Write-Host "  $dockerVersion" -ForegroundColor Gray
} catch {
    Write-Error-Message "Docker is not installed"
    Write-Host "Please install Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
try {
    $composeVersion = docker compose version
    Write-Success "Docker Compose is installed"
    Write-Host "  $composeVersion" -ForegroundColor Gray
} catch {
    Write-Error-Message "Docker Compose is not installed"
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Success "Docker Desktop is running"
} catch {
    Write-Error-Message "Docker Desktop is not running"
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

# Check current directory
Write-Header "Checking Directory"

if (Test-Path "docker-compose.yml") {
    Write-Success "Found docker-compose.yml"
} else {
    Write-Error-Message "docker-compose.yml not found"
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
    exit 1
}

# Setup environment
Write-Header "Setting Up Environment"

if (-not (Test-Path "backend\.env")) {
    Write-Info "Creating .env file from .env.example"
    Copy-Item "backend\.env.example" "backend\.env"
    
    # Generate random secret key
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secretKey = [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
    
    # Update .env file
    $envContent = Get-Content "backend\.env" -Raw
    $envContent = $envContent -replace "your-secret-key-change-in-production-please-use-strong-key-min-32-chars", $secretKey
    Set-Content "backend\.env" $envContent
    
    Write-Success "Created .env file with generated secret key"
} else {
    Write-Info ".env file already exists"
}

# Build and start services
Write-Header "Building and Starting Services"

Write-Info "This may take a few minutes on first run..."
Write-Host ""

docker compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Success "Services started successfully"
} else {
    Write-Error-Message "Failed to start services"
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    exit 1
}

# Wait for services
Write-Header "Waiting for Services to be Ready"

Write-Info "Waiting for PostgreSQL..."
Start-Sleep -Seconds 5

$maxTries = 30
$tries = 0

while ($tries -lt $maxTries) {
    try {
        docker compose exec -T postgres pg_isready -U postgres 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is ready"
            break
        }
    } catch {}
    $tries++
    Start-Sleep -Seconds 1
}

if ($tries -eq $maxTries) {
    Write-Error-Message "PostgreSQL failed to start"
    Write-Host "Check logs: docker compose logs postgres" -ForegroundColor Yellow
    exit 1
}

Write-Info "Waiting for Redis..."
Start-Sleep -Seconds 2

try {
    docker compose exec -T redis redis-cli ping 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Redis is ready"
    }
} catch {
    Write-Error-Message "Redis failed to start"
}

Write-Info "Waiting for API to be ready..."
Start-Sleep -Seconds 5

$tries = 0
while ($tries -lt $maxTries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "API is ready"
            break
        }
    } catch {}
    $tries++
    Start-Sleep -Seconds 1
}

if ($tries -eq $maxTries) {
    Write-Error-Message "API failed to start"
    Write-Host "Check logs: docker compose logs api" -ForegroundColor Yellow
    exit 1
}

# Seed database
Write-Header "Seeding Database"

Write-Info "Creating test users and products..."
docker compose exec -T api python scripts/seed_data.py

if ($LASTEXITCODE -eq 0) {
    Write-Success "Database seeded successfully"
} else {
    Write-Error-Message "Failed to seed database"
}

# Ask about tests
Write-Host ""
$response = Read-Host "Would you like to run integration tests? (y/n)"

if ($response -match "^[Yy]") {
    Write-Header "Running Integration Tests"
    Write-Info "This will verify the system is working correctly..."
    Write-Host ""
    docker compose exec -T api python scripts/test_system.py
}

# Print summary
Write-Header "Setup Complete!"

Write-Host ""
Write-Success "All services are running"
Write-Host ""
Write-Host "Access the system:" -ForegroundColor $Blue
Write-Host "  • API:              http://localhost:8000"
Write-Host "  • API Docs:         http://localhost:8000/docs"
Write-Host "  • Health Check:     http://localhost:8000/health"
Write-Host "  • RabbitMQ UI:      http://localhost:15672 (guest/guest)"
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor $Blue
Write-Host "  • Admin:  admin@example.com / admin123"
Write-Host "  • User:   user@example.com / user123"
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor $Blue
Write-Host "  • View logs:        docker compose logs -f"
Write-Host "  • Stop services:    docker compose down"
Write-Host "  • Restart:          docker compose restart"
Write-Host "  • Run tests:        docker compose exec api python scripts/test_system.py"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor $Blue
Write-Host "  • Docker Guide:     DOCKER_SETUP_GUIDE.md"
Write-Host "  • Quick Start:      QUICKSTART.md"
Write-Host "  • API Examples:     API_EXAMPLES.md"
Write-Host "  • Full Docs:        INDEX.md"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor $Blue
Write-Host ""
