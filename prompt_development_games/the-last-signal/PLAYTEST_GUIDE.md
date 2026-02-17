# The Last Signal - Playtest Guide

## Quick Start

1. Open `index.html` in a web browser
2. Press **SPACE** to begin
3. Use **Arrow Keys** or **A/D** to tune to 107.7 MHz
4. Follow the on-screen instructions

## Complete Playthrough Paths

### Path 1: Ending A (Survival)
1. Tune to 107.7 MHz
2. Choose any response to the first question
3. Complete Morse code: Type **FIRE**
4. Choose option **1** ("Fire. I got it...")
5. Final choice: Select **1** (Leave the radio)
6. **Result**: You check the generator and prevent the disaster

### Path 2: Ending B (The Loop)
1. Tune to 107.7 MHz
2. Choose any response to the first question
3. Complete Morse code: Type **FIRE**
4. Choose option **2** ("This is insane...")
5. Listen to the proof
6. Final choice: Select **2** (Stay at radio)
7. **Result**: You eventually run to the generator at the last moment

### Path 3: Ending C (Conspiracy)
1. **First, tune to 107.3 MHz** (the secret frequency)
2. Listen to the OTHER VOICE warning
3. Wait for it to fade
4. Then tune to 107.7 MHz for the main signal
5. Choose any response to the first question
6. Complete Morse code: Type **FIRE**
7. Choose either option
8. Final choice: Select **2** (Stay at radio)
9. **Result**: Alternative ending about trusting the wrong voice

## Testing Checklist

### Core Mechanics
- [ ] Frequency dial responds to arrow keys and A/D
- [ ] Dial visual moves smoothly
- [ ] VU meter fills when approaching correct frequency
- [ ] Signal locks at 107.7 MHz (±0.3)
- [ ] Static audio plays and adjusts based on frequency
- [ ] Tutorial text appears and disappears appropriately

### Dialogue System
- [ ] Text appears with proper timing
- [ ] All dialogue choices are clickable
- [ ] Number keys 1-3 select choices
- [ ] Dialogue progresses through all scenes
- [ ] Different choice paths work correctly

### Morse Code
- [ ] Morse code sounds play (dots and dashes)
- [ ] Visual display shows dot/dash pattern
- [ ] Typing letters updates the input display
- [ ] Correct answer (FIRE) progresses the game
- [ ] Wrong answer shows error and allows retry
- [ ] Hint appears when pressing H

### Endings
- [ ] Ending A displays correctly with timed text
- [ ] Ending B displays correctly with timed text
- [ ] Ending C displays correctly with timed text
- [ ] Credits appear after ending text completes
- [ ] Pressing R restarts the game

### Audio
- [ ] Static sound plays during tuning
- [ ] Static reduces when signal is locked
- [ ] Morse beeps have correct timing
- [ ] Audio context resumes on user interaction

### Visual Polish
- [ ] Clock updates in real-time
- [ ] Indicator light turns red when signal locks
- [ ] Blizzard animation plays in window
- [ ] All text is readable on the notepad
- [ ] Screen transitions are smooth

## Known Features

### Secret Frequency
- Tune to **107.3 MHz** during the initial tuning phase
- You'll hear a different voice warning you not to trust the main signal
- This unlocks the conspiracy ending (Ending C)
- Must be discovered BEFORE locking onto 107.7

### Replay Value
- Three distinct endings
- Secret frequency Easter egg
- Different dialogue based on trust/doubt path
- Each playthrough takes 4-6 minutes

## Debug Tips

### If audio doesn't work:
- Click anywhere on the page first (browser autoplay policy)
- Check browser console for AudioContext errors
- Make sure browser allows Web Audio API

### If frequency won't lock:
- Target frequency is 107.7 (visible in green display)
- Lock happens at ±0.3 MHz tolerance
- Try fine-tuning with small taps of arrow keys

### If Morse code won't accept input:
- Make sure you're in Morse scene (tape should be visible)
- Type only letters (F, I, R, E)
- Answer is case-insensitive
- Press H for hint if stuck

### If game gets stuck:
- Refresh the page to restart
- Check browser console for JavaScript errors
- Verify all three files are in the same directory

## Performance Notes

- Game should run at 60 FPS on any modern laptop
- Total page load < 100KB (no external assets)
- Audio is synthesized in real-time (no audio files needed)
- Works offline once loaded

## Browser Compatibility

Tested on:
- Chrome (recommended)
- Firefox
- Safari
- Edge

Requires:
- JavaScript enabled
- Web Audio API support
- CSS3 animations support
- ES6 JavaScript support
