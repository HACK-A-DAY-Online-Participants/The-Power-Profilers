@echo off
echo 🔥 Starting Energy API...

REM Use your local Python if it exists
IF EXIST "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" "C:\EnergyAPI\server.py"
    exit /b
)

REM Fallback: python from PATH
python "C:\EnergyAPI\server.py"
