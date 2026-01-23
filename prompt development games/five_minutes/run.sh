#!/bin/bash
# Run script for Five Minutes

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run the game
python3 main.py
