# Game Assignment Backend Setup Guide

This backend server ensures balanced distribution of video games across participants in your creativity evaluation study.

## How It Works

The backend tracks review counts separately for `ai_aware` and `ai_blind` conditions. When a participant loads the experiment:

1. Frontend requests game assignment from backend with their condition
2. Backend selects 3 games with the **lowest review counts** for that condition
3. Backend **immediately increments** the counts for those games
4. Frontend displays the assigned games to the participant

This ensures each game gets approximately 6-7 reviews per condition (13-14 total).

## Prerequisites

You need Node.js installed on your computer. Check if you have it:

```bash
node --version
```

If not installed, download from: https://nodejs.org/

## Setup Instructions

### 1. Install Dependencies

Open terminal in your thesis folder and run:

```bash
npm install
```

This installs Express (web server) and CORS (allows frontend to connect).

### 2. Start the Backend Server

```bash
npm start
```

You should see:

```
Game assignment server running on http://localhost:3000

Available endpoints:
  GET  /assign-games?condition=ai_aware|ai_blind
  GET  /review-counts
  POST /adjust-count
  POST /reset-counts
```

**Keep this terminal window open** while running your experiment. The server must be running for the experiment to work.

### 3. Verify Server is Running

Open a browser and go to: http://localhost:3000/review-counts

You should see all games initialized with 0 reviews:

```json
{
  "ai_aware": {
    "game1.html": 0,
    "game2.html": 0,
    ...
  },
  "ai_blind": {
    "game1.html": 0,
    "game2.html": 0,
    ...
  }
}
```

### 4. Test Game Assignment

Go to: http://localhost:3000/assign-games?condition=ai_aware

You should see 3 randomly selected games:

```json
{
  "games": ["game5.html", "game12.html", "game3.html"],
  "condition": "ai_aware"
}
```

Check the counts again at http://localhost:3000/review-counts - the assigned games should now show count `1`.

## Running Your Experiment

### Local Testing

1. Start the backend server: `npm start`
2. Open `evaluation.html` in a browser
3. The experiment will automatically fetch games from the backend

### For Prolific Deployment

You'll need to deploy the backend to a cloud server so Prolific participants can access it. Options:

#### Option A: Heroku (Easiest)
- Free tier available
- Guide: https://devcenter.heroku.com/articles/deploying-nodejs

#### Option B: Railway
- Free tier available
- Guide: https://railway.app/

#### Option C: Your University Server
- Contact your IT department about hosting a Node.js server

**After deploying**, update `BACKEND_URL` in `evaluation.html`:

```javascript
// Change from:
const BACKEND_URL = 'http://localhost:3000';

// To your deployed URL:
const BACKEND_URL = 'https://your-server.herokuapp.com';
```

## Monitoring Your Experiment

### Check Current Review Counts

While the server is running, visit:
http://localhost:3000/review-counts

This shows how many times each game has been reviewed in each condition.

### Expected Distribution

With 41 participants per condition:
- Most games: 7 reviews
- Some games: 6 reviews
- Total per condition: 41 participants × 3 games = 123 reviews across 18 games

### Manually Adjust Counts (if needed)

If you need to fix a count (e.g., a participant dropped out), use a tool like Postman or curl:

```bash
curl -X POST http://localhost:3000/adjust-count \
  -H "Content-Type: application/json" \
  -d '{
    "condition": "ai_aware",
    "game": "game5.html",
    "count": 6
  }'
```

### Reset All Counts

To start fresh (useful for testing):

```curl -X POST http://localhost:3000/reset-counts -H "Content-Type: application/json"

```

```bash
curl -X POST http://localhost:3000/reset-counts
```

Or visit in browser: http://localhost:3000/reset-counts (will show error, but still works)

## Troubleshooting

### "Error connecting to server" in experiment

**Problem**: Backend server is not running or frontend can't reach it.

**Solution**:
1. Make sure backend server is running (`npm start`)
2. Check that `BACKEND_URL` in `evaluation.html` matches your server address
3. Check browser console (F12) for CORS errors

### Games not balanced

**Problem**: Some games have many more reviews than others.

**Possible causes**:
1. Participants abandoned the study (backend increments counts immediately)
2. You tested the experiment many times

**Solution**: Use the `/review-counts` endpoint to monitor, and `/adjust-count` to fix imbalances if needed

### Want to use different game files

**Problem**: Your games are named differently or located elsewhere.

**Solution**: Edit `game-assignment-server.js` line 17-24 to match your game files:

```javascript
for (let i = 1; i <= 18; i++) {
  const gameName = `game${i}.html`;  // Change naming pattern here
  initialData.ai_aware[gameName] = 0;
  initialData.ai_blind[gameName] = 0;
}
```

After changing, delete `review-counts.json` and restart the server.

## Data Storage

The server stores review counts in `review-counts.json` in your thesis folder. This file is automatically created and updated.

**Important**: Don't delete this file during your study, or you'll lose track of which games have been assigned!

**Backup**: Periodically copy `review-counts.json` to a safe location, especially during active data collection.

## Files Created

- `game-assignment-server.js` - The backend server code
- `package.json` - Node.js dependencies configuration
- `review-counts.json` - Automatically created to store review counts (don't delete during study!)
- `node_modules/` - Automatically created folder with dependencies (can delete and reinstall)

## Next Steps

1. Replace `game1.html` through `game18.html` with your actual game files
2. Test the full experiment flow locally
3. Deploy backend to a cloud service
4. Update `BACKEND_URL` in `evaluation.html`
5. Test the deployed version
6. Launch on Prolific!

## Questions?

If you encounter issues, check:
1. Terminal output where server is running (shows each assignment)
2. Browser console (F12 → Console tab)
3. `/review-counts` endpoint to verify current state
