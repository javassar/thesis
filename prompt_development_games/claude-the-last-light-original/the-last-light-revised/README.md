# The Last Light (Revised Edition)

A narrative mystery game about letting go. On what seems to be your final night as a lighthouse keeper, you climb the tower one last time—but something is wrong. The stairs never end. The sea is silent. And you're beginning to suspect you've been climbing for much longer than one night.

## About

You are Marlowe. Tonight, you climb the lighthouse for what you believe is the last time before automation takes over. But as you ascend, reality becomes increasingly strange. The dates don't make sense. Elena's face won't stay in focus. The sea outside never moves.

**The truth:** Marlowe has been dead for years, trapped in a liminal space, unable to let go. The "automation" isn't technology—it's the universe finally insisting that Marlowe move on. The final choice isn't about legacy. It's about release.

**Duration:** 3-5 minutes
**Genre:** Atmospheric Narrative Mystery
**Controls:** Keyboard only

## How to Run

### Quick Start

```bash
cd the-last-light-revised
npm install
npm run dev
```

Then open your browser to: **http://localhost:5174/**

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Controls

- **↑ / W** - Move selection up
- **↓ / S** - Move selection down
- **Enter** - Confirm / Continue
- **Space** - Advance text / **Extinguish the light** (final choice)

## The Mystery

The game begins as a straightforward "last night on the job" story, but environmental details grow increasingly surreal:

### Clues That Something Is Wrong

- The newspaper has no date
- The sea doesn't move—completely frozen, silent
- Elena "left" but Marlowe "never saw her again" (she died)
- The logbooks span impossible dates (1897-2089)
- The same "Day 1" entry appears hundreds of times in Marlowe's handwriting
- The stairs seem longer each time
- A mysterious figure appears in the lamp room
- Outside the final window: a white void where the world should be

## The Twist

**You're not lighting the lamp. You're extinguishing it.**

The game sets up the expectation that you'll light the lighthouse lamp one final time. Instead, in the lamp room, you're asked to **extinguish** it—to let go, to release yourself from the duty that has kept you trapped.

This inversion is the emotional crux of the game. The player must actively choose to destroy rather than create, to end rather than continue.

## Endings

The game has **four possible endings**:

### Three "Extinguish" Endings
Based on your earlier choice in the logbook scene:

1. **Acceptance** - "Elena is waiting. She's been waiting. You're ready."
2. **Refusal** - "You were the kept. Free now. Finally free."
3. **Peace** - "The figure was you. The part that knew it was time."

### One "Trapped" Ending

If you wait 15+ seconds in the lamp room without pressing space, Marlowe cannot let go. The light flickers back on, and the game **loops**—you return to the beginning, trapped in the cycle, climbing the stairs again. You can replay indefinitely or close the window.

This ending acknowledges that not everyone is ready to let go. But it shows the cost: endless repetition.

## Gameplay

### Act Structure

1. **Intro** - Sets mysterious tone
2. **The Base** - Choice about the newspaper (2 options)
3. **First Landing** - Memory of Elena (3 options, one reveals her death)
4. **Second Landing** - The impossible logbooks, final entry choice (3 options - determines ending)
5. **Lamp Room** - The void, the mysterious figure, the inverted choice
6. **Epilogue** - One of four endings

### Visual Escalation

The game uses **escalating surrealism** to tell the story visually:

- **Base**: Muted, realistic colors—just slightly "off"
- **Landing 1**: Purple tints creeping in, saturation increases
- **Landing 2**: Deep violet, impossible colors, glitch effects on text
- **Lamp Room**: The world is gone—pure white void outside
- **Epilogue**: Pure darkness, then emerging light (if extinguished)

## Technical Features

- **Timer Mechanic**: 15-second countdown to trapped ending
- **Mysterious Figure**: Animated, peaceful presence in lamp room
- **Glitch Effects**: Subtle text distortions in logbook scene
- **Color Progression**: Each scene more saturated/impossible than the last
- **Loop System**: Trapped ending restarts the game
- **Void Background**: White nothingness in final scene
- **Extended Darkness**: 3-second pause after extinguishing before epilogue

## The Design Philosophy

> "This is not horror. It's melancholy. The figure is not threatening. The void is not malicious. Death in this game is release, not punishment."

The game trusts the player to notice wrongness without explaining it. The mystery unfolds through observation—frozen seas, impossible dates, blurred faces. The ending answers emotionally, not literally.

## Accessibility

- Fully keyboard-navigable
- Respects `prefers-reduced-motion` setting
- High contrast text
- No time pressure (except the optional 15-second timer)

## Credits

**Design**: Based on "The Last Light" game design document (Revised Edition)
**Implementation**: React 18 + Custom CSS
**Fonts**: Playfair Display, Crimson Pro

---

*"The light has kept you here. All these years. All these impossible nights.
As long as it burns, you have a reason to stay."*

**Press SPACE to extinguish the light.**
