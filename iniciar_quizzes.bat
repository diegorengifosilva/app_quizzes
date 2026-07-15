@echo off
echo ===================================================
echo INICIANDO SISTEMA DE QUIZZES CORPORATIVOS
echo ===================================================

cd /d "%~dp0"

echo [1/2] Iniciando Backend Django (Puerto 8010)...
start "Backend Quizzes" cmd /k "cd backend && env\Scripts\activate && python manage.py runserver 0.0.0.0:8010"

echo [2/2] Iniciando Frontend React/Vite...
start "Frontend Quizzes" cmd /k "cd frontend && npm run dev"

echo.
echo El sistema se esta ejecutando en ventanas separadas.
echo Backend: http://localhost:8010
echo Frontend: http://localhost:5173
echo.
pause
