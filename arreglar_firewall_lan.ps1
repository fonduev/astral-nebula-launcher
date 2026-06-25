# Script para permitir las conexiones de Java/Minecraft en el Firewall de Windows
Write-Host "=== CONFIGURANDO FIREWALL PARA NEBULA LAUNCHER (MODO LAN) ===" -ForegroundColor Cyan

# 1. Comprobar si se está ejecutando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "Este script requiere permisos de Administrador para modificar el Firewall."
    Write-Host "Reabriendo con permisos elevados..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# 2. Buscar y agregar reglas para cada Java javaw.exe
$runtimesPath = "$env:APPDATA\astral-nebula-launcher\runtimes"
if (Test-Path $runtimesPath) {
    $javaFiles = Get-ChildItem -Path $runtimesPath -Recurse -Filter "javaw.exe"
    
    foreach ($java in $javaFiles) {
        $ruleName = "Nebula Minecraft Java ($($java.Directory.Parent.Name))"
        Write-Host "Configurando regla para: $ruleName" -ForegroundColor Green
        
        # Eliminar regla anterior si existe para evitar duplicados
        Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
        
        # Crear la nueva regla
        New-NetFirewallRule -DisplayName $ruleName `
                            -Direction Inbound `
                            -Action Allow `
                            -Program $java.FullName `
                            -Profile Any `
                            -Protocol Any `
                            -Description "Permite conexiones entrantes para partidas multijugador LAN de Minecraft (Nebula Launcher)" `
                            -ErrorAction SilentlyContinue
    }
} else {
    Write-Error "No se encontró la carpeta de Java del launcher en: $runtimesPath"
}

# 3. Regla para el propio Launcher
$launcherPath = "$env:LOCALAPPDATA\Programs\Nebula Launcher\Nebula Launcher.exe"
if (Test-Path $launcherPath) {
    $ruleName = "Nebula Launcher App"
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName $ruleName `
                        -Direction Inbound `
                        -Action Allow `
                        -Program $launcherPath `
                        -Profile Any `
                        -Protocol Any `
                        -Description "Permite conexiones entrantes para Nebula Launcher" `
                        -ErrorAction SilentlyContinue
}

Write-Host "`n=== PROCESO COMPLETADO EXCELENTEMENTE ===" -ForegroundColor Cyan
Write-Host "Presiona cualquier tecla para cerrar..."
$null = [System.Console]::ReadKey()
