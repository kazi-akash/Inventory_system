#!/bin/bash

echo "==================================="
echo "Docker Setup Verification Script"
echo "==================================="
echo ""

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found in current directory"
    exit 1
fi
echo "✅ docker-compose.yml found"

# Check if backend directory exists
if [ ! -d "backend/backend" ]; then
    echo "❌ backend/backend directory not found"
    exit 1
fi
echo "✅ backend/backend directory found"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ frontend directory not found"
    exit 1
fi
echo "✅ frontend directory found"

# Check if backend Dockerfile exists
if [ ! -f "backend/backend/Dockerfile" ]; then
    echo "❌ backend/backend/Dockerfile not found"
    exit 1
fi
echo "✅ backend Dockerfile found"

# Check if frontend Dockerfile exists
if [ ! -f "frontend/Dockerfile" ]; then
    echo "❌ frontend/Dockerfile not found"
    exit 1
fi
echo "✅ frontend Dockerfile found"

# Check if backend requirements.txt exists
if [ ! -f "backend/backend/requirements.txt" ]; then
    echo "❌ backend/backend/requirements.txt not found"
    exit 1
fi
echo "✅ backend requirements.txt found"

# Check if frontend package.json exists
if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json not found"
    exit 1
fi
echo "✅ frontend package.json found"

echo ""
echo "==================================="
echo "✅ All checks passed!"
echo "==================================="
echo ""
echo "You can now run:"
echo "  docker-compose up --build"
echo ""
