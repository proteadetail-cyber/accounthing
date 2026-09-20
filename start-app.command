#!/bin/bash
cd "$(dirname "$0")"

echo "=================================================="
echo " Starting SA Grade 12 Accounting Vault..."
echo "=================================================="

# Check Node.js installation
if ! command -v node &> /null; then
    echo "Error: Node.js is required to run this application."
    echo "Please download and install Node.js from https://nodejs.org"
    read -p "Press Enter to exit..."
    exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "First time setup: Installing dependencies..."
    npm install
    (cd backend && npm install)
    (cd frontend && npm install)
fi

# Build frontend if needed
if [ ! -d "frontend/dist" ]; then
    echo "Building user interface..."
    (cd frontend && npm run build)
fi

# Seed database if missing
if [ ! -f "database.sqlite" ]; then
    echo "Seeding database..."
    node backend/db/seed.js
fi

# Automatically open web browser after 2 seconds
(sleep 2 && open "http://localhost:5001") &

echo "Launching application on http://localhost:5001..."
node backend/index.js
