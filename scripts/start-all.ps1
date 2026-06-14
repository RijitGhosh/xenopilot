# XenoPilot Startup Script
# Spawns each microservice in a separate persistent PowerShell window

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "       Launching XenoPilot Services      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Start Channel Service Simulator on Port 5001
Write-Host "[1/3] Starting Channel Service Simulator on http://localhost:5001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd channel-service; Write-Host 'Starting Channel Service Simulator...'; npm run dev"

# 2. Start Express API Backend on Port 5000
Write-Host "[2/3] Starting Backend API on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'Starting Express API Backend...'; npm run dev"

# 3. Start Next.js 15 Frontend on Port 3000
Write-Host "[3/3] Starting Next.js 15 Frontend on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host 'Starting Next.js Frontend...'; npm run dev"

Write-Host "=========================================" -ForegroundColor Green
Write-Host " All services started! Check new windows." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
