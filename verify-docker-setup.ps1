#!/usr/bin/env pwsh

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Docker Setup Verification Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$allChecksPass = $true

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml not found in current directory" -ForegroundColor Red
    $allChecksPass = $false
} else {
    Write-Host "✅ docker-compose.yml found" -ForegroundColor Green
}

# Check if backend directory exists
if (-not (Test-Path "backend/backend")) {
    Write-Host "❌ backend/backend directory not found" -ForegroundColor Red
    $allChecksPass = $false
} else {
    Write-Host "✅ backend/backend directory found" -ForegroundColor Green
}

# Check if frontend directory exists
if (-not (Test-Path "frontend")) {
    Write-Host "❌ frontend directory not found" -ForegroundColor Red
    $allChecksPass = $false
} else {
    Write-Host "✅ frontend directory found" -ForegroundColor Green
}

# Check if backend Dockerfile exists
if (-not (Test-Path "backend/backend/Dockerfile")) {
    Write-Host "❌ backend/backend/Dockerfile not found" -ForegroundColor Red
    $allChecksPass = $false
} else {
    Write-Host "✅ backend Dockerfile found" -ForegroundColor Green
}

# Check if frontend Dockerfile exists
if (-not (Test-Path "frontend/Dockerfile")) {
    Write-Host "❌ frontend/Dockerfile not found" -ForegroundColor Red
    $allChecksPass = $false
} else {
    Write-Host "✅ frontend Dockerfile found" -ForegroundColor Green
}

# Check if backend requirements.txt exists
if (-not (Test-Path "backend/backend/requirements.txt")) {
    Write-Host "❌ backend/backend/requirements.txt not found" -ForegroundColor Red
    $allChecksPass = $false
} else {
    Write-Host "✅ backend requirements.txt found" -ForegroundColor Green
}

# Check if frontend package.json exists
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "❌ frontend/package.json not found" -ForegroundColor Red
    $allChecksPass = $false
} else {
    Write-Host "✅ frontend package.json found" -ForegroundColor Green
}

Write-Host ""
if ($allChecksPass) {
    Write-Host "===================================" -ForegroundColor Green
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "===================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Cyan
    Write-Host "  docker-compose up --build" -ForegroundColor Yellow
    Write-Host ""
    exit 0
} else {
    Write-Host "===================================" -ForegroundColor Red
    Write-Host "❌ Some checks failed!" -ForegroundColor Red
    Write-Host "===================================" -ForegroundColor Red
    Write-Host ""
    exit 1
}
