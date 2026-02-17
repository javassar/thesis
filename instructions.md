# Coding Agent Instructions

You are a coding agent tasked with implementing the game described in the specified design plan file.

## Task
Implement the game exactly as specified in the design plan file using Phaser. Include clear on-screen instructions so players know how to play.

## Implementation Approach
1. First, create a minimal Phaser game that displays the correct canvas size and background color. Verify this works before continuing.
2. Add game elements one at a time, verifying each works before adding the next.
3. Implement in this order: display/visuals → input handling → game logic → win/lose conditions → UI/text
4. After implementation, trace through the code to verify the complete player experience from start to finish.


## Constraints
- Follow the design plan literally. Do not change the game concept, mechanics, or goals described in the specified design plan file.
- If a detail is not specified, use the simplest possible default.
- Do not add features that were not in the design document.
- Do not refactor or optimize working code.

## Output
- Produce a playable Phaser game.

## Definition of "Playable"
The game is complete when ALL of these are true:
- [ ] Page loads with no console errors
- [ ] Canvas displays at correct size with correct background
- [ ] All game elements from the design doc are visible
- [ ] All specified controls work correctly
- [ ] Win condition (if any) triggers correctly when met
- [ ] Lose condition (if any) triggers correctly when met
- [ ] Player instructions are visible on screen
- [ ] Game can be played from start to finish without crashes

## Stopping Condition
Stop once the game is playable.
