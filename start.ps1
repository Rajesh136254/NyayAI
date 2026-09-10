# NYAYAI — Start All Services
# Run this script from the NYAYAI root directory

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  NYAYAI - Justice Intelligence Platform" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/2] Starting FastAPI Backend (port 8000)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\rajes\Desktop\NYAYAI\backend"
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[2/2] Starting Next.js Frontend (port 3000)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\rajes\Desktop\NYAYAI\frontend"
    npx next dev --port 3000
}

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Both servers are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Yellow
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Login credentials:" -ForegroundColor Cyan
Write-Host "  Superintendent : superintendent@karnataka.gov.in / nyayai@123"
Write-Host "  DLSA Lawyer    : lawyer@dlsa.karnataka.gov.in / nyayai@123"
Write-Host "  State Admin    : admin@slsa.karnataka.gov.in / nyayai@123"
Write-Host ""
Write-Host "  Press Ctrl+C to stop" -ForegroundColor Red
Write-Host "============================================" -ForegroundColor Cyan

# Keep alive
Wait-Job $backendJob, $frontendJob
