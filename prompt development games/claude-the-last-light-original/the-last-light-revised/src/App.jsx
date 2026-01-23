import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Typewriter effect hook
const useTypewriter = (text, speed = 25) => {
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

// Scene data with revised narrative
const getScenes = (choices) => ({
  intro: {
    id: 'intro',
    background: 'base',
    title: 'THE LAST LIGHT',
    text: `You've been here before.

The stairs. The lamp. The sea outside that never moves.

Tonight feels different. Tonight feels final.`,
    prompt: 'Press Enter to begin',
    choices: null,
    next: 'base',
  },
  base: {
    id: 'base',
    background: 'base',
    text: `The last night. You've done this before. Climbed these stairs. You'll do it one more time.

The ground floor. Your desk, your coat on its hook, the worn spiral stairs leading up.

A newspaper clipping sits on the desk. The headline reads: "Historic Lighthouse to Go Automated."

There is no date. You can't remember when you cut this out.`,
    choices: [
      {
        label: 'Examine the newspaper',
        value: 'examined',
        response: `The words blur as you try to focus on them. "Historic Lighthouse to Go Automated."

Was it recent? It feels like it's always been here.

Like you've always been here.`
      },
      {
        label: 'Proceed to the stairs',
        value: 'ignored',
        response: `You've read it a hundred times. A thousand.

The words don't change.

Nothing changes.`
      },
    ],
    choiceKey: 'newspaper',
    transition: `The stairs wait.

They've always waited.`,
    transitionPrompt: 'Press Enter to climb',
    next: 'landing1',
  },
  landing1: {
    id: 'landing1',
    background: 'landing1',
    text: `The first landing. Halfway between the world below and the light above.

A photograph hangs here. You and Elena.

Elena. You remember her name before you remember her face. That's wrong, isn't it?

You should remember her face.

But when you look directly at it, your eyes keep sliding off.

What do you remember?`,
    choices: [
      {
        label: 'We kept the light on through the storm of \'91',
        value: 'partnership',
        response: `The storm. Rain like nails against the windows. Elena, steady as stone.

"It stays on," she said. "That's the only thing that matters."

The memory feels real. But when was '91? How long ago?`
      },
      {
        label: 'The morning she didn\'t wake up',
        value: 'death',
        response: `The morning she didn't wake up.

You called for help, but the radio was dead. The storm had taken the lines. By the time anyone came...

The sea took her. That's what they said.

But she never left the lighthouse. Neither did you.`
      },
      {
        label: 'I don\'t remember. I can\'t remember',
        value: 'forgotten',
        response: `You can't remember her face. Can't remember her voice.

Just the weight of her absence.

And the knowledge that you're supposed to remember more than this.

Something is wrong. Something has always been wrong.`
      },
    ],
    choiceKey: 'memory',
    transitionPrompt: 'Press Enter to continue climbing',
    next: 'landing2',
  },
  landing2: {
    id: 'landing2',
    background: 'landing2',
    text: `The storage landing. Logbooks dating back to... wait.

1897. 1923. 1954. 2019. 2047. 2089.

The dates don't make sense. Some of these books shouldn't exist yet.

You pull one at random. Your handwriting fills the pages.

"Day 1. The light is my responsibility now."

You flip forward. The same words again. Your current handwriting.

And again. And again.

How many first days have there been?`,
    choices: [
      {
        label: 'It\'s time to go',
        value: 'acceptance',
        response: `You write it carefully in a book that doesn't exist yet:

"It's time to go."

The words feel like a key turning in a lock.

Like permission you've been waiting for.`
      },
      {
        label: 'I\'m not finished. I\'ll never be finished',
        value: 'refusal',
        response: `Your pen hovers over the page.

"I'm not finished."

But you are. You have been for a long time.

The light has kept you here. The duty. The unwillingness to let go.`
      },
      {
        label: 'I was here. That\'s all that matters',
        value: 'peace',
        response: `"I was here."

Simple words. True ones.

You existed. You kept the light burning. Someone knew.

That has to be enough.`
      },
    ],
    choiceKey: 'logEntry',
    transition: `The stairs stretch up.

One more flight.

The last flight.`,
    transitionPrompt: 'Press Enter to reach the lamp room',
    next: 'lamp',
  },
  lamp: {
    id: 'lamp',
    background: 'lamp',
    text: `The lamp room.

Outside the windows: nothing.

Not darkness. Not the sea. Nothing. A blank white void where the world should be.

The world has ended. Or perhaps it never existed beyond these walls.

A figure stands by the far window. You can't make out their face. But they aren't frightening.

They feel like someone you've been waiting to meet.

The light has kept you here. All these years. All these impossible nights.

As long as it burns, you have a reason to stay.

The figure gestures to the switch.

The switch is cold under your hand.

One last time.`,
    prompt: 'Press SPACE to extinguish the light',
    choices: null,
    requiresSpace: true,
    next: 'epilogue',
  },
  epilogue: {
    id: 'epilogue',
    background: 'epilogue',
    text: getEpilogueText(choices.logEntry, choices.finalChoice),
    ending: true,
    canRestart: choices.finalChoice === 'refuse',
  },
  trapped: {
    id: 'trapped',
    background: 'base',
    text: `The light flickers on. It always does.

You descend the stairs. You'll sleep—or whatever it is you do now.

Tomorrow, you'll climb again. You'll see Elena's photograph and almost remember. You'll read the logbooks and not question the dates.

The light must be kept.

The light will always be kept.

Until you're ready.`,
    prompt: 'Press SPACE to climb again',
    ending: true,
    isLoop: true,
  },
});

const getEpilogueText = (logChoice, finalChoice) => {
  if (finalChoice === 'refuse') {
    return `The light flickers on. It always does.

You descend the stairs. You'll sleep—or whatever it is you do now.

Tomorrow, you'll climb again.`;
  }

  const endings = {
    acceptance: `The light goes out. The lighthouse sighs—a sound like relief.

You remember now. All of it. The storm. The fall. The water filling your lungs.

Thirty-four years? No. Just one night, stretched into eternity by a soul that couldn't let go.

Elena is waiting. She's been waiting.

The new light is warm. You step toward it.

You're ready.`,
    refusal: `The light goes out. And against every part of you that screamed to hold on—

You let it.

The lighthouse crumbles. Not violently—gently. Like sand. Like memory.

You thought you were the keeper. You were the kept.

Free now. Finally free.

Whatever comes next, it won't be a tower. It won't be stairs.

It will be something new.`,
    peace: `The light goes out.

For a moment, nothing. Then:

The beam sweeps one last time—not from the lamp, but from somewhere else. Somewhere you can't see. A lighthouse on another shore, answering your signal.

You were here. You mattered. Someone knew.

The figure takes your hand. You realize it was never a stranger.

It was you. The part of you that knew it was time.

You leave together.`,
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
      finalChoice: null,
    },
    showResponse: false,
    showTransition: false,
    transitioning: false,
    lightExtinguished: false,
    waitTimer: 0,
    loopCount: 0,
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

  // Timer for trapped ending (15 seconds of no action in lamp room)
  useEffect(() => {
    if (gameState.currentScene === 'lamp' && isComplete && !gameState.transitioning) {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          waitTimer: prev.waitTimer + 1,
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.currentScene, isComplete, gameState.transitioning]);

  // Trigger trapped ending after 15 seconds
  useEffect(() => {
    if (gameState.waitTimer >= 15 && gameState.currentScene === 'lamp') {
      setGameState(prev => ({
        ...prev,
        choices: {
          ...prev.choices,
          finalChoice: 'refuse',
        },
        currentScene: 'trapped',
        transitioning: true,
        waitTimer: 0,
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, transitioning: false }));
      }, 1200);
    }
  }, [gameState.waitTimer, gameState.currentScene]);

  const handleChoice = useCallback(() => {
    if (!isComplete) return;

    const scene = scenes[gameState.currentScene];

    // Handle trapped ending loop
    if (scene.isLoop) {
      setGameState(prev => ({
        ...prev,
        currentScene: 'intro',
        selectedChoice: 0,
        showResponse: false,
        showTransition: false,
        transitioning: true,
        loopCount: prev.loopCount + 1,
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, transitioning: false }));
      }, 1200);
      return;
    }

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
        // Special handling for lamp extinguishment
        setGameState(prev => ({
          ...prev,
          lightExtinguished: true,
          transitioning: true,
          choices: {
            ...prev.choices,
            finalChoice: 'extinguish',
          },
          waitTimer: 0,
        }));
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentScene: scene.next,
            transitioning: false,
          }));
        }, 3000); // Longer pause for darkness
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
          if (!currentScene.requiresSpace) {
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
  }, [gameState, handleChoice, handleMoveSelection, currentScene]);

  const showChoices = currentScene.choices && !gameState.showResponse && !gameState.showTransition && isComplete;
  const showPrompt = !currentScene.choices || gameState.showResponse || gameState.showTransition;

  // Signal to parent window (jsPsych) when game is complete
  useEffect(() => {
    if (currentScene.ending && isComplete) {
      // Wait a few seconds for player to read ending, then signal completion
      const timer = setTimeout(() => {
        if (window.parent !== window) {
          // Send game completion data to parent
          window.parent.postMessage({
            type: 'game_complete',
            data: {
              choices: gameState.choices,
              loopCount: gameState.loopCount,
              completedAt: new Date().toISOString()
            }
          }, '*');
        }
      }, 8000); // 8 seconds to read the ending

      return () => clearTimeout(timer);
    }
  }, [currentScene.ending, isComplete, gameState.choices, gameState.loopCount]);

  return (
    <div className={`game-container ${currentScene.background} ${gameState.transitioning ? 'scene-transition' : ''} ${gameState.lightExtinguished ? 'extinguishing' : ''} ${gameState.loopCount > 0 ? 'looping' : ''}`}>
      {/* Background layer */}
      <div className="background-layer">
        {gameState.currentScene === 'lamp' && (
          <div className="mysterious-figure"></div>
        )}
        {(gameState.currentScene === 'epilogue' && gameState.choices.finalChoice === 'extinguish') && (
          <div className="new-light"></div>
        )}
      </div>

      {/* Text container */}
      <div className="text-container">
        {currentScene.title && (
          <h1 className="scene-title">{currentScene.title}</h1>
        )}

        <div className={`narrative-text ${currentScene.id === 'landing2' ? 'glitch-text' : ''}`}>
          {displayed.split('\n').map((line, i) => (
            <p key={i} className={currentScene.id === 'lamp' && line.includes('void') ? 'surreal-text' : ''}>
              {line}
            </p>
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

        {/* Timer warning for lamp room */}
        {gameState.currentScene === 'lamp' && gameState.waitTimer > 10 && gameState.waitTimer < 15 && (
          <div className="timer-warning">
            You hesitate...
          </div>
        )}

        {/* Ending screen */}
        {currentScene.ending && isComplete && !currentScene.isLoop && (
          <div className="ending-notice">
            <p className="ending-title">THE LAST LIGHT</p>
            {gameState.choices.finalChoice === 'extinguish' && (
              <p className="ending-subtitle">You are free.</p>
            )}
          </div>
        )}
      </div>

      {/* Input hint */}
      {!currentScene.ending && (
        <div className="input-hint">
          {currentScene.choices && !gameState.showResponse && !gameState.showTransition
            ? '↑↓ to choose • Enter to continue'
            : currentScene.requiresSpace
            ? 'SPACE to extinguish the light'
            : 'Enter to continue'}
        </div>
      )}
    </div>
  );
}

export default App;
