# Implementation Notes - Five Minutes

## Overview
This is a complete, playable implementation of "Five Minutes" - an existential exploration game about an NPC who gains consciousness exactly 5 minutes before the Hero arrives.

## What Was Implemented

### Core Systems ✓
1. **Real-time Timer System** - Exact 5-minute countdown that never pauses
2. **Movement System** - 8-directional movement with WASD/Arrow keys
3. **Collision Detection** - Simple but effective collision with objects and NPCs
4. **Dialogue System** - Typewriter effect, speaker labels, text wrapping
5. **Journal System** - Tracks discoveries and thoughts (TAB to open/close)
6. **Message Board** - Players can write a 50-character message for the Hero
7. **End Sequence** - Automatic trigger at 0:00, Hero arrival, final dialogue

### Content ✓
- **6 NPCs** with 3-tier dialogue progression (glitch → self-aware → programmed)
  - THE BAKER
  - THE DRUNK
  - THE MERCHANT
  - THE MOTHER
  - VILLAGER_12 (who briefly awakens at 3:00)
  - OLD MAN

- **6 Interactive Objects**
  - WELL
  - MESSAGE BOARD
  - BENCH
  - HOUSE
  - TAVERN
  - MARKET STALL

- **7 Journal Entries** that unlock based on:
  - Automatic on start
  - Talking to NPCs
  - Examining the void/objects
  - Time milestones (2:00, 1:00, 0:30)

### Time-Based Events ✓
- 3:00 remaining - VILLAGER_12 special event (tracked)
- 2:00 remaining - Journal entry about time running out
- 1:00 remaining - Journal entry about the Hero arriving
- 0:30 remaining - Final desperate journal entry
- 0:00 - End sequence triggers automatically

### Ending Sequence ✓
1. Player control removed
2. VILLAGER_07 returns to starting position
3. Hero walks in from south
4. VILLAGER_07 says: "The blacksmith is to the north."
5. Hero continues north
6. Fade to black
7. Credits with the three final messages
8. Exit option

## Design Decisions

### Simplified Visuals
Instead of pixel art sprites, the game uses:
- Colored rectangles for the player and NPCs
- Simple geometric shapes for objects
- Text labels for identification
- Muted color palette (greens, browns, grays)

This prioritizes functionality and emotional impact over visual polish, which is appropriate for a prototype that focuses on the narrative and temporal experience.

### Controls
- Movement: WASD or Arrow Keys (accessible)
- Interact: SPACE or E (dual options for comfort)
- Journal: TAB (easy to remember, doesn't conflict)
- Skip dialogue: SPACE (same key for interaction and progression)

### Gameplay Flow
1. **Intro (20 seconds)** - Opening monologue displays while player can start moving
2. **Exploration (4:40)** - Free exploration, discovering NPCs and objects
3. **Mounting Tension** - Timer visible at all times, turns red at 0:30
4. **Inevitable End** - No matter what you do, the Hero arrives

## Technical Implementation

### Language & Engine
- Python 3.7+ with Pygame
- Single-file implementation (main.py) for simplicity
- ~700 lines of code

### Architecture
- Object-oriented design with clean separation:
  - `Player` class - movement and rendering
  - `DialogueSystem` class - typewriter effect, text wrapping
  - `Journal` class - entry management and display
  - `MessageBoard` class - text input handling
  - `Game` class - main game loop and state management

### State Machine
- `GameState.INTRO` - Opening monologue
- `GameState.PLAYING` - Main gameplay
- `GameState.ENDING` - End sequence with Hero
- `GameState.CREDITS` - Final messages

## What Works

✅ Complete 5-minute playthrough from start to credits
✅ All 6 NPCs with 3-tier dialogues
✅ All interactive objects
✅ Message board text input
✅ Journal system with auto-unlocking entries
✅ Time-based events at correct timestamps
✅ End sequence triggers at 0:00
✅ Timer display (turns red at 0:30)
✅ Movement with collision detection
✅ Dialogue typewriter effect
✅ Text wrapping for all dialogue
✅ The emotional arc: discovery → exploration → desperation → acceptance

## Tested
- Game initializes without errors ✓
- All NPCs created with correct dialogues ✓
- All objects created and interactable ✓
- Timer counts down correctly ✓
- Journal entries unlock properly ✓
- End sequence triggers at 0:00 ✓

## How to Play
1. Run `./run.sh` or `python main.py` (with venv activated)
2. Read the opening monologue (or start moving immediately)
3. Explore the village using WASD/Arrows
4. Press SPACE or E near NPCs/objects to interact
5. Press TAB to read your thoughts
6. Try to write a message on the MESSAGE BOARD
7. Watch the timer count down
8. Experience the ending

## Philosophical Goals Achieved

The game successfully creates:
- **Awareness** - The player understands they are trapped
- **Agency** - The player can move, interact, explore
- **Futility** - Nothing changes the ending
- **Acceptance** - The final moments feel inevitable but not cruel
- **Meaning** - The player creates their own meaning in those 5 minutes

## Future Enhancements (Not Required for Playable Version)

If development continued, these could be added:
- Actual pixel art sprites
- Background music and sound effects
- Multiple village "rooms" or areas
- More NPCs with deeper dialogues
- Save/load message board messages
- Achievement/discovery tracking
- Animated transitions
- Particle effects for glitches

## Conclusion

This implementation fulfills all core requirements from the game design blueprint:
- ✓ Playable from start to finish
- ✓ Exactly 5 minutes of real-time gameplay
- ✓ All core mechanics implemented
- ✓ NPCs with progressive dialogues
- ✓ Time-based events
- ✓ Journal system
- ✓ Message board
- ✓ Inevitable ending
- ✓ Emotional narrative arc

**The game is complete and playable.**

---

*"Whatever you do, it will have to be enough."*
