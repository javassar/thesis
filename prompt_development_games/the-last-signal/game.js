// ============================================================================
// THE LAST SIGNAL - Game Logic
// ============================================================================

// Game State
const gameState = {
    currentScene: 'intro',
    frequency: 88.0,
    targetFrequency: 107.7,
    secretFrequency: 107.3,
    signalLocked: false,
    dialogueFlags: {
        believedSignal: false,
        discoveredSecretFreq: false,
        heardProof: false,
        choicePath: null, // 'believe' or 'doubt'
        finalChoice: null // 'leave' or 'stay'
    },
    morseProgress: 0,
    morseTarget: 'FIRE',
    morseInput: '',
    timeElapsed: 0,
    ending: null,
    currentDialogueIndex: 0,
    // New creative mechanics
    trustLevel: 50, // 0-100, affects signal stability
    realityFragmentation: 0, // increases with paradoxes
    hasHeardOwnVoice: false,
    staticPatternsSeen: [],
    frequencyDrift: 0, // signal moves based on choices
    temporalEchoes: [] // past dialogue fragments that repeat
};

// Audio Management
const audio = {
    staticHeavy: null,
    staticLight: null,
    morseBeep: null,
    ambient: null,
    currentStatic: null,

    init() {
        // Create synthetic audio since we don't have actual files
        this.createSyntheticAudio();
    },

    createSyntheticAudio() {
        // Create audio context for synthetic sounds
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        this.audioContext = new AudioContext();
        this.staticGain = this.audioContext.createGain();
        this.staticGain.connect(this.audioContext.destination);
        this.staticGain.gain.value = 0;
    },

    playStatic(intensity) {
        if (!this.audioContext) return;

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create white noise
        if (!this.noiseNode) {
            const bufferSize = 4096;
            this.noiseNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

            this.noiseNode.onaudioprocess = (e) => {
                const output = e.outputBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
            };

            this.noiseNode.connect(this.staticGain);
        }

        // Adjust volume based on intensity (0-1)
        this.staticGain.gain.value = intensity * 0.1; // Keep it quiet
    },

    stopStatic() {
        if (this.staticGain) {
            this.staticGain.gain.value = 0;
        }
    },

    playMorseBeep(duration) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
};

// Dialogue System
const dialogue = {
    scenes: {
        intro: [
            { text: "Static fills the room. The VU meter flickers.", delay: 2000 }
        ],
        tuning: [
            { text: "You hear fragments through the noise... voices...", delay: 1000 }
        ],
        firstContact: [
            { text: "...hello? Is anyone there? Please... I need to know if this is getting through.", speaker: "SIGNAL", delay: 2000 },
            { text: "Oh thank god. Thank god. Listen to me carefully—what's today's date? Is it still December 14th?", speaker: "SIGNAL", delay: 1500 },
            {
                text: "",
                choices: [
                    { text: '[1] "Yes, it\'s the 14th. Who is this?"', value: 'respond_yes' },
                    { text: '[2] "I\'m not authorized to share that information."', value: 'respond_no' },
                    { text: '[3] [Stay silent]', value: 'silent' }
                ]
            }
        ],
        response_yes: [
            { text: "Before midnight? Please tell me it's before midnight.", speaker: "SIGNAL", delay: 1500 },
            { text: '"It\'s 11:48 PM. Identify yourself."', speaker: "YOU", delay: 1000 },
            { text: "There's no time to explain properly. You need to check the generator room. The auxiliary fuel line—there's a crack. In three days, it's going to spark. Everyone is going to die.", speaker: "SIGNAL", delay: 2000 },
            { text: "[You notice the voice has the same cadence as your own thoughts]", delay: 1500, meta: true }
        ],
        response_no: [
            { text: "It doesn't matter. Regulations don't matter. You need to listen to me. The generator room—", speaker: "SIGNAL", delay: 2000 }
        ],
        silent: [
            { text: "I know you're there. I can hear you breathing. Please. This is life or death.", speaker: "SIGNAL", delay: 2000 }
        ],
        beforeMorse: [
            { text: "The signal's degrading. I'm going to send coordinates in Morse. Write this down.", speaker: "SIGNAL", delay: 1500 }
        ],
        afterMorse: [
            { text: "Did you get it? Tell me you got it.", speaker: "SIGNAL", delay: 1000 },
            {
                text: "",
                choices: [
                    { text: '[1] "Fire. I got it. How do you know about this?"', value: 'believe' },
                    { text: '[2] "This is insane. Who put you up to this?"', value: 'doubt' }
                ]
            }
        ],
        proof_doubt: [
            { text: "You want proof? Fine. Your dog when you were eight. Barnaby. Brown and white. Hit by a mail truck on your birthday.", speaker: "SIGNAL", delay: 2500 },
            { text: "The last thing your father said to you before you shipped out: 'Don't be a hero.' I know because I'm you, Sam. I'm you, three days from now, and I watched everyone burn because I didn't listen.", speaker: "SIGNAL", delay: 3000 }
        ],
        instructions_believe: [
            { text: "The fuel line is behind the secondary panel. You need a wrench—there's one in the utility closet. Tighten the coupling. That's all it takes.", speaker: "SIGNAL", delay: 2500 },
            { text: "The storm will knock out main power at 11:52. When the generator kicks in, if that line is still cracked... I can't watch it happen again.", speaker: "SIGNAL", delay: 2500 }
        ],
        finalChoice: [
            { text: "[Static increasing] The signal's... can't hold... much longer. You have to go NOW. Don't make my mistake. Don't—", speaker: "SIGNAL", delay: 2000 },
            { text: "[SIGNAL LOST]", delay: 1000 },
            {
                text: "",
                choices: [
                    { text: '[1] Leave the radio. Go check the generator.', value: 'leave' },
                    { text: '[2] Stay. Try to re-establish contact.', value: 'stay' }
                ]
            }
        ],
        secretFrequency: [
            { text: "You're receiving the signal, aren't you? Don't trust it.", speaker: "OTHER VOICE", delay: 2000 },
            { text: "That voice isn't you. It's something else. Something that got into the wires during the '58 test.", speaker: "OTHER VOICE", delay: 2500 },
            { text: "There is no future version of you. There's only the Pattern. And it wants you to leave your post.", speaker: "OTHER VOICE", delay: 2500 },
            { text: "Stay at the radio. No matter what happens. Stay at the radio.", speaker: "OTHER VOICE", delay: 2000 },
            { text: "[The voice fades into static]", delay: 1500 }
        ]
    },

    currentSequence: [],
    currentIndex: 0,

    startSequence(sceneName) {
        this.currentSequence = this.scenes[sceneName] || [];
        this.currentIndex = 0;
        this.showNext();
    },

    showNext() {
        if (this.currentIndex >= this.currentSequence.length) {
            this.onSequenceComplete();
            return;
        }

        const line = this.currentSequence[this.currentIndex];
        const dialogueEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('choices-container');

        // Clear previous content
        choicesEl.innerHTML = '';

        if (line.choices) {
            // Show choices
            this.showChoices(line.choices);
        } else {
            // Show dialogue text
            const p = document.createElement('p');
            if (line.speaker) {
                p.innerHTML = `<strong>${line.speaker}:</strong> ${line.text}`;
            } else {
                p.textContent = line.text;
            }
            dialogueEl.appendChild(p);

            // Auto-advance after delay
            setTimeout(() => {
                this.currentIndex++;
                this.showNext();
            }, line.delay || 2000);
        }
    },

    showChoices(choices) {
        const choicesEl = document.getElementById('choices-container');

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.onclick = () => this.selectChoice(choice.value);
            choicesEl.appendChild(button);
        });
    },

    selectChoice(value) {
        const choicesEl = document.getElementById('choices-container');
        choicesEl.innerHTML = '';

        // Creative mechanic: choices affect trust and reality
        if (value === 'believe') {
            gameState.trustLevel += 30;
            gameState.realityFragmentation -= 10;
        } else if (value === 'doubt') {
            gameState.trustLevel -= 30;
            gameState.realityFragmentation += 20;
            // Doubting causes frequency drift
            gameState.frequencyDrift += 0.5;
        } else if (value === 'silent') {
            gameState.realityFragmentation += 10;
        }

        // Handle different choice outcomes
        if (value === 'respond_yes' || value === 'respond_no' || value === 'silent') {
            dialogue.startSequence(value);
            setTimeout(() => {
                dialogue.startSequence('beforeMorse');
                setTimeout(() => {
                    game.startMorseSequence();
                }, 3000);
            }, 4000);
        } else if (value === 'believe') {
            gameState.dialogueFlags.choicePath = 'believe';
            dialogue.startSequence('instructions_believe');
            setTimeout(() => {
                // Add temporal echo before final choice
                if (gameState.realityFragmentation > 15) {
                    game.showTemporalEcho();
                }
                dialogue.startSequence('finalChoice');
            }, 6000);
        } else if (value === 'doubt') {
            gameState.dialogueFlags.choicePath = 'doubt';
            dialogue.startSequence('proof_doubt');
            setTimeout(() => {
                // High reality fragmentation creates signal instability
                if (gameState.realityFragmentation > 30) {
                    game.causeSignalInterference();
                }
                dialogue.startSequence('finalChoice');
            }, 7000);
        } else if (value === 'leave') {
            gameState.dialogueFlags.finalChoice = 'leave';
            game.showEnding('A');
        } else if (value === 'stay') {
            gameState.dialogueFlags.finalChoice = 'stay';
            // Creative mechanic: extreme fragmentation unlocks secret ending D
            if (gameState.realityFragmentation > 40) {
                game.showEnding('D');
            } else if (gameState.dialogueFlags.discoveredSecretFreq) {
                game.showEnding('C');
            } else {
                game.showEnding('B');
            }
        }
    },

    onSequenceComplete() {
        // Handle sequence completion if needed
    },

    clear() {
        document.getElementById('dialogue-text').innerHTML = '';
        document.getElementById('choices-container').innerHTML = '';
    }
};

// Morse Code System
const morse = {
    codes: {
        'F': '..-.',
        'I': '..',
        'R': '.-.',
        'E': '.'
    },

    playMorseCode(letter) {
        const code = this.codes[letter];
        if (!code) return;

        let delay = 0;
        for (let symbol of code) {
            setTimeout(() => {
                if (symbol === '.') {
                    audio.playMorseBeep(0.1);
                } else {
                    audio.playMorseBeep(0.3);
                }
            }, delay);

            delay += symbol === '.' ? 200 : 400;
        }

        return delay;
    },

    displayCode(letter) {
        const tape = document.getElementById('morse-tape');
        const code = this.codes[letter];
        tape.textContent += code + '  ';
    }
};

// Main Game Controller
const game = {
    init() {
        console.log('Initializing The Last Signal...');
        audio.init();
        this.setupEventListeners();
        this.showScreen('intro');
    },

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Prevent default arrow key scrolling
        window.addEventListener('keydown', (e) => {
            if(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    },

    handleKeyPress(e) {
        const key = e.key;

        // Intro screen - Space to start
        if (gameState.currentScene === 'intro' && key === ' ') {
            this.startGame();
            return;
        }

        // Tuning controls
        if (gameState.currentScene === 'tuning') {
            if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
                this.adjustFrequency(-0.1);
            } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
                this.adjustFrequency(0.1);
            }
        }

        // Number key choice selection
        if (gameState.currentScene === 'dialogue') {
            const choiceButtons = document.querySelectorAll('.choice-button');
            if (choiceButtons.length > 0) {
                if (key === '1' && choiceButtons[0]) {
                    choiceButtons[0].click();
                } else if (key === '2' && choiceButtons[1]) {
                    choiceButtons[1].click();
                } else if (key === '3' && choiceButtons[2]) {
                    choiceButtons[2].click();
                }
            }
        }

        // Morse code input
        if (gameState.currentScene === 'morse') {
            if (key === 'h' || key === 'H') {
                document.getElementById('morse-reference').classList.remove('hidden');
            } else if (/^[A-Za-z]$/.test(key)) {
                this.handleMorseInput(key.toUpperCase());
            }
        }

        // Ending screen - R to replay
        if (gameState.currentScene === 'ending' && (key === 'r' || key === 'R')) {
            this.resetGame();
        }
    },

    showScreen(screenName) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        setTimeout(() => {
            const targetScreen = document.getElementById(`${screenName}-screen`);
            if (targetScreen) {
                targetScreen.classList.add('active');
            }
        }, 100);
    },

    startGame() {
        console.log('Starting game...');
        gameState.currentScene = 'tuning';
        this.showScreen('game');

        // Start static sound
        audio.playStatic(1.0);

        // Turn on indicator light
        document.getElementById('indicator-light').classList.add('on');

        // Show tutorial
        document.getElementById('tutorial').classList.remove('hidden');

        // Start dialogue
        setTimeout(() => {
            dialogue.startSequence('tuning');
        }, 2000);

        // Start clock
        this.updateClock();
    },

    adjustFrequency(delta) {
        gameState.frequency = Math.max(0, Math.min(150, gameState.frequency + delta));
        gameState.frequency = Math.round(gameState.frequency * 10) / 10;

        // Update display
        document.getElementById('frequency-number').textContent = gameState.frequency.toFixed(1);

        // Update dial needle position (0-150 maps to 10px-570px)
        const needlePos = ((gameState.frequency / 150) * 560) + 10;
        document.getElementById('dial-needle').style.left = needlePos + 'px';

        // Calculate signal strength
        this.updateSignalStrength();
    },

    updateSignalStrength() {
        const targetFreq = gameState.signalLocked ? gameState.targetFrequency :
                          (gameState.dialogueFlags.discoveredSecretFreq ? gameState.targetFrequency : gameState.targetFrequency);

        let distance = Math.abs(gameState.frequency - gameState.targetFrequency);
        let secretDistance = Math.abs(gameState.frequency - gameState.secretFrequency);

        // Check for secret frequency first
        if (secretDistance < 0.3 && !gameState.dialogueFlags.discoveredSecretFreq && gameState.currentScene === 'tuning') {
            gameState.dialogueFlags.discoveredSecretFreq = true;
            this.lockSignal(gameState.secretFrequency);
            dialogue.clear();
            dialogue.startSequence('secretFrequency');
            setTimeout(() => {
                gameState.signalLocked = false;
                dialogue.clear();
            }, 12000);
            return;
        }

        // Check for main signal lock
        if (distance < 0.3 && !gameState.signalLocked) {
            this.lockSignal(gameState.targetFrequency);
            return;
        }

        // Update VU meter based on proximity
        let strength = Math.max(0, 1 - (distance / 10));
        strength = Math.pow(strength, 2); // Non-linear falloff

        document.getElementById('vu-meter-fill').style.width = (strength * 100) + '%';

        // Adjust static intensity
        audio.playStatic(1 - strength);
    },

    lockSignal(frequency) {
        console.log('Signal locked at', frequency);
        gameState.signalLocked = true;
        gameState.currentScene = 'dialogue';

        // Hide tutorial
        document.getElementById('tutorial').classList.add('hidden');

        // Reduce static
        audio.playStatic(0.2);

        // Start first contact dialogue
        setTimeout(() => {
            dialogue.clear();
            dialogue.startSequence('firstContact');
        }, 1000);
    },

    startMorseSequence() {
        console.log('Starting Morse sequence...');
        gameState.currentScene = 'morse';
        gameState.morseInput = '';

        // Show morse display
        document.getElementById('morse-display').classList.remove('hidden');
        document.getElementById('morse-tape').textContent = '';
        document.getElementById('morse-user-input').textContent = '';

        // Creative mechanic: if reality is fragmented, add glitch characters
        let delay = 0;
        const letters = ['F', 'I', 'R', 'E'];

        letters.forEach((letter, index) => {
            setTimeout(() => {
                morse.displayCode(letter);
                morse.playMorseCode(letter);

                // Add temporal glitches if reality is fragmented
                if (gameState.realityFragmentation > 20 && Math.random() > 0.5) {
                    setTimeout(() => {
                        const tape = document.getElementById('morse-tape');
                        const currentText = tape.textContent;
                        tape.textContent = currentText + ' [?] ';
                        tape.style.animation = 'glitch 0.3s';
                        setTimeout(() => {
                            tape.style.animation = '';
                        }, 300);
                    }, 200);
                }
            }, delay);
            delay += 1500;
        });

        // Show reference hint after a delay
        setTimeout(() => {
            document.getElementById('morse-reference').classList.remove('hidden');
        }, 8000);
    },

    handleMorseInput(letter) {
        gameState.morseInput += letter;
        document.getElementById('morse-user-input').textContent = gameState.morseInput;

        // Check if complete
        if (gameState.morseInput.length >= gameState.morseTarget.length) {
            if (gameState.morseInput === gameState.morseTarget) {
                // Correct!
                setTimeout(() => {
                    document.getElementById('morse-display').classList.add('hidden');
                    gameState.currentScene = 'dialogue'; // Allow choice selection
                    dialogue.clear();
                    dialogue.startSequence('afterMorse');
                }, 1000);
            } else {
                // Wrong - reset
                setTimeout(() => {
                    gameState.morseInput = '';
                    document.getElementById('morse-user-input').textContent = '';
                    document.getElementById('morse-tape').textContent = 'INCORRECT - TRY AGAIN  ';
                    setTimeout(() => {
                        document.getElementById('morse-tape').textContent = '';
                        this.startMorseSequence();
                    }, 2000);
                }, 500);
            }
        }
    },

    showEnding(endingType) {
        console.log('Showing ending:', endingType);
        gameState.currentScene = 'ending';
        gameState.ending = endingType;

        audio.stopStatic();
        this.showScreen('ending');

        const endingText = document.getElementById('ending-text');
        endingText.innerHTML = '';

        let lines = [];

        // Creative twist: endings change based on trust level and reality fragmentation
        const highTrust = gameState.trustLevel > 60;
        const lowTrust = gameState.trustLevel < 40;
        const fragmented = gameState.realityFragmentation > 25;

        if (endingType === 'A') {
            lines = [
                "The walk to the generator room takes forty-seven seconds.",
                "In the beam of your flashlight, you see it immediately.",
                "A hairline crack in the auxiliary fuel line.",
                "You tighten it with trembling hands.",
                "The fire never comes."
            ];

            if (highTrust && !fragmented) {
                lines.push("Three days later, you sit at the radio.");
                lines.push("You know what you have to do.");
                lines.push("You tune to 107.7 and speak into the darkness.");
                lines.push('"Hello? Is anyone there? This is December 17th. Before midnight."');
                lines.push("The loop completes itself.");
            } else if (lowTrust || fragmented) {
                lines.push("But something feels wrong.");
                lines.push("The generator hums differently than you remember.");
                lines.push("Or was it always like this?");
                lines.push("You return to the radio. Static. Always static.");
                lines.push("Maybe there was never a signal at all.");
            } else {
                lines.push("Three days later, you sit at the radio.");
                lines.push("You tune to 107.7.");
                lines.push("Static. Nothing but static.");
                lines.push("You never find out if you were the one who sent the signal.");
                lines.push("Maybe it doesn't matter.");
            }
        } else if (endingType === 'B') {
            if (fragmented) {
                lines = [
                    "You adjust the dial. The signal is fragmenting.",
                    "You hear your own voice. Then another voice. Then silence.",
                    "The clock shows 11:52. Or is it 11:47? Both? Neither?",
                    "The generator kicks in. Or did it already happen?",
                    "You smell smoke that hasn't happened yet.",
                    "",
                    "Reality folds.",
                    "You are standing at the radio. You are in the generator room.",
                    "You are sending the signal. You are receiving it.",
                    "Past and future collapse into an eternal now.",
                    "The loop was never meant to be broken."
                ];
            } else {
                lines = [
                    "You adjust the dial. Desperately searching for the signal.",
                    "Minutes pass. The static is deafening.",
                    "At 11:52, the lights flicker and die.",
                    "The generator kicks in with a shudder.",
                    "From somewhere below, you smell smoke.",
                    "",
                    "You run.",
                    "You make it to the generator room.",
                    "Barely in time.",
                    "The fuel line hisses as you wrench it tight.",
                    "Three days later, you'll understand what you have to do."
                ];
            }
        } else if (endingType === 'C') {
            if (highTrust) {
                lines = [
                    "You stayed at your post.",
                    "You trusted the Pattern. You trusted the other voice.",
                    "But doubt creeps in as the minutes pass.",
                    "11:52. The lights flicker but hold.",
                    "The generator hums its familiar song.",
                    "No fire. No disaster.",
                    "",
                    "Three days pass. Nothing happens.",
                    "Was the first signal the lie? Or the second?",
                    "You'll never know which voice was real.",
                    "But you made your choice, and you're alive.",
                    "Sometimes that's enough."
                ];
            } else {
                lines = [
                    "You stayed at your post.",
                    "As instructed.",
                    "The voice said not to trust the other signal.",
                    "But was that the right choice?",
                    "The lights flicker.",
                    "The generator hums.",
                    "Everything seems... fine.",
                    "But in three days, you'll know for certain.",
                    "One way or another."
                ];
            }
        } else if (endingType === 'D') {
            // Hidden ending: Maximum reality fragmentation
            lines = [
                "You stay at the radio.",
                "But the radio is changing.",
                "The numbers on the dial shift. 107.7 becomes 701.7 becomes 017.7.",
                "You hear every transmission that was ever sent.",
                "You hear your father. Your childhood dog barking.",
                "You hear yourself at age eight, age eighteen, age eighty.",
                "",
                "The station dissolves.",
                "There is no Arctic. There never was.",
                "You are not Sam Reeves. Sam Reeves is not real.",
                "You are the Pattern. You have always been the Pattern.",
                "The signal was never meant to save anyone.",
                "It was meant to trap someone in the listening.",
                "",
                "And now you understand.",
                "You were never the operator.",
                "You were always the transmission."
            ];
        }

        lines.forEach((line, index) => {
            const p = document.createElement('p');
            p.textContent = line;
            p.style.animationDelay = (index * 2) + 's';
            endingText.appendChild(p);
        });

        // Show credits after all text
        setTimeout(() => {
            document.getElementById('credits').classList.remove('hidden');
        }, (lines.length * 2 + 2) * 1000);
    },

    updateClock() {
        const clockEl = document.getElementById('clock-time');
        let minutes = 47;
        let hours = 11;

        setInterval(() => {
            gameState.timeElapsed++;
            minutes = 47 + Math.floor(gameState.timeElapsed / 60);
            if (minutes >= 60) {
                hours = 0;
                minutes = minutes - 60;
            }
            clockEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')}`;
        }, 1000);
    },

    showTemporalEcho() {
        // Creative mechanic: show fragments of past/future dialogue bleeding through
        const echoes = [
            "...don't make my mistake...",
            "...you have to go NOW...",
            "...I didn't believe myself...",
            "...the Pattern wants you to leave...",
            "...Barnaby... brown and white..."
        ];

        const echo = echoes[Math.floor(Math.random() * echoes.length)];
        const dialogueEl = document.getElementById('dialogue-text');
        const p = document.createElement('p');
        p.style.opacity = '0.5';
        p.style.fontStyle = 'italic';
        p.innerHTML = `<span style="color: #888">[TEMPORAL ECHO]</span> ${echo}`;
        dialogueEl.appendChild(p);

        // Make signal flicker
        const light = document.getElementById('indicator-light');
        light.style.animation = 'none';
        setTimeout(() => {
            light.style.animation = 'pulse 0.5s infinite';
        }, 100);
    },

    causeSignalInterference() {
        // Creative mechanic: doubt causes the signal to become unstable
        const dialogueEl = document.getElementById('dialogue-text');
        const p = document.createElement('p');
        p.style.color = '#ff3333';
        p.textContent = '[SIGNAL INTERFERENCE - FREQUENCY UNSTABLE]';
        dialogueEl.appendChild(p);

        // Visually shake the frequency display
        const freqDisplay = document.getElementById('frequency-display');
        freqDisplay.style.animation = 'shake 0.5s';
        setTimeout(() => {
            freqDisplay.style.animation = '';
        }, 500);

        // Increase static
        audio.playStatic(0.5);
        setTimeout(() => {
            audio.playStatic(0.2);
        }, 2000);
    },

    resetGame() {
        // Reset state
        gameState.currentScene = 'intro';
        gameState.frequency = 88.0;
        gameState.signalLocked = false;
        gameState.dialogueFlags = {
            believedSignal: false,
            discoveredSecretFreq: false,
            heardProof: false,
            choicePath: null,
            finalChoice: null
        };
        gameState.morseProgress = 0;
        gameState.morseInput = '';
        gameState.timeElapsed = 0;
        gameState.ending = null;
        gameState.trustLevel = 50;
        gameState.realityFragmentation = 0;
        gameState.hasHeardOwnVoice = false;
        gameState.staticPatternsSeen = [];
        gameState.frequencyDrift = 0;
        gameState.temporalEchoes = [];

        // Reset UI
        dialogue.clear();
        document.getElementById('indicator-light').classList.remove('on');
        document.getElementById('morse-display').classList.add('hidden');
        document.getElementById('credits').classList.add('hidden');

        // Show intro
        this.showScreen('intro');
    }
};

// Initialize game when page loads
window.addEventListener('load', () => {
    game.init();
});
