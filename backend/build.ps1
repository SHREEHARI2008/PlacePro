$backendDir = $PSScriptRoot
$srcDir = Join-Path $backendDir "src"
$binDir = Join-Path $backendDir "bin"
$libDir = Join-Path $backendDir "lib\*"

if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir | Out-Null
}

$javaFiles = Get-ChildItem -Path $srcDir -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName
Write-Host "Found $($javaFiles.Count) Java source files. Compiling..."

& javac -encoding UTF-8 -cp $libDir -d $binDir $javaFiles

if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilation Successful!" -ForegroundColor Green
} else {
    Write-Host "Compilation Failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
