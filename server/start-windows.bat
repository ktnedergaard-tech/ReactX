@echo off
REM Dobbeltklik denne fil for at starte ReactX' parrings-server lokalt.
REM Kraever Node.js (gratis, https://nodejs.org - vaelg "LTS").
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js blev ikke fundet paa denne computer.
  echo Hent det gratis paa https://nodejs.org ^(vaelg LTS-versionen^) og proev igen.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Foerste gang: installerer det, serveren skal bruge...
  call npm install
  if errorlevel 1 (
    echo Noget gik galt under installationen.
    pause
    exit /b 1
  )
  echo.
)

echo ===================================================
echo  ReactX parrings-server starter...
echo ===================================================
echo.
call npm start

echo.
pause
