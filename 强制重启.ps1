# 一程风信 - 强制重启脚本
# 1. 杀掉所有 node 进程释放端口
# 2. 重新启动前后端

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Killing all Node processes..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# 杀掉所有 node.exe 进程
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Killing PID $($_.Id)..." -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# 等待进程完全退出
Start-Sleep -Seconds 2

# 再次确认没有残留进程
$remaining = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "[WARNING] Some node processes still alive, force killing..." -ForegroundColor Yellow
    $remaining | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "All node processes killed." -ForegroundColor Green
Write-Host ""

# 设置项目路径
$projectRoot = $PSScriptRoot
$clientRoot = Join-Path $projectRoot "client"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Yi Cheng Feng Xin" -ForegroundColor Cyan
Write-Host "  Project: $projectRoot" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 启动后端
Write-Host "[1/2] Starting backend..." -ForegroundColor Green
$backendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/k", "cd /d `"$projectRoot`" && node --import tsx server/src/index.ts" `
    -WorkingDirectory $projectRoot `
    -PassThru

Start-Sleep -Seconds 3

# 启动前端
Write-Host "[2/2] Starting frontend..." -ForegroundColor Green
$frontendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/k", "cd /d `"$clientRoot`" && npx vite --host --port 5173" `
    -WorkingDirectory $clientRoot `
    -PassThru

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers should be running!" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 打开浏览器
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press any key to exit (servers keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")