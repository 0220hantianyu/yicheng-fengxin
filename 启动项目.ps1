# 一程风信 - 启动脚本 (PowerShell)
# 双击此文件即可启动前后端服务

$projectRoot = "D:\Projects\一程风信"
$clientRoot = "$projectRoot\client"

# 设置控制台标题
$Host.UI.RawUI.WindowTitle = "一程风信 - 启动器"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  一程风信 - 启动开发服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查端口占用
function Test-Port {
    param([int]$Port)
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
    try {
        $listener.Start()
        $listener.Stop()
        return $false  # 端口空闲
    } catch {
        return $true   # 端口被占用
    }
}

if (Test-Port -Port 3001) {
    Write-Host "[警告] 端口 3001 已被占用 - 后端可能已在运行" -ForegroundColor Yellow
} else {
    Write-Host "[1/2] 正在启动后端服务 (端口 3001)..." -ForegroundColor Green
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$projectRoot`" && node --import tsx server/src/index.ts" -WindowStyle Normal -WorkingDirectory $projectRoot
    Start-Sleep -Seconds 2
}

if (Test-Port -Port 5173) {
    Write-Host "[警告] 端口 5173 已被占用 - 前端可能已在运行" -ForegroundColor Yellow
} else {
    Write-Host "[2/2] 正在启动前端服务 (端口 5173)..." -ForegroundColor Green
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "cd /d `"$clientRoot`" && npx vite --host --port 5173" -WindowStyle Normal -WorkingDirectory $clientRoot
    Start-Sleep -Seconds 4
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  浏览器访问地址:" -ForegroundColor Cyan
Write-Host "  前端: http://localhost:5173" -ForegroundColor White
Write-Host "  后端: http://localhost:3001" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "正在打开浏览器..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "按任意键关闭此窗口（服务会继续运行）..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")