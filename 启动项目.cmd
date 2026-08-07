@echo off
rem ============================================
rem Yi Cheng Feng Xin - Dev Server Launcher
rem Pure ASCII content to avoid encoding issues
rem ============================================

setlocal

rem Get script directory (handles Chinese paths correctly via %~dp0)
set "ROOT=%~dp0"
set "CLIENT=%~dp0client"

rem Remove trailing backslash from ROOT for display
set "ROOT_DISPLAY=%ROOT:~0,-1%"

echo.
echo ========================================
echo   Starting Yi Cheng Feng Xin
echo ========================================
echo   Project: %ROOT_DISPLAY%
echo ========================================
echo.

rem Start backend
echo [1/2] Starting backend on port 3001...
start "YiChengFengXin-Backend" /D "%ROOT%" cmd /k "node --import tsx server/src/index.ts"

rem Wait for backend
timeout /t 3 /nobreak >nul

rem Start frontend
echo [2/2] Starting frontend on port 5173...
start "YiChengFengXin-Frontend" /D "%CLIENT%" cmd /k "npx vite --host --port 5173"

rem Wait for frontend
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Servers started!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo ========================================
echo.

rem Open browser
start http://localhost:5173

echo Browser opened. You can close this window.
echo Backend and frontend will keep running.
pause