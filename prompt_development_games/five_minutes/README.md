# FIVE MINUTES
*A Game About Waiting to Exist*

## Description
You are VILLAGER_07, an NPC in a generic fantasy RPG who suddenly gains consciousness exactly five minutes before the Hero arrives. Explore your frozen village, interact with other NPCs, and come to terms with your existence in the time you have left.

## Requirements
- Python 3.7 or higher
- Pygame

## Installation

### Option 1: Using the provided virtual environment
If you cloned this repository with the venv folder:
```bash
cd five_minutes
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

### Option 2: Create your own virtual environment
```bash
cd five_minutes
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install pygame
python main.py
```

### Option 3: System-wide installation (not recommended)
```bash
pip install pygame
cd five_minutes
python main.py
```

## Running the Game

After activating the virtual environment:
```bash
python main.py
```

Or use the run script:
```bash
./run.sh  # Unix/Mac
run.bat   # Windows
```

## Controls

- **WASD or Arrow Keys** - Move VILLAGER_07 around the village
- **SPACE or E** - Interact with NPCs and objects
- **TAB** - Open/close your Thoughts journal
- **ESC** - Quit game

**First time playing?** See [QUICK_START.md](QUICK_START.md) for a visual guide!

### Finding Your Character
Look for the **bright blue** character with **"YOU"** floating above it in the center of the screen. You can't miss it!

## Gameplay

You have exactly 5 minutes of real time to:
- Explore the village of Thornwick
- Talk to frozen NPCs (each has 3 dialogue states)
- Examine objects that reveal the artificiality of your world
- Try to escape (you can't)
- Write a message for the Hero on the message board
- Come to terms with your fate

### Key Interactions

- **NPCs**: Talk to them multiple times - they glitch, become self-aware, then revert to their programmed lines
- **Message Board**: Write a message for the Hero (they won't read it)
- **Journal**: Check your thoughts as you make discoveries
- **The Timer**: Always visible. Always counting down. When it reaches 0:00, the Hero arrives.

## Notes

- The game lasts exactly 5 minutes
- The timer never pauses
- The ending is always the same - that's the point
- You will say your line

## Design Philosophy

*"If you knew you only had five minutes of awareness, what would you do? Whatever you do, it will have to be enough."*

---

Thank you for playing.
