# ERASER - A Game About Memory

## What This Is

An interactive narrative game about an elderly woman named Elena recounting her memories of meeting her late husband, David. You play as the force of time and forgetting, choosing what Elena remembers and what fades away.

## How to Play

1. **Open the game**: Simply open `eraser-game.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
2. **Click to start**: Click anywhere on the intro screen to begin
3. **Erase memories**:
   - Click and drag your mouse to erase parts of each scene
   - You MUST erase a certain percentage of each memory to continue
   - You CANNOT erase everything - some things must be kept
   - There is NO UNDO - choose carefully
4. **Progress through scenes**: Once you've erased enough, click "Continue"
5. **Experience the story**: The narration changes based on what you chose to preserve

## The Mechanics

- **Memory Clarity Meter**: Shows how much of the current scene remains
- **Red Line**: The minimum you must keep (you can't erase past this)
- **Eraser Size**: 50-pixel circular cursor
- **5 Scenes**: Each representing a key memory in Elena's life
  - The Meeting (classroom, 1962)
  - The First Date (café)
  - The Proposal (park bench)
  - The Difficulty (kitchen argument)
  - The End (hospital room)

## The Point

Different players will create different stories from the same raw material. What you choose to preserve shapes Elena's narrative and reveals how memory constructs our sense of self and relationships. The ending you receive depends on how many "connection moments" (both Elena and David together) you preserved across all five scenes.

## Technical Details

- Built with HTML5 Canvas and vanilla JavaScript
- No external dependencies required
- Resolution: 900 x 700 pixels
- Browser-based, runs entirely client-side
- Optimized for mouse/trackpad input

## Design Philosophy

This game implements the design principle that **the mechanic IS the theme**. Erasing isn't a metaphor for forgetting - it IS forgetting. The player performs the act of selective memory, experiencing firsthand how choosing what to remember (and what to let go) constructs the story of a life.

## Credits

Designed and implemented as specified in the Eraser Game Design Document.
