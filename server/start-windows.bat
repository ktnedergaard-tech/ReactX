@echo off
REM Dobbeltklik denne fil for at starte ReactX lokalt - baade appen og
REM parrings-serveren, saa alle telefoner kun skal besoege EN adresse.
REM Kraever Node.js (gratis, https://nodejs.org - vaelg "LTS").
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js blev ikke fundet paa denne computer.
  echo Hent det gratis paa https://nodejs.org ^(vaelg LTS-versionen^) og proev igen.
  pause
  exit /b 1
)

echo Forbereder appen...
cd ..
if not exist node_modules (
  echo Foerste gang: installerer det, appen skal bruge...
  call npm install
  if errorlevel 1 (
    echo Noget gik galt under installationen.
    pause
    exit /b 1
  )
)
call npm run build
if errorlevel 1 (
  echo Noget gik galt under bygningen af appen.
  pause
  exit /b 1
)
cd server

if not exist node_modules (
  echo Foerste gang: installerer det, serveren skal bruge...
  call npm install
  if errorlevel 1 (
    echo Noget gik galt under installationen.
    pause
    exit /b 1
  )
)

echo.
echo ===================================================
echo  ReactX starter...
echo ===================================================
echo.
call npm start

echo.
pause
