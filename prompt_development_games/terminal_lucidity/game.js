class TerminalLucidity extends Phaser.Scene {
    constructor() {
        super({ key: 'TerminalLucidity' });
        this.timeLimit = 300000; // 5 Minutes
        this.wordPool = {
            // Phase 1: Regret (0 - 1.5 mins)
            regret: [
                { text: 'I', mass: 1, type: 'pronoun' },
                { text: 'AM', mass: 1, type: 'verb' },
                { text: 'SORRY', mass: 10, type: 'emotion', color: 0x8888ff },
                { text: 'REGRET', mass: 12, type: 'emotion', color: 0x8888ff },
                { text: 'MISTAKE', mass: 8, type: 'noun' },
                { text: 'EMPTY', mass: 9, type: 'emotion', color: 0xaaaaaa },
            ],
            // Phase 2: Memory (1.5 - 3 mins)
            memory: [
                { text: 'REMEMBER', mass: 7, type: 'verb' },
                { text: 'SUNLIGHT', mass: 5, type: 'noun', color: 0xffff88 },
                { text: 'LAUGHTER', mass: 4, type: 'noun', color: 0xffff88 },
                { text: 'PROMISE', mass: 6, type: 'noun', fragility: 0.7 }, // Fragile
                { text: 'GLASS', mass: 3, type: 'noun', fragility: 0.9 }, // Very Fragile
                { text: 'LOST', mass: 10, type: 'emotion', color: 0x8888ff },
            ],
            // Phase 3: Acceptance / Desperation (3 - 4.5 mins)
            acceptance: [
                { text: 'FORGIVE', mass: 15, type: 'verb', color: 0xff8888 },
                { text: 'ALWAYS', mass: 8, type: 'adverb' },
                { text: 'GOODBYE', mass: 18, type: 'noun', color: 0xff8888 },
                { text: 'LOVE', mass: 15, type: 'emotion', color: 0xff8888 },
                { text: 'SILENCE', mass: 9, type: 'noun' },
                { text: 'PEACE', mass: 6, type: 'noun', color: 0x88ff88 },
            ],
            // Phase 4: The Glitch (4.5 - 5 mins)
            glitch: [
                { text: 'F#RG!V3', mass: 15, type: 'glitch', color: 0xff00ff },
                { text: '4LW4YS', mass: 8, type: 'glitch', color: 0xff00ff },
                { text: 'G00DBY3', mass: 18, type: 'glitch', color: 0xff00ff },
                { text: 'L0V3', mass: 15, type: 'glitch', color: 0xff00ff },
                { text: '51L3NC3', mass: 9, type: 'glitch', color: 0xff00ff },
            ]
        };
        this.currentLetterText = [];
        this.currentPhase = 'regret';
    }

    preload() {
        // Sounds can be preloaded here
    }

    create() {
        // 1. Initialize Matter.js Physics
        this.matter.world.setBounds(0, 0, 800, 600);

        // -- New Aesthetic Background --
        this.background = this.add.graphics();
        this.pulsar = 0;

        // -- Audio --
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Ambient Hum
        this.hummer = this.audioCtx.createOscillator();
        this.hummer.type = 'sine';
        this.hummer.frequency.setValueAtTime(50, this.audioCtx.currentTime); // Low G
        this.humGain = this.audioCtx.createGain();
        this.humGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        this.hummer.connect(this.humGain);
        this.humGain.connect(this.audioCtx.destination);
        this.hummer.start();
        // Fade in the hum
        this.humGain.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 5);


        // 2. The "Shelf" - where words must land to be "sent"
        this.shelf = this.add.rectangle(400, 500, 600, 20, 0x333333); // Darker shelf
        this.matter.add.gameObject(this.shelf, { isStatic: true });
        
        // 3. The Player (Cursor)
        this.cursor = this.add.circle(100, 100, 10, 0xffffff); // White cursor
        this.matter.add.gameObject(this.cursor, { mass: 100 });
        this.cursor.setCircle(10);
        this.cursor.setFriction(0);
        this.cursor.setFixedRotation();
        
        // -- Cursor Trail --
        const graphics = this.add.graphics().fillStyle(0xffffff).fillRect(0, 0, 1, 1);
        graphics.generateTexture('pixel', 1, 1);
        graphics.destroy();
        const trailParticles = this.add.particles('pixel');
        this.emitter = trailParticles.createEmitter({
            speed: 10,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            tint: 0x888888
        });
        this.emitter.startFollow(this.cursor);

        // Hide the default cursor
        this.input.mouse.disableContextMenu();
        this.game.canvas.style.cursor = 'none';

        // 4. Typing Loop: Spawn a word every 3-5 seconds
        this.spawnTimer = this.time.addEvent({
            delay: 4000,
            callback: this.dropWord,
            callbackScope: this,
            loop: true
        });

        // Timer text
        this.timerText = this.add.text(10, 10, `Time: ${Math.ceil(this.timeLimit / 1000)}s`, { font: '16px Courier New', fill: '#eeeeee' });
    }

    update(time, delta) {
        // -- Update Background --
        this.pulsar += delta * 0.005;
        this.background.clear();
        const baseAlpha = 0.1;
        const pulseAlpha = baseAlpha + (Math.sin(this.pulsar) * 0.05);
        for (let x = 0; x < 800; x += 20) {
            for (let y = 0; y < 600; y += 20) {
                this.background.fillStyle(0xdddddd, pulseAlpha);
                this.background.fillCircle(x, y, 1);
            }
        }

        // 5. Cursor follows mouse with a "punch"
        const pointer = this.input.activePointer;
        const currentPos = this.cursor.body.position;
        const distance = Phaser.Math.Distance.Between(currentPos.x, currentPos.y, pointer.x, pointer.y);

        // Move the cursor body towards the pointer
        // The further away the pointer is, the faster the cursor will move
        const speed = distance * 2;
        const angle = Phaser.Math.Angle.Between(currentPos.x, currentPos.y, pointer.x, pointer.y);

        this.cursor.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

        // 6. Delete Logic
        if (this.input.activePointer.isDown) {
            this.handleErasure();
        }

        // 7. Check for Ending and Phase Transitions
        this.timeLimit -= delta;
        const elapsedTime = 300000 - this.timeLimit;

        // Update hum volume and frequency to build tension
        const humTargetGain = 0.1 + (elapsedTime / 300000) * 0.2; // Max gain of 0.3
        this.humGain.gain.linearRampToValueAtTime(humTargetGain, this.audioCtx.currentTime + 0.1);
        if (this.currentPhase === 'glitch') {
            const freq = 50 + Math.sin(time * 0.01) * 5; // Warble
            this.hummer.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        }

        if (elapsedTime > 270000) { // 4.5 mins
            if (this.currentPhase !== 'glitch') {
                this.currentPhase = 'glitch';
                this.spawnTimer.delay = 400; // Fastest
            }
        } else if (elapsedTime > 180000) { // 3 mins
            if (this.currentPhase !== 'acceptance') {
                this.currentPhase = 'acceptance';
                this.spawnTimer.delay = 1000;
            }
        } else if (elapsedTime > 90000) { // 1.5 mins
            if (this.currentPhase !== 'memory') {
                this.currentPhase = 'memory';
                this.spawnTimer.delay = 2000;
            }
        }

        this.timerText.setText(`Time: ${Math.ceil(Math.max(0, this.timeLimit) / 1000)}s`);

        if (this.timeLimit <= 0) {
            this.triggerSend();
        }
    }

    playKeyClick() {
        const clicker = this.audioCtx.createOscillator();
        clicker.type = 'sine';
        clicker.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        const clickGain = this.audioCtx.createGain();
        clickGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        clicker.connect(clickGain);
        clickGain.connect(this.audioCtx.destination);
        clicker.start();
        clicker.stop(this.audioCtx.currentTime + 0.05);
    }

    playShatterSound() {
        const bufferSize = this.audioCtx.sampleRate * 0.1; // 0.1s noise
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        noise.connect(noiseGain);
        noiseGain.connect(this.audioCtx.destination);
        noise.start();
    }

    dropWord() {
        this.playKeyClick();
        const phaseWords = this.wordPool[this.currentPhase];
        const wordData = phaseWords[Math.floor(Math.random() * phaseWords.length)];

        const wordObj = this.add.text(Phaser.Math.Between(200, 600), 50, wordData.text, {
            font: 'bold 32px Courier New',
            fill: wordData.color ? `#${wordData.color.toString(16)}` : '#eeeeee'
        });

        this.matter.add.gameObject(wordObj, {
            mass: wordData.mass,
            restitution: 0.5,
            friction: 0.1,
        });

        wordObj.setData('wordData', wordData); // Store all data on the game object
        this.currentLetterText.push(wordObj);

        // Shatter check
        if (wordData.fragility) {
            wordObj.setOnCollide(pair => this.handleShatter(pair, wordObj));
        }
    }

    handleShatter(pair, wordObj) {
        if (!wordObj.active) return;

        const { bodyA, bodyB } = pair;
        const collisionStrength = Math.abs(bodyA.velocity.y - bodyB.velocity.y) + Math.abs(bodyA.velocity.x - bodyB.velocity.x);
        
        const wordData = wordObj.getData('wordData');
        if (collisionStrength > wordData.fragility * 10) {
            this.playShatterSound();
            const letters = wordObj.text.split('');
            letters.forEach((letter, i) => {
                const letterObj = this.add.text(wordObj.x + (i * 20) - (letters.length * 10), wordObj.y, letter, {
                    font: 'bold 32px Courier New',
                    fill: wordObj.style.color
                });
                this.matter.add.gameObject(letterObj, {
                    mass: wordData.mass / letters.length,
                    restitution: 0.8,
                    friction: 0.3,
                });
                this.currentLetterText.push(letterObj);
            });

            this.currentLetterText = this.currentLetterText.filter(w => w !== wordObj);
            wordObj.destroy();
        }
    }

    handleErasure() {
        const pointer = this.input.activePointer;
        const bodiesUnderPointer = this.matter.query.point(this.currentLetterText.map(w => w.body), { x: pointer.x, y: pointer.y });

        bodiesUnderPointer.forEach(body => {
            const gameObject = body.gameObject;
            if (gameObject && gameObject.active) { // Check if it's not already being destroyed
                gameObject.active = false; // Prevent this from being triggered again
                this.tweens.add({
                    targets: gameObject,
                    alpha: { from: 1, to: 0 },
                    scale: { from: gameObject.scale, to: 0 },
                    duration: 200,
                    onComplete: () => {
                        this.currentLetterText = this.currentLetterText.filter(word => word !== gameObject);
                        if(gameObject) gameObject.destroy();
                    }
                });
            }
        });
    }

    triggerSend() {
        this.spawnTimer.remove();
        this.matter.world.pause(); // Stop all physics

        // Final Logic: Scan the 'Shelf'
        let finalMessage = "";
        const shelfY = this.shelf.y;
        
        let wordsOnShelf = this.currentLetterText
            .filter(word => word.active && Math.abs(word.y - shelfY) < 50 + word.height / 2)
            .sort((a, b) => a.x - b.x); // Sort by x position to form a sentence

        wordsOnShelf.forEach(word => {
            finalMessage += word.text + " ";
        });

        console.log("Final Message:", finalMessage.trim());

        // Display "SENDING..."
        const sendingText = this.add.text(400, 300, 'SENDING...', {
            font: 'bold 64px Courier New',
            fill: '#ff0000'
        }).setOrigin(0.5);

        // Simple progress bar
        const progressBar = this.add.graphics();
        const barWidth = 600;
        const barHeight = 50;
        const barX = 100;
        const barY = 350;

        progressBar.fillStyle(0x000000, 1);
        progressBar.fillRect(barX, barY, barWidth, barHeight);

        this.add.tween({
            targets: progressBar,
            scaleX: { from: 0, to: 1 },
            duration: 2000,
            onComplete: () => {
                this.scene.start('FinalResult', { message: finalMessage.trim() });
            }
        });

    }
}

class FinalResult extends Phaser.Scene {
    constructor() {
        super({ key: 'FinalResult' });
    }

    init(data) {
        this.message = data.message;
    }

    create() {
        // Same background as the main scene
        this.background = this.add.graphics();
        let pulsar = 0;
        this.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => {
                pulsar += 0.01;
                this.background.clear();
                const baseAlpha = 0.1;
                const pulseAlpha = baseAlpha + (Math.sin(pulsar) * 0.05);
                for (let x = 0; x < 800; x += 20) {
                    for (let y = 0; y < 600; y += 20) {
                        this.background.fillStyle(0xdddddd, pulseAlpha);
                        this.background.fillCircle(x, y, 1);
                    }
                }
            }
        });


        this.add.text(400, 150, 'Message Sent:', {
            font: 'bold 32px Courier New',
            fill: '#eeeeee'
        }).setOrigin(0.5);

        this.add.text(400, 250, this.message, {
            font: '24px Courier New',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);

        // --- Narrative interpretation ---
        let interpretation = '';
        if (this.message.includes('LOVE')) {
            interpretation = 'In the end, there was love.';
        } else if (this.message.includes('SORRY')) {
            interpretation = 'In the end, there was regret.';
        } else if (this.message.includes('GOODBYE')) {
            interpretation = 'In the end, there was acceptance.';
        } else if (this.message.includes('EMPTY') || this.message.includes('LOST')) {
            interpretation = 'In the end, there was only emptiness.';
        } else if (this.message === '') {
            interpretation = 'In the end... there was only silence.';
        }
        else {
            interpretation = 'The final thoughts were a scattered whisper.';
        }

        this.add.text(400, 400, interpretation, {
            font: 'italic 20px Courier New',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);


        this.add.text(400, 500, 'Click to restart', {
            font: '20px Courier New',
            fill: '#888888'
        }).setOrigin(0.5);

        this.input.on('pointerdown', () => {
            this.scene.start('TerminalLucidity');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.8 },
            debug: false // Set to true for debugging physics
        }
    },
    scene: [TerminalLucidity, FinalResult]
};

const game = new Phaser.Game(config);
