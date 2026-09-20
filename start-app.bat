@echo off
title SA Grade 12 Accounting Vault
cd /d "%~dp0"

echo ==================================================
echo  Starting SA Grade 12 Accounting Vault...
echo ==================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is required. Download from https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    cd backend && call npm install && cd ..
    cd frontend && call npm install && cd ..
)

if not exist "frontend\dist\" (
    echo Building user interface...
    cd frontend && call npm run build && cd ..
)

if not exist "database.sqlite" (
    echo Seeding database...
    node backend/db/seed.js
)

start http://localhost:5001

node backend/index.js
pause
