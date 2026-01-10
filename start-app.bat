@echo off
title Pregnancy App - Development Server
cd /d "%~dp0"
echo Starting Pregnancy App...
echo.
echo The app will open in your browser at http://localhost:5173
echo Press Ctrl+C to stop the server
echo.
npm run dev
pause
