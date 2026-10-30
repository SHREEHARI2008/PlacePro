$backendDir = $PSScriptRoot
$binDir = Join-Path $backendDir "bin"
$libDir = Join-Path $backendDir "lib\*"
$cp = "$binDir;$libDir"

Write-Host "Starting Campus Placement Backend on port 8080..." -ForegroundColor Cyan
& java -cp $cp com.campus.placement.Main
