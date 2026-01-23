const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// Path to store review counts
const DATA_FILE = path.join(__dirname, 'review-counts.json');

// Initialize review counts file if it doesn't exist
async function initializeData() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    // File doesn't exist, create it with initial counts
    const initialData = {
      ai_aware: {},
      ai_blind: {}
    };

    // Initialize all 18 games with 0 reviews for each condition
    for (let i = 1; i <= 18; i++) {
      const gameName = `game${i}.html`;
      initialData.ai_aware[gameName] = 0;
      initialData.ai_blind[gameName] = 0;
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log('Initialized review counts file');
  }
}

// Read current review counts
async function getReviewCounts() {
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Write updated review counts
async function saveReviewCounts(counts) {
  await fs.writeFile(DATA_FILE, JSON.stringify(counts, null, 2));
}

// Get 3 games with lowest review counts for a given condition
function selectGames(condition, reviewCounts) {
  const counts = reviewCounts[condition];

  // Convert to array of [gameName, count] pairs
  const gameArray = Object.entries(counts);

  // Sort by count (ascending) and then randomize games with same count
  gameArray.sort((a, b) => {
    if (a[1] !== b[1]) {
      return a[1] - b[1]; // Sort by count
    }
    return Math.random() - 0.5; // Randomize if counts are equal
  });

  // Take first 3 games (those with lowest counts)
  const selectedGames = gameArray.slice(0, 3).map(pair => pair[0]);

  // Shuffle the selected games so they're not always in the same order
  return selectedGames.sort(() => Math.random() - 0.5);
}

// Endpoint to get game assignment
app.get('/assign-games', async (req, res) => {
  try {
    const condition = req.query.condition; // 'ai_aware' or 'ai_blind'

    if (!condition || (condition !== 'ai_aware' && condition !== 'ai_blind')) {
      return res.status(400).json({
        error: 'Invalid condition. Must be "ai_aware" or "ai_blind"'
      });
    }

    const reviewCounts = await getReviewCounts();
    const selectedGames = selectGames(condition, reviewCounts);

    // Increment counts for selected games
    selectedGames.forEach(game => {
      reviewCounts[condition][game]++;
    });

    await saveReviewCounts(reviewCounts);

    console.log(`Assigned games for ${condition}:`, selectedGames);
    console.log(`Updated counts for ${condition}:`, reviewCounts[condition]);

    res.json({
      games: selectedGames,
      condition: condition
    });

  } catch (error) {
    console.error('Error assigning games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get current review counts (for monitoring)
app.get('/review-counts', async (req, res) => {
  try {
    const counts = await getReviewCounts();
    res.json(counts);
  } catch (error) {
    console.error('Error getting review counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to manually adjust counts if needed (admin use)
app.post('/adjust-count', async (req, res) => {
  try {
    const { condition, game, count } = req.body;

    if (!condition || !game || count === undefined) {
      return res.status(400).json({
        error: 'Must provide condition, game, and count'
      });
    }

    const reviewCounts = await getReviewCounts();

    if (!reviewCounts[condition] || reviewCounts[condition][game] === undefined) {
      return res.status(400).json({
        error: 'Invalid condition or game name'
      });
    }

    reviewCounts[condition][game] = count;
    await saveReviewCounts(reviewCounts);

    console.log(`Manually adjusted ${game} in ${condition} to ${count}`);

    res.json({
      message: 'Count updated successfully',
      counts: reviewCounts
    });

  } catch (error) {
    console.error('Error adjusting count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to reset all counts (useful for testing)
app.post('/reset-counts', async (req, res) => {
  try {
    const initialData = {
      ai_aware: {},
      ai_blind: {}
    };

    for (let i = 1; i <= 18; i++) {
      const gameName = `game${i}.html`;
      initialData.ai_aware[gameName] = 0;
      initialData.ai_blind[gameName] = 0;
    }

    await saveReviewCounts(initialData);
    console.log('Reset all review counts to 0');

    res.json({
      message: 'All counts reset to 0',
      counts: initialData
    });

  } catch (error) {
    console.error('Error resetting counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
async function startServer() {
  await initializeData();
  app.listen(PORT, () => {
    console.log(`Game assignment server running on http://localhost:${PORT}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET  /assign-games?condition=ai_aware|ai_blind`);
    console.log(`  GET  /review-counts`);
    console.log(`  POST /adjust-count`);
    console.log(`  POST /reset-counts`);
  });
}

startServer();
