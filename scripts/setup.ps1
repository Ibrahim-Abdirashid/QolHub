# QolHub - MongoDB + seed + dev
$mongod = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
if (-not (Test-Path $mongod)) {
  $mongod = Get-ChildItem "C:\Program Files\MongoDB\Server" -Recurse -Filter "mongod.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

$service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($service -and $service.Status -ne "Running") {
  Start-Service MongoDB
  Write-Host "MongoDB service started."
} elseif (-not $service) {
  $dataDir = "C:\data\db"
  if (-not (Test-Path $dataDir)) { New-Item -ItemType Directory -Path $dataDir -Force | Out-Null }
  Start-Process -FilePath $mongod -ArgumentList "--dbpath", $dataDir -WindowStyle Hidden
  Start-Sleep -Seconds 3
  Write-Host "MongoDB started (manual dbpath)."
} else {
  Write-Host "MongoDB already running."
}
