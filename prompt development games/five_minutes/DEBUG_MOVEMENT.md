# Movement Debug Guide

## Issue
Movement keys (WASD and Arrow keys) are not working as expected.

## Debug Version

Run the debug version to see what's happening:

```bash
source venv/bin/activate
python main_debug.py
```

This will show:
- Yellow debug info on the right side of the screen
- Current game state
- Which keys are detected as pressed
- Current dx/dy movement values
- Player position
- Whether dialogue is active
- Console messages when movement occurs or is blocked

## Testing Movement

### Simple Movement Test
Run the basic movement test (no game logic):
```bash
source venv/bin/activate
python test_movement.py
```

This opens a window where you can test PURE movement without game logic.
- Should show which keys you're pressing
- Should show player position updating
- Should show dx/dy values

If this works, the problem is in the game logic.
If this doesn't work, the problem is with pygame or your system.

## Things to Check

1. **Are keys being detected?**
   - Check the yellow "Keys:" line in debug mode
   - Should show "UP", "DOWN", "LEFT", or "RIGHT"

2. **Is dx/dy being calculated?**
   - Check the yellow "Movement:" line
   - Should show dx=1 or dy=-1 when keys are pressed

3. **Is player position changing?**
   - Check the yellow "Player Pos:" line
   - Numbers should change when you press keys

4. **Is game in the right state?**
   - Should say "INTRO" or "PLAYING"
   - NOT "ENDING" or "CREDITS"

5. **Is dialogue blocking?**
   - Check "Dialogue:" line
   - Should be False

## Common Issues

**Keys detected but player not moving:**
- Collision detection might be blocking movement
- Try moving in different directions
- Console will say "Movement blocked"

**Keys not detected:**
- Make sure game window has focus
- Try clicking on the game window
- Try different keys (WASD vs Arrows)

**Player position changing but character not visible:**
- This was the original issue
- Character should be bright blue with "YOU" label
- If invisible, check Player.draw() method

## Current Implementation

Movement should work:
1. During INTRO (even with dialogue active)
2. During PLAYING (when not in journal or message board)
3. With WASD or Arrow keys
4. Speed is 4 pixels per frame
5. Blocked by objects and boundaries

The movement calculation is:
```python
dx = keys[RIGHT] - keys[LEFT] + keys[D] - keys[A]
dy = keys[DOWN] - keys[UP] + keys[S] - keys[W]
```

This gives:
- dx = -1 (left), 0 (no horizontal), 1 (right)
- dy = -1 (up), 0 (no vertical), 1 (down)

Then: `new_x = x + dx * speed`

## If Nothing Works

Try running the simplest possible pygame test:

```python
import pygame
pygame.init()
screen = pygame.display.set_mode((400, 300))
print("If you see a window, pygame is working")
print("Press any key...")
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            print(f"Key pressed: {pygame.key.name(event.key)}")
            running = False
pygame.quit()
```

If this doesn't detect keys, pygame installation might be the issue.
