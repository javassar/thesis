# Quick Start: jsPsych Experiment Setup

## What You Have

✅ **Modified Game** - The Last Light (Revised) now signals when complete
✅ **Experiment Template** - `experiment-template.html` with game rotation
✅ **Complete Guide** - `JSPSYCH_INTEGRATION_GUIDE.md` for full details

---

## Fastest Setup (5 Steps)

### 1. Build Your Games

```bash
cd the-last-light-revised
npm run build
# This creates a 'dist/' folder
```

### 2. Create Experiment Folder

```
my-experiment/
├── index.html          # Rename experiment-template.html to this
└── games/
    └── the-last-light-revised/
        # Copy EVERYTHING from dist/ here
```

### 3. Update Game Paths

Edit `index.html`, find the `GAMES` object around line 50:

```javascript
const GAMES = {
    'game1': {
        name: 'The Last Light (Revised)',
        path: 'games/the-last-light-revised/index.html',  // ← Your game path
        description: 'A narrative mystery about letting go'
    }
    // Add more games here
};
```

### 4. Test Locally

```bash
cd my-experiment
python -m http.server 8000
```

Open: `http://localhost:8000/`

### 5. Deploy

Upload entire `my-experiment/` folder to:
- GitHub Pages (free)
- Netlify (free)
- Your university server

---

## Adding More Games

For each additional game:

1. Build it: `npm run build`
2. Copy `dist/` to `games/game-name/`
3. Add to `GAMES` object in `index.html`
4. Add completion signal to that game's code (copy from revised version)

---

## Key Code Snippets

### Game Completion Signal (already in revised game)

Add this to any React game's main component:

```javascript
useEffect(() => {
  if (gameIsComplete) {
    setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'game_complete',
          data: { /* game data here */ }
        }, '*');
      }
    }, 8000);
  }
}, [gameIsComplete]);
```

### Assignment Methods

**Random (default):**
```javascript
const randomIndex = Math.floor(Math.random() * gameIds.length);
return gameIds[randomIndex];
```

**Round-robin by ID:**
```javascript
const participantId = urlParams.get('participant_id');
return gameIds[participantId % gameIds.length];
```

Use: `https://yoursite.com/experiment/?participant_id=123`

---

## What Happens

1. Participant opens URL
2. Random game assigned (or based on ID)
3. Consent form shown
4. Instructions shown
5. **Game loads in fullscreen**
6. **Game completes, signals to jsPsych**
7. **Survey questions shown**
8. Data saved/displayed

---

## Customize Survey

Find around line 300 in `index.html`:

```javascript
var experience_questions = {
    type: jsPsychSurveyLikert,
    questions: [
        {
            prompt: "Your question here",
            name: 'variable_name',
            labels: ["Option 1", "Option 2", "Option 3"],
            required: true
        }
    ]
};
```

---

## Testing Different Games

```
http://localhost:8000/?game=game1
http://localhost:8000/?game=game2
http://localhost:8000/?game=game3
```

---

## Common Issues

**Game doesn't appear:**
- Check path in `GAMES` object
- Verify files copied from `dist/`
- Open browser console (F12) for errors

**Survey doesn't show:**
- Wait 8 seconds after game ending
- Check console for completion message
- Verify game sends postMessage

**Can't test locally:**
- Don't open HTML directly (file://)
- Use: `python -m http.server 8000`
- Then open: `http://localhost:8000/`

---

## Files You Need

From this directory:
- ✅ `experiment-template.html` → your `index.html`
- ✅ `the-last-light-revised/dist/*` → `games/the-last-light-revised/`

That's it! Everything else is loaded from CDN.

---

**Ready to go!** See `JSPSYCH_INTEGRATION_GUIDE.md` for complete details.
