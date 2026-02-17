import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Typewriter effect hook
const useTypewriter = (text, speed = 30) => {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayed('');
    setIsComplete(false);
    let i = 0;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, isComplete };
};

// Scene data
const getScenes = (choices) => ({
  intro: {
    id: 'intro',
    background: 'twilight',
    title: 'THE LAST LIGHT',
    text: `November 17th.

After thirty-four years, the lighthouse goes automatic tomorrow.

Tonight, you climb the tower one last time.`,
    prompt: 'Press Enter to begin',
    choices: null,
    next: 'base',
  },
  base: {
    id: 'base',
    background: 'interior-ground',
    text: `The ground floor. Your desk, your coat on its hook, the worn spiral stairs leading up.

A newspaper clipping sits on the desk. The headline reads: "Historic Lighthouse to Go Automated After 127 Years."`,
    choices: [
      {
        label: 'Read the clipping',
        value: 'examined',
        response: `"...the modernization project will save the county an estimated $40,000 annually in staffing costs."

Thirty-four years, reduced to a budget line.

You fold the clipping and slip it into your pocket.`
      },
      {
        label: 'Head for the stairs',
        value: 'ignored',
        response: `No use reading it again. You've memorized every word.

Some things are decided by people who've never seen a storm from the lamp room.`
      },
    ],
    choiceKey: 'newspaper',
    transition: `The stairs wait. They've always waited.`,
    transitionPrompt: 'Press Enter to climb',
    next: 'landing1',
  },
  landing1: {
    id: 'landing1',
    background: 'landing1',
    text: `The first landing. Halfway between the world below and the light above.

A photograph hangs here. You and Elena, 1994. She left three years later—transferred to a station down the coast. You never saw her again.

The photograph is sun-faded now, but her smile isn't.

What do you remember most?`,
    choices: [
      {
        label: 'The storms we weathered together',
        value: 'storms',
        response: `The night the windows cracked. Spray coming through the walls like the sea itself wanted in. Elena, calm as stone, never taking her eyes off the light.

"It stays on," she said. "That's the only thing that matters."

You learned everything that night.`
      },
      {
        label: 'The silence after she left',
        value: 'silence',
        response: `The morning you woke and knew, before you even checked, that her things were gone.

The lighthouse felt larger after. Emptier. The stairs seemed to take longer to climb.

You got used to it. You got used to everything.`
      },
      {
        label: 'Her laugh echoing up the stairs',
        value: 'laugh',
        response: `She laughed like the gulls—sudden, bright, impossible to ignore.

Sometimes, in the quiet moments, you swear you can still hear it.

Some sounds live in walls forever.`
      },
    ],
    choiceKey: 'memory',
    transitionPrompt: 'Press Enter to continue climbing',
    next: 'landing2',
  },
  landing2: {
    id: 'landing2',
    background: 'landing2',
    text: `The storage landing. Logbooks dating back to 1897.

Thousands of nights, recorded in careful handwriting. Storm reports. Ship sightings. The small observations of people who spent their lives watching the water.

One book lies open: your first entry.

"Day 1. The light is my responsibility now. I will not let it go dark."

You never did. Not once in thirty-four years.

Tomorrow, a computer will write the logs. It won't know what the words mean.

What will your final entry say?`,
    choices: [
      {
        label: '"The light endures, even without me."',
        value: 'acceptance',
        response: `Humble words for a humble job. You were never the point—the light was. And the light will keep shining.

That's enough. It has to be enough.`
      },
      {
        label: '"They cannot automate what this place means."',
        value: 'defiance',
        response: `Let them try to replace you. Let them fill these rooms with wires and sensors.

They'll never replicate what it means to choose, every single night, to keep the light burning.`
      },
      {
        label: '"To whoever reads this: the sea remembers."',
        value: 'poetry',
        response: `The sea has seen a thousand keepers come and go. It will see a thousand more.

But it remembers. The water holds everything.`
      },
    ],
    choiceKey: 'logEntry',
    transition: 'One more flight.',
    transitionPrompt: 'Press Enter to reach the lamp room',
    next: 'lamp',
  },
  lamp: {
    id: 'lamp',
    background: 'lamp',
    text: `The lamp room.

The lens looms above you, cold and dark. Beyond the windows, the last light drains from the sky. The horizon is a line of ink.

Out there, a ship. A small light, blinking.

Someone is waiting for you to do your job.

The switch is cold under your hand.

One last time.`,
    prompt: 'Press SPACE to light the lamp',
    choices: null,
    next: 'epilogue',
  },
  epilogue: {
    id: 'epilogue',
    background: 'epilogue',
    text: getEpilogueText(choices.logEntry),
    ending: true,
  },
});

const getEpilogueText = (logChoice) => {
  const endings = {
    acceptance: `The light will shine tomorrow, and the day after, and every night until the sea itself is gone.

It doesn't need Marlowe anymore. Perhaps it never did.

But tonight—this moment, this sweep of gold across dark water—this belongs to you alone.

The ship's light blinks once. An acknowledgment.

You watch until the sun rises.`,
    defiance: `Machines can flip switches. They can log data and send reports.

They cannot feel the weight of a thousand saved vessels, a hundred storm-lashed nights, the quiet pride of a job done well in a world that forgot you existed.

Let them try to automate that.

The ship passes safely, as they always have.

As they always will, because of people like you.`,
    poetry: `Somewhere out there, a sailor looks up. They see the light cutting through the dark, guiding them home.

They'll never know this was the last night a human hand turned it on.

But the sea knows.

The sea always knows.`,
  };

  return endings[logChoice] || endings.acceptance;
};

function App() {
  const [gameState, setGameState] = useState({
    currentScene: 'intro',
    selectedChoice: 0,
    choices: {
      newspaper: null,
      memory: null,
      logEntry: null,
    },
    showResponse: false,
    showTransition: false,
    transitioning: false,
    lightIgnited: false,
  });

  const scenes = getScenes(gameState.choices);
  const currentScene = scenes[gameState.currentScene];

  // Determine what text to show
  const getDisplayText = () => {
    if (gameState.showResponse && currentScene.choices) {
      const selectedChoice = currentScene.choices[gameState.selectedChoice];
      return selectedChoice.response;
    }
    if (gameState.showTransition && currentScene.transition) {
      return currentScene.transition;
    }
    return currentScene.text;
  };

  const displayText = getDisplayText();
  const { displayed, isComplete } = useTypewriter(displayText, 20);

  const handleChoice = useCallback(() => {
    if (!isComplete) return;

    const scene = scenes[gameState.currentScene];

    if (scene.choices && !gameState.showResponse) {
      // Record the choice
      const selectedChoice = scene.choices[gameState.selectedChoice];
      setGameState(prev => ({
        ...prev,
        choices: {
          ...prev.choices,
          [scene.choiceKey]: selectedChoice.value,
        },
        showResponse: true,
      }));
    } else if (gameState.showResponse && !gameState.showTransition && scene.transition) {
      // Show transition text
      setGameState(prev => ({
        ...prev,
        showResponse: false,
        showTransition: true,
      }));
    } else {
      // Move to next scene
      if (gameState.currentScene === 'lamp') {
        // Special handling for lamp ignition
        setGameState(prev => ({
          ...prev,
          lightIgnited: true,
          transitioning: true,
        }));
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentScene: scene.next,
            transitioning: false,
            lightIgnited: false,
          }));
        }, 2500);
      } else {
        setGameState(prev => ({
          ...prev,
          currentScene: scene.next,
          selectedChoice: 0,
          showResponse: false,
          showTransition: false,
          transitioning: true,
        }));
        setTimeout(() => {
          setGameState(prev => ({ ...prev, transitioning: false }));
        }, 1200);
      }
    }
  }, [isComplete, gameState, scenes]);

  const handleMoveSelection = useCallback((direction) => {
    const scene = scenes[gameState.currentScene];
    if (!scene.choices || gameState.showResponse || gameState.showTransition) return;

    setGameState(prev => {
      const maxIndex = scene.choices.length - 1;
      let newIndex = prev.selectedChoice + direction;

      if (newIndex < 0) newIndex = maxIndex;
      if (newIndex > maxIndex) newIndex = 0;

      return { ...prev, selectedChoice: newIndex };
    });
  }, [gameState, scenes]);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState.transitioning) return;

      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMoveSelection(-1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMoveSelection(1);
          break;
        case 'Enter':
          e.preventDefault();
          if (gameState.currentScene !== 'lamp') {
            handleChoice();
          }
          break;
        case ' ':
          e.preventDefault();
          handleChoice();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleChoice, handleMoveSelection]);

  const showChoices = currentScene.choices && !gameState.showResponse && !gameState.showTransition && isComplete;
  const showPrompt = !currentScene.choices || gameState.showResponse || gameState.showTransition;

  return (
    <div className={`game-container ${currentScene.background} ${gameState.transitioning ? 'scene-transition' : ''} ${gameState.lightIgnited ? 'igniting' : ''}`}>
      {/* Background layer with lighthouse */}
      <div className="background-layer">
        <div className="lighthouse-silhouette"></div>
        {gameState.currentScene === 'epilogue' && (
          <div className="lamp-glow"></div>
        )}
      </div>

      {/* Text container */}
      <div className="text-container">
        {currentScene.title && (
          <h1 className="scene-title">{currentScene.title}</h1>
        )}

        <div className="narrative-text">
          {displayed.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* Choices */}
        {showChoices && (
          <div className="choices-container">
            {currentScene.choices.map((choice, index) => (
              <div
                key={index}
                className={`choice ${gameState.selectedChoice === index ? 'selected' : ''}`}
              >
                {choice.label}
              </div>
            ))}
          </div>
        )}

        {/* Prompt */}
        {showPrompt && isComplete && (
          <div className="prompt">
            {gameState.showTransition && currentScene.transitionPrompt
              ? currentScene.transitionPrompt
              : currentScene.prompt || 'Press Enter to continue'}
          </div>
        )}

        {/* Ending screen */}
        {currentScene.ending && isComplete && (
          <div className="ending-notice">
            <p className="ending-title">THE LAST LIGHT</p>
            <p className="ending-subtitle">A game about endings.</p>
          </div>
        )}
      </div>

      {/* Input hint */}
      {!currentScene.ending && (
        <div className="input-hint">
          {currentScene.choices && !gameState.showResponse && !gameState.showTransition
            ? '↑↓ to choose • Enter to continue'
            : currentScene.id === 'lamp'
            ? 'SPACE to light the lamp'
            : 'Enter to continue'}
        </div>
      )}
    </div>
  );
}

export default App;
