@echo off
rem ============================================
rem Yi Cheng Feng Xin - Force Restart
rem Pure ASCII, single file, no external script
rem ============================================

echo.
echo ========================================
echo   Step 1: Kill all node.exe processes
echo ========================================

taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   All node processes killed.
) else (
    echo   No node processes found.
)

echo   Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Step 2: Start backend (port 3001)
echo ========================================

start "YiChengFengXin-Backend" /D "%~dp0" cmd /k "node --import tsx server/src/index.ts"

echo   Backend starting...
echo   Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   Step 3: Start frontend (port 5173)
echo ========================================

start "YiChengFengXin-Frontend" /D "%~dp0client" cmd /k "npx vite --host --port 5173"

echo   Frontend starting...
echo   Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Step 4: Open browser
echo ========================================

start http://localhost:5173

echo.
echo ========================================
echo   Done!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo ========================================
echo.
echo   Two CMD windows should be open:
echo   - YiChengFengXin-Backend
echo   - YiChengFengXin-Frontend
echo.
echo   You can close this window.
echo.
pause