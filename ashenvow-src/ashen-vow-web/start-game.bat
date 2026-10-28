@echo off
cd /d "%~dp0"
echo Starting Ashen Vow local server...
echo Open http://127.0.0.1:5173 in your browser
start "" "http://127.0.0.1:5173"
node tools\serve.js
pause
