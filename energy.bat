@echo off

set API_FOLDER=C:\EnergyAPI
set SERVER=%API_FOLDER%\server.py
set CLI=%API_FOLDER%\compiler\cli.py

REM Check Python
where python >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found!
    exit /b
)

REM Check if server is already running
powershell -command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue" >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo ✓ Energy API already running.
) ELSE (
    echo ⚠ Energy API not running — starting it now...
    start "" python "%SERVER%"
    timeout /t 3 >nul
)

echo ⚡ Sending file to Energy API...
python "%CLI%" %1
