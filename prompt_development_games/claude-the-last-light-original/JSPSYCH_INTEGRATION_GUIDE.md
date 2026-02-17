# jsPsych Integration Guide

## How to Set Up Your Experiment with Multiple Games

This guide explains how to integrate your video games into a jsPsych experiment where participants are randomly assigned to different game conditions.

---

## Overview

The setup allows you to:
- ✅ Randomly assign participants to different games
- ✅ Have one experiment HTML file that works for all conditions
- ✅ Automatically collect game completion data
- ✅ Show surveys after the game completes
- ✅ Store all data in jsPsych's standard format

---

## Step 1: Folder Structure

Create the following folder structure on your web server:

```
experiment/
├── index.html                    # Your main experiment file (experiment-template.html)
├── games/
│   ├── the-last-light-revised/  # Copy dist/ contents here
│   │   ├── index.html
│   │   └── assets/
│   ├── the-last-light-original/ # Copy other game dist/ here
│   │   ├── index.html
│   │   └── assets/
│   └── game3/                   # Additional games
│       ├── index.html
│       └── assets/
└── data/                        # Optional: for server-side data collection
```

---

## Step 2: Build and Copy Your Games

For each game you want to include:

### For the Revised Game:

```bash
cd the-last-light-revised
npm run build
```

Then **copy the entire contents of `dist/`** to `experiment/games/the-last-light-revised/`

### For Other Games:

Repeat the same process:
1. Build the game: `npm run build`
2. Copy `dist/` contents to `experiment/games/[game-name]/`

---

## Step 3: Configure the Experiment File

Edit `experiment-template.html` (rename it to `index.html` for your experiment).

### Define Your Games

Find this section in the HTML:

```javascript
const GAMES = {
    'game1': {
        name: 'The Last Light (Revised)',
        path: 'games/the-last-light-revised/index.html',
        description: 'A narrative mystery about letting go'
    },
    'game2': {
        name: 'The Last Light (Original)',
        path: 'games/the-last-light-original/index.html',
        description: 'A contemplative narrative adventure'
    },
    'game3': {
        name: 'Another Game',
        path: 'games/another-game/index.html',
        description: 'Description of another game'
    }
};
```

**Add or remove games** as needed. Each game needs:
- A unique ID (`'game1'`, `'game2'`, etc.)
- A display name
- A path to the built game's `index.html`
- A description shown in instructions

---

## Step 4: Choose Assignment Method

The template includes 3 assignment methods. Choose one by uncommenting it in the `assignGameCondition()` function:

### Method 1: Random Assignment (Default)

```javascript
function assignGameCondition() {
    const gameIds = Object.keys(GAMES);
    const randomIndex = Math.floor(Math.random() * gameIds.length);
    return gameIds[randomIndex];
}
```

✅ **Use when:** You want pure random assignment
✅ **Pros:** Simple, balanced over large samples
❌ **Cons:** No guarantee of equal distribution

### Method 2: Round-Robin by Participant ID

```javascript
function assignGameCondition() {
    const urlParams = new URLSearchParams(window.location.search);
    const participantId = urlParams.get('participant_id') || Math.floor(Math.random() * 1000);
    const gameIds = Object.keys(GAMES);
    return gameIds[participantId % gameIds.length];
}
```

✅ **Use when:** You want guaranteed equal distribution
✅ **Pros:** Perfect balance across conditions
❌ **Cons:** Requires participant IDs in URL

**URL format:** `https://yoursite.com/experiment?participant_id=123`

### Method 3: Manual URL Parameter

```javascript
function assignGameCondition() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('game') || 'game1';
}
```

✅ **Use when:** You want manual control (e.g., for testing)
✅ **Pros:** Full control per participant
❌ **Cons:** Must specify for each participant

**URL format:** `https://yoursite.com/experiment?game=game2`

---

## Step 5: How the Game Integration Works

### Game Signals Completion

The game automatically sends a message when complete:

```javascript
// Added to App.jsx (already done for you)
useEffect(() => {
  if (currentScene.ending && isComplete) {
    setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'game_complete',
          data: {
            choices: gameState.choices,
            loopCount: gameState.loopCount,
            completedAt: new Date().toISOString()
          }
        }, '*');
      }
    }, 8000); // 8 seconds to read ending
  }
}, [currentScene.ending, isComplete, gameState.choices, gameState.loopCount]);
```

### jsPsych Receives the Signal

The custom plugin listens for this message:

```javascript
var messageHandler = function(event) {
    if (event.data && event.data.type === 'game_complete') {
        gameCompleted = true;
        gameData = event.data.data;
        endTrial(); // Move to next part of experiment
    }
};
```

### Data is Stored

All data is automatically saved in jsPsych's data object:

```javascript
{
    game_completed: true,
    game_data: {
        choices: {
            newspaper: 'examined',
            memory: 'death',
            logEntry: 'acceptance',
            finalChoice: 'extinguish'
        },
        loopCount: 0,
        completedAt: '2024-12-18T...'
    },
    rt: 245000, // Response time in ms
    game_url: 'games/the-last-light-revised/index.html'
}
```

---

## Step 6: Customize Survey Questions

Edit the survey sections to ask your research questions:

```javascript
var experience_questions = {
    type: jsPsychSurveyLikert,
    questions: [
        {
            prompt: "How emotionally engaging was the game?",
            name: 'emotional_engagement',
            labels: ["Not at all", "Slightly", "Moderately", "Very", "Extremely"],
            required: true
        },
        // Add more questions...
    ]
};
```

### Available Survey Types:

- `jsPsychSurveyLikert` - Rating scales
- `jsPsychSurveyText` - Open-ended responses
- `jsPsychSurveyMultiChoice` - Multiple choice
- `jsPsychSurveyMultiSelect` - Check all that apply

---

## Step 7: Test Locally

### Simple Local Testing:

1. Put your experiment folder on your computer
2. Open a terminal in that folder
3. Run: `python -m http.server 8000` (Python 3) or `python -m SimpleHTTPServer 8000` (Python 2)
4. Open: `http://localhost:8000/`

### Test Each Game:

```
http://localhost:8000/?game=game1
http://localhost:8000/?game=game2
http://localhost:8000/?game=game3
```

---

## Step 8: Deploy to Web Server

Upload the entire `experiment/` folder to your web server.

### Recommended Platforms:

1. **GitHub Pages** (Free)
   - Push to GitHub repository
   - Enable GitHub Pages in settings
   - URL: `https://yourusername.github.io/experiment/`

2. **Netlify** (Free)
   - Drag and drop the folder
   - Automatic deployment
   - Custom domain support

3. **Your University Server**
   - Use SFTP to upload
   - Check with your IT department

---

## Step 9: Data Collection

### Option 1: jsPsych DataPipe (Recommended)

```javascript
var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsychDataPipe.saveData({
            experimentID: 'your-experiment-id',
            data: jsPsych.data.get().json()
        });
    }
});
```

See: https://www.jspsych.org/7.3/overview/data/#saving-data-to-jspsych-datapipe

### Option 2: Your Own Server

```javascript
var jsPsych = initJsPsych({
    on_finish: function(data) {
        fetch('https://your-server.com/save-data', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data.values())
        });
    }
});
```

### Option 3: Download JSON (Testing Only)

```javascript
var jsPsych = initJsPsych({
    on_finish: function() {
        jsPsych.data.displayData('json');
    }
});
```

---

## Step 10: Send to Participants

### URL Options:

**Random assignment:**
```
https://yoursite.com/experiment/
```

**With participant ID:**
```
https://yoursite.com/experiment/?participant_id=123
```

**Specific game (testing):**
```
https://yoursite.com/experiment/?game=game1
```

---

## Troubleshooting

### Game doesn't load:

- Check that game paths are correct in `GAMES` object
- Verify files were copied from `dist/` correctly
- Check browser console for errors (F12)

### Game doesn't advance to survey:

- Verify game sends completion message (check console)
- Check that iframe communication works (same origin)
- Test timeout: wait 10 minutes to see if failsafe triggers

### Data not saving:

- Check `on_finish` function is set up
- Verify server endpoint if using custom server
- Check browser console for network errors

### CORS errors:

- Serve from web server, not local files (`file://`)
- Use `python -m http.server` for local testing
- Ensure game and experiment are same domain

---

## Example Data Output

```json
[
  {
    "rt": null,
    "stimulus": "Welcome...",
    "trial_type": "html-keyboard-response"
  },
  {
    "game_completed": true,
    "game_data": {
      "choices": {
        "newspaper": "examined",
        "memory": "death",
        "logEntry": "acceptance",
        "finalChoice": "extinguish"
      },
      "loopCount": 0
    },
    "rt": 245678,
    "assigned_game": "game1",
    "game_name": "The Last Light (Revised)"
  },
  {
    "emotional_engagement": 4,
    "immersion": 5,
    "trial_type": "survey-likert"
  },
  {
    "interpretation": "The game was about...",
    "trial_type": "survey-text"
  }
]
```

---

## Need Help?

Common resources:
- jsPsych documentation: https://www.jspsych.org/
- jsPsych forum: https://github.com/jspsych/jsPsych/discussions
- Check browser console (F12) for error messages

---

**You're all set! The experiment template is ready to use with your multiple games.**
