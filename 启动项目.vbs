' 一程风信 - 启动器 (VBScript)
' 双击此文件即可启动前后端服务并打开浏览器

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在目录
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 后端启动命令
backendCmd = "cmd /k cd /d """ & scriptDir & """ && node --import tsx server/src/index.ts"
WshShell.Run backendCmd, 1, False

' 等待2秒让后端先启动
WScript.Sleep 2000

' 前端启动命令
frontendCmd = "cmd /k cd /d """ & scriptDir & "\client"" && npx vite --host --port 5173"
WshShell.Run frontendCmd, 1, False

' 等待4秒让前端启动
WScript.Sleep 4000

' 打开浏览器
WshShell.Run "http://localhost:5173"