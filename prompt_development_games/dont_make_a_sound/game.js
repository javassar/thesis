// ============================================================================
// DON'T MAKE A SOUND - Phaser 3 Implementation
// ============================================================================

// --- CONSTANTS ---
const CONFIG = { width: 1024, height: 768, backgroundColor: 0x0a0a0a };
const PLAYER_CONST = { width: 32, height: 48, speed: 150, lightRadius: 150 };
const CURSOR_CONST = { glowRadius: 30, noiseThreshold: 2, noiseMultiplier: 5, maxNoiseRadius: 300, minNoiseRadius: 50 };
const WAVE_CONST = { expansionSpeed: 200, wallAttenuation: 0.6, strokeWidth: 2, maxAlpha: 0.4 };
const CREATURE_CONST = { width: 40, height: 56, patrolSpeed: 40, huntSpeed: 100, returnSpeed: 50, alertDuration: 1.5, searchDuration: 3, searchRadius: 60, detectionTolerance: 20 };

// --- BORDER WALLS (shared) ---
const BORDER_WALLS = [
    { x: 0, y: 0, w: 1024, h: 20 },
    { x: 0, y: 748, w: 1024, h: 20 },
    { x: 0, y: 0, w: 20, h: 768 },
    { x: 1004, y: 0, w: 20, h: 768 }
];

// --- LEVEL DATA ---
const LEVELS = [
    null,
    { // Level 1 - First Breath
        playerStart: { x: 100, y: 384 },
        exit: { x: 900, y: 352, w: 60, h: 80 },
        walls: [...BORDER_WALLS],
        obstacles: [],
        creatures: []
    },
    { // Level 2 - Listener
        playerStart: { x: 100, y: 384 },
        exit: { x: 900, y: 352, w: 60, h: 80 },
        walls: [...BORDER_WALLS],
        obstacles: [],
        creatures: [
            { startX: 500, startY: 400, patrolPath: [], startState: 'PATROL' }
        ]
    },
    { // Level 3 - Patrol
        playerStart: { x: 100, y: 680 },
        exit: { x: 900, y: 80, w: 60, h: 80 },
        walls: [...BORDER_WALLS, { x: 300, y: 200, w: 400, h: 20 }],
        obstacles: [{ x: 200, y: 500, w: 80, h: 80 }],
        creatures: [
            { startX: 500, startY: 400, patrolPath: [{ x: 300, y: 400 }, { x: 700, y: 400 }], startState: 'PATROL' }
        ]
    },
    { // Level 4 - Distraction
        playerStart: { x: 100, y: 384 },
        exit: { x: 900, y: 352, w: 60, h: 80 },
        walls: [...BORDER_WALLS, { x: 400, y: 200, w: 20, h: 200 }, { x: 400, y: 500, w: 20, h: 200 }],
        obstacles: [],
        creatures: [
            { startX: 500, startY: 384, patrolPath: [], startState: 'PATROL' }
        ]
    },
    { // Level 5 - Rooms
        playerStart: { x: 80, y: 680 },
        exit: { x: 920, y: 80, w: 60, h: 80 },
        walls: [
            ...BORDER_WALLS,
            { x: 340, y: 0, w: 20, h: 300 },
            { x: 340, y: 400, w: 20, h: 368 },
            { x: 680, y: 0, w: 20, h: 200 },
            { x: 680, y: 300, w: 20, h: 468 }
        ],
        obstacles: [{ x: 150, y: 300, w: 60, h: 60 }, { x: 500, y: 500, w: 80, h: 40 }],
        creatures: [
            { startX: 170, startY: 150, patrolPath: [{ x: 100, y: 150 }, { x: 280, y: 150 }], startState: 'PATROL' },
            { startX: 500, startY: 300, patrolPath: [{ x: 400, y: 300 }, { x: 620, y: 300 }], startState: 'PATROL' }
        ]
    },
    { // Level 6 - Close
        playerStart: { x: 100, y: 384 },
        exit: { x: 900, y: 352, w: 60, h: 80 },
        walls: [...BORDER_WALLS],
        obstacles: [
            { x: 300, y: 300, w: 100, h: 100 },
            { x: 500, y: 450, w: 80, h: 80 },
            { x: 700, y: 280, w: 60, h: 120 }
        ],
        creatures: [
            { startX: 200, startY: 384, patrolPath: [], startState: 'PATROL' }
        ]
    },
    { // Level 7 - Darkness
        playerStart: { x: 100, y: 680 },
        exit: { x: 900, y: 80, w: 60, h: 80 },
        walls: [
            ...BORDER_WALLS,
            { x: 200, y: 150, w: 200, h: 20 },
            { x: 500, y: 300, w: 20, h: 200 },
            { x: 300, y: 500, w: 250, h: 20 },
            { x: 650, y: 200, w: 20, h: 250 }
        ],
        obstacles: [],
        creatures: [
            { startX: 300, startY: 350, patrolPath: [{ x: 250, y: 300 }, { x: 450, y: 400 }, { x: 250, y: 450 }], startState: 'PATROL' },
            { startX: 750, startY: 500, patrolPath: [{ x: 700, y: 400 }, { x: 850, y: 550 }], startState: 'PATROL' }
        ]
    },
    { // Level 8 - Chase
        playerStart: { x: 100, y: 384 },
        exit: { x: 900, y: 384, w: 60, h: 80 },
        walls: [
            ...BORDER_WALLS,
            { x: 200, y: 0, w: 20, h: 550 },
            { x: 350, y: 200, w: 20, h: 568 },
            { x: 500, y: 0, w: 20, h: 450 },
            { x: 650, y: 300, w: 20, h: 468 },
            { x: 800, y: 0, w: 20, h: 500 }
        ],
        obstacles: [],
        creatures: [
            { startX: 150, startY: 300, patrolPath: [], startState: 'HUNTING' }
        ]
    },
    { // Level 9 - Silence
        playerStart: { x: 80, y: 700 },
        exit: { x: 940, y: 60, w: 60, h: 80 },
        walls: [
            ...BORDER_WALLS,
            { x: 200, y: 100, w: 20, h: 400 },
            { x: 350, y: 250, w: 20, h: 518 },
            { x: 500, y: 0, w: 20, h: 350 },
            { x: 500, y: 450, w: 20, h: 318 },
            { x: 650, y: 200, w: 20, h: 400 },
            { x: 800, y: 0, w: 20, h: 500 },
            { x: 800, y: 600, w: 20, h: 168 }
        ],
        obstacles: [
            { x: 100, y: 550, w: 60, h: 60 },
            { x: 420, y: 150, w: 50, h: 50 },
            { x: 580, y: 550, w: 70, h: 40 },
            { x: 720, y: 350, w: 50, h: 80 }
        ],
        creatures: [
            { startX: 150, startY: 250, patrolPath: [{ x: 100, y: 200 }, { x: 100, y: 450 }], startState: 'PATROL' },
            { startX: 420, startY: 600, patrolPath: [{ x: 280, y: 600 }, { x: 480, y: 700 }], startState: 'PATROL' },
            { startX: 580, startY: 300, patrolPath: [{ x: 540, y: 200 }, { x: 620, y: 430 }], startState: 'PATROL' },
            { startX: 920, startY: 150, patrolPath: [], startState: 'PATROL' }
        ]
    }
];

// ============================================================================
// PROCEDURAL AUDIO ENGINE (Web Audio API)
// ============================================================================
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientOsc = null;
        this.ambientGain = null;
        this.cursorGain = null;
        this.cursorOsc = null;
        this.cursorNoiseNode = null;
        this.heartbeatInterval = null;
        this.heartbeatGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.8;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            // Audio not available - game still works silently
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // --- Ambient drone ---
    startAmbient() {
        if (!this.ctx) return;
        if (this.ambientOsc) return;

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = 0.06;
        this.ambientGain.connect(this.masterGain);

        // Deep drone: two detuned oscillators for subtle beating
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.value = 55;
        this.ambientOsc.connect(this.ambientGain);
        this.ambientOsc.start();

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 55.5; // Slight detune = eerie beating
        const g2 = this.ctx.createGain();
        g2.gain.value = 0.04;
        g2.connect(this.masterGain);
        osc2.connect(g2);
        osc2.start();
        this._ambientOsc2 = osc2;
        this._ambientGain2 = g2;
    }

    stopAmbient() {
        if (this.ambientOsc) {
            this.ambientOsc.stop();
            this.ambientOsc = null;
        }
        if (this._ambientOsc2) {
            this._ambientOsc2.stop();
            this._ambientOsc2 = null;
        }
    }

    // --- Cursor noise (continuous filtered noise, volume/pitch scales with velocity) ---
    updateCursorNoise(velocity) {
        if (!this.ctx) return;

        if (!this.cursorNoiseNode) {
            // Create noise source
            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            this.cursorNoiseNode = this.ctx.createBufferSource();
            this.cursorNoiseNode.buffer = buffer;
            this.cursorNoiseNode.loop = true;

            // Bandpass filter for "whoosh" quality
            this.cursorFilter = this.ctx.createBiquadFilter();
            this.cursorFilter.type = 'bandpass';
            this.cursorFilter.frequency.value = 800;
            this.cursorFilter.Q.value = 0.5;

            this.cursorGain = this.ctx.createGain();
            this.cursorGain.gain.value = 0;

            this.cursorNoiseNode.connect(this.cursorFilter);
            this.cursorFilter.connect(this.cursorGain);
            this.cursorGain.connect(this.masterGain);
            this.cursorNoiseNode.start();
        }

        // Scale volume and filter frequency with cursor velocity
        const t = this.ctx.currentTime;
        const norm = Math.min(velocity / 50, 1);
        const targetVol = norm > 0.04 ? 0.08 + norm * 0.25 : 0;
        this.cursorGain.gain.setTargetAtTime(targetVol, t, 0.05);
        this.cursorFilter.frequency.setTargetAtTime(600 + norm * 2000, t, 0.05);
    }

    // --- Heartbeat (proximity to creature) ---
    updateHeartbeat(intensity) {
        // intensity: 0 (far) to 1 (very close)
        if (!this.ctx) return;

        if (intensity <= 0) {
            if (this.heartbeatGain) {
                this.heartbeatGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
            }
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            return;
        }

        if (!this.heartbeatGain) {
            this.heartbeatGain = this.ctx.createGain();
            this.heartbeatGain.gain.value = 0;
            this.heartbeatGain.connect(this.masterGain);
        }

        const vol = 0.15 + intensity * 0.35;
        this.heartbeatGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);

        // BPM based on intensity: 60 (calm) to 150 (panicking)
        const bpm = 60 + intensity * 90;
        const beatInterval = 60000 / bpm;

        if (!this.heartbeatInterval || this._lastBeatInterval !== beatInterval) {
            if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
            this._lastBeatInterval = beatInterval;

            const beat = () => {
                if (!this.ctx || !this.heartbeatGain) return;
                const t = this.ctx.currentTime;

                // "Lub" - lower thud
                const osc1 = this.ctx.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(60, t);
                osc1.frequency.exponentialRampToValueAtTime(30, t + 0.1);
                const g1 = this.ctx.createGain();
                g1.gain.setValueAtTime(0.6, t);
                g1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                osc1.connect(g1);
                g1.connect(this.heartbeatGain);
                osc1.start(t);
                osc1.stop(t + 0.15);

                // "Dub" - slightly delayed, higher
                const osc2 = this.ctx.createOscillator();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(50, t + 0.12);
                osc2.frequency.exponentialRampToValueAtTime(25, t + 0.22);
                const g2 = this.ctx.createGain();
                g2.gain.setValueAtTime(0, t);
                g2.gain.setValueAtTime(0.4, t + 0.12);
                g2.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                osc2.connect(g2);
                g2.connect(this.heartbeatGain);
                osc2.start(t);
                osc2.stop(t + 0.25);
            };

            beat();
            this.heartbeatInterval = setInterval(beat, beatInterval);
        }
    }

    // --- Creature alert gasp ---
    playAlert() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // Short breathy gasp: filtered noise burst
        const bufLen = this.ctx.sampleRate * 0.15;
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            const env = 1 - i / bufLen;
            d[i] = (Math.random() * 2 - 1) * env * env;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(t);
    }

    // --- Death static burst ---
    playDeath() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const bufLen = this.ctx.sampleRate * 0.3;
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            const env = Math.max(0, 1 - (i / bufLen) * 1.5);
            d[i] = (Math.random() * 2 - 1) * env;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        src.connect(gain);
        gain.connect(this.masterGain);
        src.start(t);
    }

    // --- Level complete exhale ---
    playComplete() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        // Soft exhale: filtered noise
        const bufLen = this.ctx.sampleRate * 0.6;
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
            const p = i / bufLen;
            const env = Math.sin(p * Math.PI); // Smooth rise and fall
            d[i] = (Math.random() * 2 - 1) * env * 0.3;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.2;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(t);

        // Gentle tone
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 440;
        const toneGain = this.ctx.createGain();
        toneGain.gain.setValueAtTime(0, t);
        toneGain.gain.linearRampToValueAtTime(0.12, t + 0.2);
        toneGain.gain.linearRampToValueAtTime(0, t + 1.0);
        osc.connect(toneGain);
        toneGain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 1.0);
    }
}

// ============================================================================
// MAIN SCENE
// ============================================================================
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.gameState = 'title';
        this.currentLevel = 1;
        this.isPaused = false;
        this.noiseReduction = 1.0;

        // Audio engine
        this.sound_engine = new SoundEngine();

        // Cursor tracking
        this.cursorPos = { x: CONFIG.width / 2, y: CONFIG.height / 2 };
        this.prevCursorPos = { x: CONFIG.width / 2, y: CONFIG.height / 2 };
        this.cursorVelocity = 0;

        // Proximity tracking
        this.nearestCreatureDist = Infinity;

        // Game objects
        this.player = null;
        this.creatures = [];
        this.soundWaves = [];
        this.wallRects = [];
        this.obstacleRects = [];
        this.exitObj = null;
        this.playerLightRadius = PLAYER_CONST.lightRadius;

        // Graphics layers
        this.envGraphics = this.add.graphics().setDepth(0);
        this.waveGraphics = this.add.graphics().setDepth(5);
        this.entityGraphics = this.add.graphics().setDepth(10);
        this.cursorGraphics = this.add.graphics().setDepth(100);
        this.vignetteGraphics = this.add.graphics().setDepth(90);

        // Darkness overlay using RenderTexture
        this.createLightTextures();
        this.darknessRT = this.add.renderTexture(0, 0, CONFIG.width, CONFIG.height).setDepth(50);

        // Pre-create reusable Image objects for erasing light holes
        this.lightPlayerImg = this.make.image({ key: 'light_150', add: false }).setOrigin(0, 0);
        this.lightPlayerSmallImg = this.make.image({ key: 'light_100', add: false }).setOrigin(0, 0);
        this.lightCursorImg = this.make.image({ key: 'light_60', add: false }).setOrigin(0, 0);
        this.lightExitImg = this.make.image({ key: 'light_exit', add: false }).setOrigin(0, 0);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({ w: 'W', a: 'A', s: 'S', d: 'D' });
        this.rKey = this.input.keyboard.addKey('R');
        this.escKey = this.input.keyboard.addKey('ESC');

        this.input.on('pointermove', (pointer) => {
            this.prevCursorPos.x = this.cursorPos.x;
            this.prevCursorPos.y = this.cursorPos.y;
            this.cursorPos.x = pointer.x;
            this.cursorPos.y = pointer.y;
        });

        // UI state
        this.titleText = null;
        this.subtitleText = null;
        this.instructionText = null;
        this.levelIndicatorText = null;
        this.levelIndicatorTimer = 0;

        // Fade overlay
        this.fadeRect = this.add.rectangle(CONFIG.width / 2, CONFIG.height / 2, CONFIG.width, CONFIG.height, 0x000000);
        this.fadeRect.setDepth(500).setAlpha(0);

        // Death flash
        this.deathFlash = this.add.rectangle(CONFIG.width / 2, CONFIG.height / 2, CONFIG.width, CONFIG.height, 0xff0000);
        this.deathFlash.setDepth(400).setAlpha(0);

        // Transition lock
        this.transitioning = false;

        // Ending state
        this.endingTexts = [];

        this.displayTitleScreen();
    }

    // ========================================================================
    // LIGHT TEXTURES
    // ========================================================================
    createLightTextures() {
        const sizes = [
            { key: 'light_150', radius: 150 },
            { key: 'light_100', radius: 100 },
            { key: 'light_60', radius: 60 },
            { key: 'light_exit', radius: 100 }
        ];
        for (const s of sizes) {
            if (this.textures.exists(s.key)) continue;
            const d = s.radius * 2;
            const canvas = document.createElement('canvas');
            canvas.width = d;
            canvas.height = d;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(s.radius, s.radius, 0, s.radius, s.radius, s.radius);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, d, d);
            this.textures.addCanvas(s.key, canvas);
        }
    }

    // ========================================================================
    // TITLE SCREEN
    // ========================================================================
    displayTitleScreen() {
        this.gameState = 'title';
        this.clearLevel();
        this.transitioning = false;

        this.destroyTitleTexts();
        this.endingTexts.forEach(t => t.destroy());
        this.endingTexts = [];

        this.darknessRT.setVisible(false);
        this.vignetteGraphics.clear();

        this.titleText = this.add.text(CONFIG.width / 2, 350, "DON'T MAKE A SOUND", {
            fontFamily: 'Georgia, serif', fontSize: '48px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(300);

        this.subtitleText = this.add.text(CONFIG.width / 2, 420, 'Click to begin', {
            fontFamily: 'Georgia, serif', fontSize: '20px', color: '#444444'
        }).setOrigin(0.5).setDepth(300);

        this.instructionText = this.add.text(CONFIG.width / 2, 500,
            'WASD/Arrows: Move  |  Mouse creates noise  |  R: Restart level\nReach the glowing exit. Stay still to stay silent.', {
            fontFamily: 'Georgia, serif', fontSize: '14px', color: '#333333', align: 'center'
        }).setOrigin(0.5).setDepth(300);

        this.input.once('pointerdown', () => {
            if (this.gameState !== 'title') return;
            this.startGame();
        });
    }

    destroyTitleTexts() {
        if (this.titleText) { this.titleText.destroy(); this.titleText = null; }
        if (this.subtitleText) { this.subtitleText.destroy(); this.subtitleText = null; }
        if (this.instructionText) { this.instructionText.destroy(); this.instructionText = null; }
    }

    startGame() {
        // Initialize audio on first user interaction (browser requirement)
        this.sound_engine.init();
        this.sound_engine.resume();
        this.sound_engine.startAmbient();

        this.transitioning = true;
        this.tweens.add({
            targets: this.fadeRect, alpha: 1, duration: 500,
            onComplete: () => {
                this.destroyTitleTexts();
                this.currentLevel = 1;
                this.showIntroText();
            }
        });
    }

    showIntroText() {
        this.gameState = 'intro';
        this.clearLevel();

        const text1 = this.add.text(CONFIG.width / 2, 350, "They can't see you.", {
            fontFamily: 'Georgia, serif', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(300).setAlpha(0);

        const text2 = this.add.text(CONFIG.width / 2, 420, 'They can hear everything.', {
            fontFamily: 'Georgia, serif', fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(300).setAlpha(0);

        this.endingTexts = [text1, text2];

        this.fadeRect.alpha = 1;
        this.tweens.add({ targets: this.fadeRect, alpha: 0, duration: 300 });

        this.tweens.add({
            targets: text1, alpha: 1, duration: 1000, delay: 300,
            onComplete: () => {
                this.tweens.add({
                    targets: text2, alpha: 1, duration: 1000, delay: 500,
                    onComplete: () => {
                        this.time.delayedCall(1500, () => {
                            this.tweens.add({
                                targets: this.fadeRect, alpha: 1, duration: 500,
                                onComplete: () => {
                                    text1.destroy();
                                    text2.destroy();
                                    this.endingTexts = [];
                                    this.loadLevel(this.currentLevel);
                                    this.gameState = 'playing';
                                    this.transitioning = false;
                                    this.tweens.add({ targets: this.fadeRect, alpha: 0, duration: 300 });
                                }
                            });
                        });
                    }
                });
            }
        });
    }

    // ========================================================================
    // LEVEL MANAGEMENT
    // ========================================================================
    loadLevel(levelNum) {
        this.clearLevel();
        const data = LEVELS[levelNum];
        if (!data) return;

        this.wallRects = data.walls.map(w => ({ x: w.x, y: w.y, w: w.w, h: w.h }));
        this.obstacleRects = data.obstacles.map(o => ({ x: o.x, y: o.y, w: o.w, h: o.h }));
        this.exitObj = { x: data.exit.x, y: data.exit.y, w: data.exit.w, h: data.exit.h };

        this.player = { x: data.playerStart.x, y: data.playerStart.y, vx: 0, vy: 0 };
        this.playerLightRadius = (levelNum === 7) ? 100 : PLAYER_CONST.lightRadius;
        this.noiseReduction = (levelNum === 9) ? 0.7 : 1.0;

        this.darknessRT.setVisible(true);
        this.nearestCreatureDist = Infinity;

        this.creatures = data.creatures.map(c => {
            const creature = {
                x: c.startX, y: c.startY,
                startX: c.startX, startY: c.startY,
                state: c.startState,
                patrolPath: c.patrolPath,
                patrolIndex: 0,
                targetX: c.startX, targetY: c.startY,
                stateTimer: 0, facingAngle: 0, searchAngle: 0,
                lastSoundX: c.startX, lastSoundY: c.startY,
                swayOffset: Math.random() * Math.PI * 2,
                alertFlash: 0 // visual flash timer when alerted
            };
            if (creature.state === 'HUNTING' && this.player) {
                creature.targetX = this.player.x;
                creature.targetY = this.player.y;
            }
            return creature;
        });

        this.soundWaves = [];
        this.showLevelIndicator(levelNum);
    }

    clearLevel() {
        this.player = null;
        this.creatures = [];
        this.soundWaves = [];
        this.wallRects = [];
        this.obstacleRects = [];
        this.exitObj = null;
        this.nearestCreatureDist = Infinity;
        if (this.levelIndicatorText) {
            this.levelIndicatorText.destroy();
            this.levelIndicatorText = null;
        }
    }

    showLevelIndicator(levelNum) {
        if (this.levelIndicatorText) this.levelIndicatorText.destroy();
        this.levelIndicatorText = this.add.text(40, 30, `${levelNum}/9`, {
            fontFamily: 'Georgia, serif', fontSize: '16px', color: '#555555'
        }).setDepth(300);
        this.levelIndicatorTimer = 2;
    }

    // ========================================================================
    // UPDATE LOOP
    // ========================================================================
    update(time, delta) {
        const dt = delta / 1000;

        if (this.gameState === 'title' || this.gameState === 'intro') {
            this.calculateCursorVelocity();
            this.processCursorNoise();
            this.updateSoundWavesLogic(dt);
            this.waveGraphics.clear();
            this.cursorGraphics.clear();
            this.drawSoundWaves();
            this.drawCursorGlow(time);

            // Update cursor audio even on title (first lesson: your mouse makes noise)
            this.sound_engine.updateCursorNoise(this.cursorVelocity);

            if (this.gameState === 'title' && this.titleText) {
                this.titleText.alpha = 0.7 + 0.3 * Math.sin(time * 0.002);
            }
            return;
        }

        if (this.gameState === 'ending') {
            this.cursorGraphics.clear();
            this.drawCursorGlow(time);
            this.sound_engine.updateCursorNoise(0);
            this.sound_engine.updateHeartbeat(0);
            return;
        }

        if (this.gameState !== 'playing' || this.transitioning) return;

        // Pause
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.isPaused = !this.isPaused;
        }
        if (this.isPaused) {
            this.cursorGraphics.clear();
            this.drawCursorGlow(time);
            return;
        }

        // Restart
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.restartLevel();
            return;
        }

        // --- CURSOR NOISE ---
        this.calculateCursorVelocity();
        this.processCursorNoise();
        this.sound_engine.updateCursorNoise(this.cursorVelocity);

        // --- SOUND WAVES ---
        this.updateSoundWavesLogic(dt);
        this.checkWaveCreatureIntersections();

        // --- CREATURES ---
        this.nearestCreatureDist = Infinity;
        for (const creature of this.creatures) {
            this.updateCreature(creature, dt);

            // Track nearest creature for heartbeat
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, creature.x, creature.y);
            if (d < this.nearestCreatureDist) this.nearestCreatureDist = d;

            // Decay alert flash
            if (creature.alertFlash > 0) creature.alertFlash -= dt * 3;

            if (this.checkRectOverlap(
                this.player.x - PLAYER_CONST.width / 2, this.player.y - PLAYER_CONST.height / 2,
                PLAYER_CONST.width, PLAYER_CONST.height,
                creature.x - CREATURE_CONST.width / 2, creature.y - CREATURE_CONST.height / 2,
                CREATURE_CONST.width, CREATURE_CONST.height
            )) {
                this.playerDeath();
                return;
            }
        }

        // --- HEARTBEAT ---
        if (this.nearestCreatureDist < 200) {
            const intensity = Math.max(0, 1 - this.nearestCreatureDist / 200);
            this.sound_engine.updateHeartbeat(intensity);
        } else {
            this.sound_engine.updateHeartbeat(0);
        }

        // --- PLAYER ---
        this.handlePlayerInput();
        this.updatePlayerPosition(dt);

        // --- EXIT CHECK ---
        if (this.exitObj && this.checkRectOverlap(
            this.player.x - PLAYER_CONST.width / 2, this.player.y - PLAYER_CONST.height / 2,
            PLAYER_CONST.width, PLAYER_CONST.height,
            this.exitObj.x, this.exitObj.y, this.exitObj.w, this.exitObj.h
        )) {
            this.completeLevel();
            return;
        }

        // --- LEVEL INDICATOR ---
        if (this.levelIndicatorText && this.levelIndicatorTimer > 0) {
            this.levelIndicatorTimer -= dt;
            if (this.levelIndicatorTimer <= 0) {
                this.tweens.add({ targets: this.levelIndicatorText, alpha: 0, duration: 500 });
            }
        }

        // --- RENDER ---
        this.renderAll(time);
    }

    // ========================================================================
    // CURSOR & SOUND WAVES
    // ========================================================================
    calculateCursorVelocity() {
        const dx = this.cursorPos.x - this.prevCursorPos.x;
        const dy = this.cursorPos.y - this.prevCursorPos.y;
        this.cursorVelocity = Math.min(Math.sqrt(dx * dx + dy * dy), 50);
    }

    processCursorNoise() {
        if (this.cursorVelocity > CURSOR_CONST.noiseThreshold) {
            let maxRadius = CURSOR_CONST.minNoiseRadius + this.cursorVelocity * CURSOR_CONST.noiseMultiplier;
            maxRadius = Math.min(maxRadius, CURSOR_CONST.maxNoiseRadius);
            maxRadius *= this.noiseReduction;

            this.soundWaves.push({
                x: this.cursorPos.x,
                y: this.cursorPos.y,
                currentRadius: 0,
                maxRadius: maxRadius,
                attenuated: false
            });
        }
        this.prevCursorPos.x = this.cursorPos.x;
        this.prevCursorPos.y = this.cursorPos.y;
    }

    updateSoundWavesLogic(dt) {
        const allWalls = [...this.wallRects, ...this.obstacleRects];
        for (const wave of this.soundWaves) {
            wave.currentRadius += WAVE_CONST.expansionSpeed * dt;
            if (!wave.attenuated) {
                for (const wall of allWalls) {
                    if (this.waveIntersectsRect(wave, wall)) {
                        wave.maxRadius *= WAVE_CONST.wallAttenuation;
                        wave.attenuated = true;
                        break;
                    }
                }
            }
        }
        this.soundWaves = this.soundWaves.filter(w => w.currentRadius < w.maxRadius);
    }

    waveIntersectsRect(wave, rect) {
        const cx = Phaser.Math.Clamp(wave.x, rect.x, rect.x + rect.w);
        const cy = Phaser.Math.Clamp(wave.y, rect.y, rect.y + rect.h);
        return Phaser.Math.Distance.Between(wave.x, wave.y, cx, cy) <= wave.currentRadius;
    }

    checkWaveCreatureIntersections() {
        for (const creature of this.creatures) {
            for (const wave of this.soundWaves) {
                const dist = Phaser.Math.Distance.Between(wave.x, wave.y, creature.x, creature.y);
                if (Math.abs(dist - wave.currentRadius) < CREATURE_CONST.detectionTolerance) {
                    this.creatureHearSound(creature, wave.x, wave.y);
                    break;
                }
            }
        }
    }

    // ========================================================================
    // CREATURE AI
    // ========================================================================
    creatureHearSound(creature, soundX, soundY) {
        creature.lastSoundX = soundX;
        creature.lastSoundY = soundY;
        creature.facingAngle = Math.atan2(soundY - creature.y, soundX - creature.x);

        if (creature.state === 'PATROL' || creature.state === 'RETURNING') {
            creature.state = 'ALERT';
            creature.stateTimer = CREATURE_CONST.alertDuration;
            creature.alertFlash = 1.0; // Bright flash on alert
            this.sound_engine.playAlert();
        } else if (creature.state === 'ALERT') {
            creature.state = 'HUNTING';
            creature.targetX = soundX;
            creature.targetY = soundY;
        } else if (creature.state === 'SEARCHING') {
            creature.state = 'HUNTING';
            creature.targetX = soundX;
            creature.targetY = soundY;
        }
    }

    updateCreature(creature, dt) {
        switch (creature.state) {
            case 'PATROL':
                if (creature.patrolPath.length === 0) {
                    creature.swayOffset += dt;
                } else {
                    const wp = creature.patrolPath[creature.patrolIndex];
                    this.moveToward(creature, wp.x, wp.y, CREATURE_CONST.patrolSpeed, dt);
                    if (Phaser.Math.Distance.Between(creature.x, creature.y, wp.x, wp.y) < 10) {
                        creature.patrolIndex = (creature.patrolIndex + 1) % creature.patrolPath.length;
                    }
                }
                break;

            case 'ALERT':
                creature.stateTimer -= dt;
                if (creature.stateTimer <= 0) creature.state = 'RETURNING';
                break;

            case 'HUNTING':
                this.moveToward(creature, creature.targetX, creature.targetY, CREATURE_CONST.huntSpeed, dt);
                if (Phaser.Math.Distance.Between(creature.x, creature.y, creature.targetX, creature.targetY) < 30) {
                    creature.state = 'SEARCHING';
                    creature.stateTimer = CREATURE_CONST.searchDuration;
                    creature.searchAngle = 0;
                }
                break;

            case 'SEARCHING':
                creature.searchAngle += (CREATURE_CONST.patrolSpeed / CREATURE_CONST.searchRadius) * dt;
                creature.x = creature.targetX + Math.cos(creature.searchAngle) * CREATURE_CONST.searchRadius;
                creature.y = creature.targetY + Math.sin(creature.searchAngle) * CREATURE_CONST.searchRadius;
                creature.stateTimer -= dt;
                if (creature.stateTimer <= 0) creature.state = 'RETURNING';
                break;

            case 'RETURNING': {
                let retX, retY;
                if (creature.patrolPath.length === 0) {
                    retX = creature.startX;
                    retY = creature.startY;
                } else {
                    let minD = Infinity, nearest = creature.patrolPath[0];
                    for (const wp of creature.patrolPath) {
                        const d = Phaser.Math.Distance.Between(creature.x, creature.y, wp.x, wp.y);
                        if (d < minD) { minD = d; nearest = wp; }
                    }
                    retX = nearest.x;
                    retY = nearest.y;
                }
                this.moveToward(creature, retX, retY, CREATURE_CONST.returnSpeed, dt);
                if (Phaser.Math.Distance.Between(creature.x, creature.y, retX, retY) < 10) {
                    creature.state = 'PATROL';
                }
                break;
            }
        }
    }

    moveToward(creature, tx, ty, speed, dt) {
        const dx = tx - creature.x;
        const dy = ty - creature.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            creature.x += (dx / dist) * speed * dt;
            creature.y += (dy / dist) * speed * dt;
            creature.facingAngle = Math.atan2(dy, dx);
        }
    }

    // ========================================================================
    // PLAYER
    // ========================================================================
    handlePlayerInput() {
        if (!this.player) return;
        this.player.vx = 0;
        this.player.vy = 0;

        if (this.cursors.left.isDown || this.wasd.a.isDown) this.player.vx = -PLAYER_CONST.speed;
        if (this.cursors.right.isDown || this.wasd.d.isDown) this.player.vx = PLAYER_CONST.speed;
        if (this.cursors.up.isDown || this.wasd.w.isDown) this.player.vy = -PLAYER_CONST.speed;
        if (this.cursors.down.isDown || this.wasd.s.isDown) this.player.vy = PLAYER_CONST.speed;

        if (this.player.vx !== 0 && this.player.vy !== 0) {
            const f = 1 / Math.SQRT2;
            this.player.vx *= f;
            this.player.vy *= f;
        }
    }

    updatePlayerPosition(dt) {
        if (!this.player) return;
        const newX = this.player.x + this.player.vx * dt;
        const newY = this.player.y + this.player.vy * dt;
        const pw = PLAYER_CONST.width, ph = PLAYER_CONST.height;
        const allBlocks = [...this.wallRects, ...this.obstacleRects];

        let canX = true, canY = true;
        for (const b of allBlocks) {
            if (this.checkRectOverlap(newX - pw / 2, this.player.y - ph / 2, pw, ph, b.x, b.y, b.w, b.h)) canX = false;
            if (this.checkRectOverlap(this.player.x - pw / 2, newY - ph / 2, pw, ph, b.x, b.y, b.w, b.h)) canY = false;
        }
        if (canX) this.player.x = newX;
        if (canY) this.player.y = newY;
    }

    checkRectOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    // ========================================================================
    // GAME FLOW
    // ========================================================================
    playerDeath() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.sound_engine.playDeath();
        this.sound_engine.updateHeartbeat(0);

        // Camera shake
        this.cameras.main.shake(150, 0.01);

        this.deathFlash.alpha = 0.7;
        this.tweens.add({
            targets: this.deathFlash, alpha: 0, duration: 200,
            onComplete: () => {
                this.loadLevel(this.currentLevel);
                this.transitioning = false;
            }
        });
    }

    restartLevel() {
        if (this.transitioning) return;
        this.sound_engine.updateHeartbeat(0);
        this.loadLevel(this.currentLevel);
    }

    completeLevel() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.sound_engine.playComplete();
        this.sound_engine.updateHeartbeat(0);
        this.currentLevel++;

        if (this.currentLevel > 9) {
            this.tweens.add({
                targets: this.fadeRect, alpha: 1, duration: 300,
                onComplete: () => this.displayEnding()
            });
        } else {
            this.tweens.add({
                targets: this.fadeRect, alpha: 1, duration: 300,
                onComplete: () => {
                    this.loadLevel(this.currentLevel);
                    this.gameState = 'playing';
                    this.transitioning = false;
                    this.tweens.add({ targets: this.fadeRect, alpha: 0, duration: 300 });
                }
            });
        }
    }

    displayEnding() {
        this.gameState = 'ending';
        this.clearLevel();
        this.envGraphics.clear();
        this.waveGraphics.clear();
        this.entityGraphics.clear();
        this.vignetteGraphics.clear();
        this.darknessRT.setVisible(false);

        this.cameras.main.setBackgroundColor(0x1a1a2a);
        this.tweens.add({ targets: this.fadeRect, alpha: 0, duration: 2000 });

        const silhouette = this.add.graphics().setDepth(250);
        silhouette.fillStyle(0x3a3a3a, 1);
        silhouette.fillRect(CONFIG.width / 2 - 16, 376, 32, 48);
        silhouette.lineStyle(1, 0x4a4a4a, 1);
        silhouette.strokeRect(CONFIG.width / 2 - 16, 376, 32, 48);
        this.endingTexts.push({ destroy: () => silhouette.destroy() });

        this.time.delayedCall(2000, () => {
            const t1 = this.add.text(CONFIG.width / 2, 550, 'Some fears are louder than others.', {
                fontFamily: 'Georgia, serif', fontSize: '28px', color: '#ffffff'
            }).setOrigin(0.5).setDepth(300).setAlpha(0);
            this.endingTexts.push(t1);
            this.tweens.add({ targets: t1, alpha: 1, duration: 1000 });
        });

        this.time.delayedCall(5000, () => {
            const t2 = this.add.text(CONFIG.width / 2, 600, 'You learned to quiet yours.', {
                fontFamily: 'Georgia, serif', fontSize: '24px', color: '#aaaaaa'
            }).setOrigin(0.5).setDepth(300).setAlpha(0);
            this.endingTexts.push(t2);
            this.tweens.add({ targets: t2, alpha: 1, duration: 1000 });
        });

        this.time.delayedCall(7000, () => {
            const ct = this.add.text(CONFIG.width / 2, 680, 'Click to return', {
                fontFamily: 'Georgia, serif', fontSize: '16px', color: '#333333'
            }).setOrigin(0.5).setDepth(300).setAlpha(0);
            this.endingTexts.push(ct);
            this.tweens.add({ targets: ct, alpha: 0.5, duration: 1000 });
            this.input.once('pointerdown', () => {
                this.cameras.main.setBackgroundColor(0x0a0a0a);
                this.endingTexts.forEach(t => t.destroy());
                this.endingTexts = [];
                this.transitioning = false;
                this.displayTitleScreen();
            });
        });
    }

    // ========================================================================
    // RENDERING
    // ========================================================================
    renderAll(time) {
        this.envGraphics.clear();
        this.waveGraphics.clear();
        this.entityGraphics.clear();
        this.cursorGraphics.clear();
        this.vignetteGraphics.clear();

        if (!this.player) return;

        // --- Environment ---
        for (const w of this.wallRects) {
            this.envGraphics.fillStyle(0x1a1a1a, 1);
            this.envGraphics.fillRect(w.x, w.y, w.w, w.h);
            this.envGraphics.lineStyle(1, 0x252525, 1);
            this.envGraphics.strokeRect(w.x, w.y, w.w, w.h);
        }
        for (const o of this.obstacleRects) {
            this.envGraphics.fillStyle(0x151515, 1);
            this.envGraphics.fillRect(o.x, o.y, o.w, o.h);
        }

        // Exit glow
        if (this.exitObj) {
            const ea = 0.08 + 0.04 * Math.sin(time * 0.003);
            this.envGraphics.fillStyle(0xffffff, ea);
            this.envGraphics.fillCircle(this.exitObj.x + this.exitObj.w / 2, this.exitObj.y + this.exitObj.h / 2, 100);
            this.envGraphics.fillStyle(0xffffff, 0.15);
            this.envGraphics.fillRect(this.exitObj.x, this.exitObj.y, this.exitObj.w, this.exitObj.h);
        }

        // --- Player ---
        this.entityGraphics.fillStyle(0x3a3a3a, 1);
        this.entityGraphics.fillRect(
            this.player.x - PLAYER_CONST.width / 2, this.player.y - PLAYER_CONST.height / 2,
            PLAYER_CONST.width, PLAYER_CONST.height
        );
        this.entityGraphics.lineStyle(1, 0x5a5a5a, 1);
        this.entityGraphics.strokeRect(
            this.player.x - PLAYER_CONST.width / 2, this.player.y - PLAYER_CONST.height / 2,
            PLAYER_CONST.width, PLAYER_CONST.height
        );

        // --- Creatures ---
        for (const c of this.creatures) {
            this.drawCreature(c, time);
        }

        // --- Sound Waves ---
        this.drawSoundWaves();

        // --- Darkness ---
        this.drawDarkness();

        // --- Heartbeat vignette ---
        this.drawVignette(time);

        // --- Cursor Glow ---
        this.drawCursorGlow(time);
    }

    drawCreature(c, time) {
        let drawX = c.x;
        const cw = CREATURE_CONST.width;
        const ch = CREATURE_CONST.height;

        // Sway animation for idle states
        if (c.state === 'PATROL' || c.state === 'ALERT') {
            drawX += Math.sin((c.swayOffset || 0) + time * 0.002) * 3;
        }

        // Body fill: darker when patrolling, lighter when active (so they're visible)
        let bodyColor, outlineColor, outlineAlpha;

        switch (c.state) {
            case 'PATROL':
            case 'RETURNING':
                bodyColor = 0x1a1a1a;   // Dark but distinguishable from pure black
                outlineColor = 0x3a1515; // Subtle dark red
                outlineAlpha = 0.8;
                break;
            case 'ALERT':
                bodyColor = 0x1a1010;   // Slightly reddish tint
                outlineColor = 0x882222; // Bright red outline - they heard you
                outlineAlpha = 1;
                break;
            case 'HUNTING':
                bodyColor = 0x201010;   // Red-tinged body
                outlineColor = 0xaa2020; // Angry bright red
                outlineAlpha = 1;
                break;
            case 'SEARCHING':
                bodyColor = 0x1a1515;
                outlineColor = 0x662020;
                outlineAlpha = 0.9;
                break;
            default:
                bodyColor = 0x1a1a1a;
                outlineColor = 0x3a1515;
                outlineAlpha = 0.8;
        }

        const x = drawX - cw / 2;
        const y = c.y - ch / 2;

        // Body
        this.entityGraphics.fillStyle(bodyColor, 1);
        this.entityGraphics.fillRect(x, y, cw, ch);

        // Outline (thicker when hunting/alert)
        const lineWidth = (c.state === 'HUNTING' || c.state === 'ALERT') ? 2 : 1;
        this.entityGraphics.lineStyle(lineWidth, outlineColor, outlineAlpha);
        this.entityGraphics.strokeRect(x, y, cw, ch);

        // Alert flash: bright pulse when first alerted
        if (c.alertFlash > 0) {
            this.entityGraphics.fillStyle(0xff3333, c.alertFlash * 0.3);
            this.entityGraphics.fillRect(x, y, cw, ch);
        }

        // Head region indicator (smooth, eyeless) - subtle lighter band
        this.entityGraphics.fillStyle(bodyColor, 0.5);
        this.entityGraphics.fillRect(x + 4, y + 2, cw - 8, 14);

        // Facing indicator: a small triangle/line showing where they're listening
        if (c.state === 'ALERT' || c.state === 'HUNTING' || c.state === 'SEARCHING') {
            const cx = drawX;
            const cy = c.y - ch / 2 + 8; // Head center
            const fx = cx + Math.cos(c.facingAngle) * 12;
            const fy = cy + Math.sin(c.facingAngle) * 12;
            this.entityGraphics.lineStyle(2, outlineColor, outlineAlpha * 0.7);
            this.entityGraphics.lineBetween(cx, cy, fx, fy);
        }
    }

    drawSoundWaves() {
        for (const wave of this.soundWaves) {
            const alpha = WAVE_CONST.maxAlpha * (1 - wave.currentRadius / wave.maxRadius);
            if (alpha > 0) {
                this.waveGraphics.lineStyle(WAVE_CONST.strokeWidth, 0x6666aa, alpha);
                this.waveGraphics.strokeCircle(wave.x, wave.y, wave.currentRadius);
            }
        }
    }

    drawDarkness() {
        if (!this.player) return;

        this.darknessRT.fill(0x0a0a0a, 0.95);

        const lightImg = this.playerLightRadius <= 100 ? this.lightPlayerSmallImg : this.lightPlayerImg;
        const r = this.playerLightRadius;
        this.darknessRT.erase(lightImg, this.player.x - r, this.player.y - r);
        this.darknessRT.erase(this.lightCursorImg, this.cursorPos.x - 60, this.cursorPos.y - 60);

        if (this.exitObj) {
            const ex = this.exitObj.x + this.exitObj.w / 2;
            const ey = this.exitObj.y + this.exitObj.h / 2;
            this.darknessRT.erase(this.lightExitImg, ex - 100, ey - 100);
        }
    }

    drawVignette(time) {
        // Heartbeat vignette: screen edges darken and pulse when creatures are near
        if (this.nearestCreatureDist >= 200 || this.creatures.length === 0) return;

        const intensity = Math.max(0, 1 - this.nearestCreatureDist / 200);
        // Pulse with heartbeat rhythm
        const bpm = 60 + intensity * 90;
        const beatPhase = (time / 1000) * (bpm / 60) * Math.PI * 2;
        const pulse = 0.5 + 0.5 * Math.pow(Math.sin(beatPhase), 8); // Sharp pulse

        const alpha = intensity * 0.4 * (0.6 + 0.4 * pulse);

        // Draw vignette: dark red bars on edges, fading inward
        const w = CONFIG.width;
        const h = CONFIG.height;
        const thickness = 80 + intensity * 60;

        // Top
        this.vignetteGraphics.fillStyle(0x200000, alpha);
        this.vignetteGraphics.fillRect(0, 0, w, thickness * 0.5);
        this.vignetteGraphics.fillStyle(0x200000, alpha * 0.5);
        this.vignetteGraphics.fillRect(0, thickness * 0.5, w, thickness * 0.5);

        // Bottom
        this.vignetteGraphics.fillStyle(0x200000, alpha);
        this.vignetteGraphics.fillRect(0, h - thickness * 0.5, w, thickness * 0.5);
        this.vignetteGraphics.fillStyle(0x200000, alpha * 0.5);
        this.vignetteGraphics.fillRect(0, h - thickness, w, thickness * 0.5);

        // Left
        this.vignetteGraphics.fillStyle(0x200000, alpha);
        this.vignetteGraphics.fillRect(0, 0, thickness * 0.5, h);
        this.vignetteGraphics.fillStyle(0x200000, alpha * 0.5);
        this.vignetteGraphics.fillRect(thickness * 0.5, 0, thickness * 0.5, h);

        // Right
        this.vignetteGraphics.fillStyle(0x200000, alpha);
        this.vignetteGraphics.fillRect(w - thickness * 0.5, 0, thickness * 0.5, h);
        this.vignetteGraphics.fillStyle(0x200000, alpha * 0.5);
        this.vignetteGraphics.fillRect(w - thickness, 0, thickness * 0.5, h);
    }

    drawCursorGlow(time) {
        const alpha = 0.25 + 0.1 * Math.sin(time * 0.003);
        this.cursorGraphics.fillStyle(0x8888cc, alpha);
        this.cursorGraphics.fillCircle(this.cursorPos.x, this.cursorPos.y, CURSOR_CONST.glowRadius);
    }
}

// ============================================================================
// PHASER CONFIG & LAUNCH
// ============================================================================
const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: CONFIG.width,
    height: CONFIG.height,
    backgroundColor: '#0a0a0a',
    parent: document.body,
    scene: [GameScene],
    input: { mouse: { target: null } }
});
