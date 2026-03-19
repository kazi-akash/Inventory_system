# Docker Setup Verification Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Docker Setup Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "1. Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker not found. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
Write-Host "2. Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   ✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
Write-Host "3. Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "   ✓ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker Compose not found." -ForegroundColor Red
    exit 1
}

# Check required files
Write-Host "4. Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "docker-compose.yml",
    "docker-compose.dev.yml",
    "frontend/Dockerfile",
    "frontend/Dockerfile.dev",
    "backend/Dockerfile"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "Some required files are missing!" -ForegroundColor Red
    exit 1
}

# Check ports availability
Write-Host "5. Checking port availability..." -ForegroundColor Yellow
$ports = @(3000, 8000, 5432, 6379, 5672, 15672)
$portsInUse = @()

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "   ⚠ Port $port is in use" -ForegroundColor Yellow
        $portsInUse += $port
    } else {
        Write-Host "   ✓ Port $port is available" -ForegroundColor Green
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host ""
    Write-Host "Warning: Some ports are in use. You may need to:" -ForegroundColor Yellow
    Write-Host "  - Stop services using these ports" -ForegroundColor Yellow
    Write-Host "  - Or modify ports in docker-compose.yml" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

if ($portsInUse.Count -eq 0) {
    Write-Host "✓ All checks passed! You're ready to start." -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the application:" -ForegroundColor Cyan
    Write-Host "  Development: .\docker-commands.ps1 -Command start-dev" -ForegroundColor White
    Write-Host "  Production:  .\docker-commands.ps1 -Command start" -ForegroundColor White
} else {
    Write-Host "⚠ Setup is ready but some ports are in use." -ForegroundColor Yellow
    Write-Host "  You can still proceed, but may encounter port conflicts." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Quick Start Guide: See QUICK_START.md" -ForegroundColor Cyan
Write-Host "Full Documentation: See DOCKER_SETUP.md" -ForegroundColor Cyan
