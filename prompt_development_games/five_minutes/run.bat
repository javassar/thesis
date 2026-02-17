@echo off
REM Run script for Five Minutes (Windows)

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Run the game
python main.py
