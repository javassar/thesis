# Playtest Guide - Five Minutes

This guide helps you verify all major features are working correctly.

## Quick Test (~30 seconds)

To verify the game runs and basic features work:

```bash
source venv/bin/activate  # or: ./run.sh
python main.py
```

1. **Intro** - Watch for opening text to appear
2. **Movement** - Press WASD or arrow keys to move around
3. **Interaction** - Walk near "THE BAKER" and press SPACE
4. **Journal** - Press TAB to see your thoughts
5. **Timer** - Check top-right corner shows 4:5X counting down
6. **Exit** - Press ESC to quit

If all of these work, the game is functional! ✓

## Full Playthrough Checklist (~5 minutes)

### Start (5:00 - 4:30)
- [ ] Opening monologue displays over ~20 seconds
- [ ] Timer appears in top-right
- [ ] Can move player with WASD/arrows during intro
- [ ] First journal entry: "I am awake..."

### Exploration Phase (4:30 - 3:00)
- [ ] Walk to THE BAKER, press SPACE
  - [ ] First interaction: Glitch dialogue "...flour?"
  - [ ] Second interaction: Self-aware dialogue about dreams
  - [ ] Third interaction: Programmed dialogue "Fresh bread!"
- [ ] Press TAB to open journal
  - [ ] Entry about NPCs dreaming appears
- [ ] Walk to MESSAGE BOARD, press SPACE
  - [ ] Text input appears
  - [ ] Type a message (max 50 chars)
  - [ ] Press ENTER to confirm
  - [ ] Message appears on board

### Mid-Game (3:00 - 2:00)
- [ ] At ~3:00, VILLAGER_12 event triggers (check journal)
- [ ] Talk to VILLAGER_12
  - [ ] Dialogue about being awake
  - [ ] Journal entry: "I am not the only one..."
- [ ] Interact with WELL
  - [ ] Dialogue about eternal water drops
- [ ] Interact with at least one more NPC

### Late Game (2:00 - 0:30)
- [ ] At 2:00, journal entry: "Time is running out..."
- [ ] At 1:00, journal entry: "The Hero is almost here..."
- [ ] Continue exploring, talk to more NPCs
- [ ] All NPCs show 3 stages of dialogue

### Final Moments (0:30 - 0:00)
- [ ] Timer turns RED
- [ ] At 0:30, journal entry: "I don't want to forget..."
- [ ] Timer counts down to 0:00

### End Sequence (Auto-triggered at 0:00)
- [ ] Screen dims
- [ ] Player moves back to starting position (if moved)
- [ ] Hero sprite enters from bottom
- [ ] Hero walks up to player
- [ ] Dialogue: "The blacksmith is to the north."
- [ ] Hero walks north and exits
- [ ] Screen fades to black

### Credits
- [ ] "FIVE MINUTES" appears
- [ ] "Thank you for playing."
- [ ] "They will wait again."
- [ ] "They will wake again."
- [ ] "They will always have five minutes."
- [ ] Can press ESC to exit

## Features to Verify

### All 6 NPCs
- [ ] THE BAKER (west side)
- [ ] THE DRUNK (near tavern)
- [ ] THE MERCHANT (market stall)
- [ ] THE MOTHER (center)
- [ ] VILLAGER_12 (near well)
- [ ] OLD MAN (on bench)

### All Interactive Objects
- [ ] WELL
- [ ] MESSAGE BOARD
- [ ] BENCH
- [ ] HOUSE
- [ ] TAVERN
- [ ] MARKET STALL

### All Journal Entries (7 total)
1. [ ] "I am awake..." (automatic)
2. [ ] "They sleep. But they dream..." (talk to any NPC)
3. [ ] "Beyond Thornwick..." (examine well or void)
4. [ ] "I am not the only one..." (talk to Villager_12)
5. [ ] "Time is running out..." (at 2:00)
6. [ ] "The Hero is almost here..." (at 1:00)
7. [ ] "I don't want to forget..." (at 0:30)

## Common Issues

**Game won't start?**
- Make sure virtual environment is activated: `source venv/bin/activate`
- Check pygame is installed: `pip list | grep pygame`

**Can't interact?**
- Must be standing very close to NPC/object
- Press SPACE or E (not ENTER)

**Dialogue won't close?**
- Press SPACE when text is fully displayed
- Look for "[SPACE to continue]" indicator

**Journal won't open?**
- Press TAB (not T)
- Can't open during dialogue or message board input

## Expected Experience

The game should feel:
- **Melancholy** - Quiet, still, contemplative
- **Urgent** - Timer constantly visible, counting down
- **Futile** - NPCs glitch and forget, escape is impossible
- **Meaningful** - Despite futility, interactions matter
- **Inevitable** - The ending always comes, always the same

## Bugs to Look For

- [ ] Timer not counting down
- [ ] Can't interact with NPCs
- [ ] Dialogue text overlapping or cut off
- [ ] Journal entries not unlocking
- [ ] End sequence not triggering at 0:00
- [ ] Player can move during end sequence
- [ ] Credits not appearing
- [ ] Collision not working (walking through objects)

## Performance

Game should run at 60 FPS on any modern computer. If performance is poor:
- Check CPU usage
- Verify pygame is properly installed
- Try closing other applications

---

**Bottom Line:** If you can start the game, move around, talk to NPCs, write a message, watch the timer count down, and see the ending, the game is working! ✓
