// ==================== CONFIGURATION ====================

const COLORS = {
    background: 0x1a1a2e,
    wall: 0x4a4e69,
    player: 0x00d9ff,
    plateInactive: 0x5c5c5c,
    plateActive: 0x00ff88,
    doorLocked: 0xff6b6b,
    exitPortal: 0xffd700,
    laser: 0xff0044,
    platform: 0x8b5cf6
};

const TILE_SIZE = 40;

const PLAYER_CONFIG = {
    speed: 200,
    jumpVelocity: -400,
    acceleration: 2000,
    deceleration: 2000,
    maxFallSpeed: 600
};

// ==================== ROOM DATA ====================

const ROOMS = [
    // Room 0: Awakening
    {
        name: "AWAKENING",
        hint: "ARROW KEYS or WASD to move. SPACE or UP to jump.",
        layout: [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWW..WWWWWWWWWW",
            "WWWWWWWW..WWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW"
        ],
        playerSpawn: { x: 100, y: 440 },
        ghostSpawns: [],
        pressurePlates: [],
        doors: [],
        exitPosition: { x: 540, y: 400 }
    },

    // Room 1: Echo
    {
        name: "ECHO",
        hint: "Watch your echo. It remembers.",
        layout: [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW"
        ],
        playerSpawn: { x: 100, y: 200 },
        ghostSpawns: [
            { x: 100, y: 440, fromRoom: 0 }
        ],
        pressurePlates: [
            { x: 420, y: 475, controls: 0 }
        ],
        doors: [
            { x: 540, y: 160, condition: "plate0" }
        ],
        exitPosition: { x: 620, y: 160 }
    },

    // Room 2: Holdfast
    {
        name: "HOLDFAST",
        hint: "This door needs someone to hold it. Plan ahead.",
        layout: [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW"
        ],
        playerSpawn: { x: 100, y: 440 },
        ghostSpawns: [
            { x: 140, y: 440, fromRoom: 1 }
        ],
        pressurePlates: [
            { x: 420, y: 475, controls: 0 }
        ],
        doors: [
            { x: 580, y: 400, condition: "plate0" }
        ],
        exitPosition: { x: 700, y: 400 }
    },

    // Room 3: Faith
    {
        name: "FAITH",
        hint: "Work together. Trust the timing.",
        layout: [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWW..WW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW"
        ],
        playerSpawn: { x: 100, y: 200 },
        ghostSpawns: [
            { x: 100, y: 440, fromRoom: 2 }
        ],
        pressurePlates: [
            { x: 420, y: 475, controls: 0 },
            { x: 620, y: 235, controls: 1 }
        ],
        doors: [
            { x: 420, y: 160, condition: "plate0" },
            { x: 620, y: 400, condition: "plate1" }
        ],
        exitPosition: { x: 700, y: 400 }
    },

    // Room 4: Communion
    {
        name: "COMMUNION",
        hint: "Two echoes, two plates. Both must agree.",
        layout: [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "WWWWWW.......WWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWW..WWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW"
        ],
        playerSpawn: { x: 100, y: 80 },
        ghostSpawns: [
            { x: 100, y: 240, fromRoom: 3 },
            { x: 100, y: 440, fromRoom: 2 }
        ],
        pressurePlates: [
            { x: 260, y: 275, controls: 0 },
            { x: 260, y: 475, controls: 1 }
        ],
        doors: [
            { x: 620, y: 40, condition: "plate0 AND plate1" }
        ],
        exitPosition: { x: 700, y: 40 }
    },

    // Room 5: Convergence
    {
        name: "CONVERGENCE",
        hint: "The light burns. Freeze it with perfect timing.",
        layout: [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW"
        ],
        playerSpawn: { x: 100, y: 440 },
        ghostSpawns: [
            { x: 140, y: 440, fromRoom: 4 }
        ],
        pressurePlates: [
            { x: 340, y: 475, controls: 0 }
        ],
        doors: [],
        exitPosition: { x: 700, y: 400 },
        laser: {
            x: 460,
            y: 440,
            startAngle: -Math.PI / 2,
            minAngle: -Math.PI / 2,
            maxAngle: -Math.PI / 6,
            controlPlate: 0
        }
    },

    // Room 6: Reunion
    {
        name: "REUNION",
        hint: "Everything you've learned. Everyone you've been.",
        layout: [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWW..WWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWW..WWWWWWW",
            "W..................W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
            "WWWWWWWWWWWWWWWWWWWW"
        ],
        playerSpawn: { x: 100, y: 80 },
        ghostSpawns: [
            { x: 60, y: 240, fromRoom: 5 },
            { x: 100, y: 400, fromRoom: 4 },
            { x: 100, y: 480, fromRoom: 3 }
        ],
        pressurePlates: [
            { x: 260, y: 275, controls: 0 },
            { x: 260, y: 435, controls: 1 },
            { x: 260, y: 515, controls: 2 }
        ],
        doors: [
            { x: 220, y: 40, condition: "plate1" }
        ],
        exitPosition: { x: 700, y: 40 },
        laser: {
            x: 380,
            y: 240,
            startAngle: -Math.PI / 4,
            minAngle: -Math.PI / 4,
            maxAngle: Math.PI / 4,
            controlPlate: 0
        },
        movingPlatform: {
            x: 460,
            y: 80,
            controlPlate: 2
        }
    }
];

// ==================== AUDIO SYSTEM ====================

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    jump() {
        if (!this.audioContext) return;
        this.resume();
        const osc = this.audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        osc.connect(gain).connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    land() {
        if (!this.audioContext) return;
        this.resume();
        const bufferSize = Math.floor(this.audioContext.sampleRate * 0.05);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        source.connect(filter).connect(gain).connect(this.audioContext.destination);
        source.start();
    }

    plateOn() {
        if (!this.audioContext) return;
        this.resume();
        const notes = [440, 554, 659];
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const gain = this.audioContext.createGain();
            const startTime = this.audioContext.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);
            osc.connect(gain).connect(this.audioContext.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.08);
        });
    }

    plateOff() {
        if (!this.audioContext) return;
        this.resume();
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        osc.connect(gain).connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    doorOpen() {
        if (!this.audioContext) return;
        this.resume();
        const bufferSize = Math.floor(this.audioContext.sampleRate * 0.3);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        source.connect(filter).connect(gain).connect(this.audioContext.destination);
        source.start();
    }

    ghostSpawn() {
        if (!this.audioContext) return;
        this.resume();
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 300;
        const vibrato = this.audioContext.createOscillator();
        vibrato.frequency.value = 8;
        const vibratoGain = this.audioContext.createGain();
        vibratoGain.gain.value = 50;
        vibrato.connect(vibratoGain).connect(osc.frequency);
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.4);
        osc.connect(gain).connect(this.audioContext.destination);
        vibrato.start();
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.4);
        vibrato.stop(this.audioContext.currentTime + 0.4);
    }

    laserHit() {
        if (!this.audioContext) return;
        this.resume();
        // Noise burst
        const bufferSize = Math.floor(this.audioContext.sampleRate * 0.3);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        const gain1 = this.audioContext.createGain();
        gain1.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        source.connect(gain1).connect(this.audioContext.destination);
        source.start();

        // Descending square wave
        const osc = this.audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        const gain2 = this.audioContext.createGain();
        gain2.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        osc.connect(gain2).connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    roomComplete() {
        if (!this.audioContext) return;
        this.resume();
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const gain = this.audioContext.createGain();
            const startTime = this.audioContext.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            osc.connect(gain).connect(this.audioContext.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        });
    }

    victory() {
        if (!this.audioContext) return;
        this.resume();
        const notes = [262, 330, 392, 523];
        notes.forEach((freq) => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 1);
            gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
            osc.connect(gain).connect(this.audioContext.destination);
            osc.start();
            osc.stop(this.audioContext.currentTime + 2);
        });
    }
}

const audioSystem = new AudioSystem();

// ==================== BOOT SCENE ====================

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        // Initialize global game state
        this.registry.set('currentRoom', 0);
        this.registry.set('totalTime', 0);
        this.registry.set('ghostRecordings', []);

        // Initialize audio on first user interaction
        this.input.on('pointerdown', () => {
            audioSystem.init();
        });
        this.input.keyboard.on('keydown', () => {
            audioSystem.init();
        });

        // Start game
        this.scene.start('GameScene');
    }
}

// ==================== GAME SCENE ====================

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Get current room index
        this.currentRoom = this.registry.get('currentRoom');
        this.ghostRecordings = this.registry.get('ghostRecordings');

        // Room time tracking
        this.roomTime = 0;
        this.currentRecording = [];

        // Track previous jump state for edge detection
        this.wasJumpPressed = false;
        this.playerWasOnGround = false;
        this.jumpJustPressed = false;

        // Player trail for visual feedback
        this.playerTrail = [];
        this.trailGraphics = this.add.graphics();

        // Ghost afterimage system
        this.ghostAfterimages = [];

        // Initialize ghosts array (populated later by spawnGhosts)
        this.ghosts = [];

        // Ambient particles for atmosphere
        this.ambientParticles = [];
        this.createAmbientParticles();

        // Create room based on currentRoom index
        this.createRoom(this.currentRoom);

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            space: 'SPACE',
            reset: 'R',
            pause: 'ESC'
        });

        // UI elements
        this.createUI();

        // Show hint text
        this.showHint(ROOMS[this.currentRoom].hint);

        // Spawn ghosts from previous recordings (with dramatic effect)
        this.time.delayedCall(300, () => {
            this.spawnGhosts();
            // Update ghost counter after spawning
            const ghostCount = this.ghosts ? this.ghosts.length : 0;
            this.ghostCountText.setText('GHOSTS: ' + ghostCount);
        });

        // Room transition fade-in
        this.cameras.main.fadeIn(500);

        // Track if transitioning to prevent double triggers
        this.isTransitioning = false;
    }

    createAmbientParticles() {
        // Create subtle floating particles for atmosphere
        for (let i = 0; i < 20; i++) {
            const particle = this.add.rectangle(
                Phaser.Math.Between(50, 750),
                Phaser.Math.Between(50, 550),
                Phaser.Math.Between(2, 4),
                Phaser.Math.Between(2, 4),
                0x00d9ff
            );
            particle.setAlpha(Phaser.Math.FloatBetween(0.05, 0.15));
            particle.setData('speedX', Phaser.Math.FloatBetween(-10, 10));
            particle.setData('speedY', Phaser.Math.FloatBetween(-20, -5));
            particle.setData('drift', Phaser.Math.FloatBetween(0, Math.PI * 2));
            this.ambientParticles.push(particle);
        }
    }

    createRoom(roomIndex) {
        const room = ROOMS[roomIndex];

        // Create wall graphics
        this.walls = this.physics.add.staticGroup();

        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 20; col++) {
                if (room.layout[row][col] === 'W') {
                    const wall = this.add.rectangle(
                        col * TILE_SIZE + TILE_SIZE / 2,
                        row * TILE_SIZE + TILE_SIZE / 2,
                        TILE_SIZE,
                        TILE_SIZE,
                        COLORS.wall
                    );
                    this.physics.add.existing(wall, true);
                    this.walls.add(wall);
                }
            }
        }

        // Create player glow (drawn behind player)
        const spawnPos = room.playerSpawn;
        this.playerGlow = this.add.rectangle(spawnPos.x, spawnPos.y, 40, 40, COLORS.player);
        this.playerGlow.setAlpha(0.3);

        // Create player
        this.player = this.add.rectangle(spawnPos.x, spawnPos.y, 32, 32, COLORS.player);
        this.player.setStrokeStyle(2, 0xffffff, 0.3);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(false);
        this.player.body.setMaxVelocity(PLAYER_CONFIG.speed, PLAYER_CONFIG.maxFallSpeed);

        // Player-wall collision
        this.physics.add.collider(this.player, this.walls);

        // Create pressure plates
        this.pressurePlates = [];
        this.plateOriginalY = [];
        for (const plateData of room.pressurePlates) {
            const plate = this.add.rectangle(plateData.x, plateData.y, 40, 10, COLORS.plateInactive);
            plate.setData('active', false);
            plate.setData('controlsIndex', plateData.controls);
            this.plateOriginalY.push(plateData.y);
            this.pressurePlates.push(plate);
        }

        // Create doors
        this.doors = [];
        for (const doorData of room.doors) {
            const door = this.add.rectangle(doorData.x, doorData.y + 40, 40, 80, COLORS.doorLocked);
            this.physics.add.existing(door, true);
            door.setData('open', false);
            door.setData('openCondition', doorData.condition);
            door.setData('originalY', doorData.y + 40);
            this.doors.push(door);
            this.physics.add.collider(this.player, door);
        }

        // Create exit portal
        const exitPos = room.exitPosition;
        this.exitPortal = this.add.rectangle(exitPos.x, exitPos.y + 40, 40, 80, COLORS.exitPortal);
        this.exitPortal.setAlpha(0.8);
        this.exitParticles = [];
        this.createExitParticles();

        // Create laser if present
        if (room.laser) {
            this.laser = {
                x: room.laser.x,
                y: room.laser.y,
                angle: room.laser.startAngle,
                minAngle: room.laser.minAngle,
                maxAngle: room.laser.maxAngle,
                frozen: false,
                freezeTimer: 0,
                controlPlate: room.laser.controlPlate,
                endX: 0,
                endY: 0
            };
            this.laserGraphics = this.add.graphics();
        } else {
            this.laser = null;
        }

        // Create moving platform if present
        if (room.movingPlatform) {
            this.movingPlatform = this.add.rectangle(
                room.movingPlatform.x,
                room.movingPlatform.y,
                80, 16,
                COLORS.platform
            );
            this.physics.add.existing(this.movingPlatform, true);
            this.movingPlatform.setData('startX', room.movingPlatform.x);
            this.movingPlatform.setData('endX', room.movingPlatform.x + 160);
            this.movingPlatform.setData('controlPlate', room.movingPlatform.controlPlate);
            this.physics.add.collider(this.player, this.movingPlatform);
        } else {
            this.movingPlatform = null;
        }
    }

    spawnGhosts() {
        this.ghosts = [];
        const room = ROOMS[this.currentRoom];

        for (let i = 0; i < room.ghostSpawns.length; i++) {
            const ghostSpawn = room.ghostSpawns[i];
            const recordingIndex = ghostSpawn.fromRoom;

            if (recordingIndex < this.ghostRecordings.length && this.ghostRecordings[recordingIndex]) {
                const recording = this.ghostRecordings[recordingIndex];

                // Set opacity based on how old the recording is
                const age = this.currentRoom - recordingIndex;
                const opacity = Math.max(0.2, 0.5 - (age - 1) * 0.15);

                // Create dramatic spawn effect - expanding ring
                const spawnRing = this.add.circle(ghostSpawn.x, ghostSpawn.y, 5, 0x00d9ff, 0.8);
                this.tweens.add({
                    targets: spawnRing,
                    radius: 60,
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => spawnRing.destroy()
                });

                // Create ghost sprite (starts invisible, fades in)
                const ghost = this.add.rectangle(ghostSpawn.x, ghostSpawn.y, 32, 32, COLORS.player);
                ghost.setAlpha(0);
                this.physics.add.existing(ghost);

                // Fade in the ghost
                this.tweens.add({
                    targets: ghost,
                    alpha: opacity,
                    duration: 300,
                    delay: 100
                });

                ghost.setData('recording', recording);
                ghost.setData('playbackIndex', 0);
                ghost.setData('baseOpacity', opacity);
                ghost.setData('lastX', ghostSpawn.x);
                ghost.setData('lastY', ghostSpawn.y);
                ghost.body.setMaxVelocity(PLAYER_CONFIG.speed, PLAYER_CONFIG.maxFallSpeed);

                // Ghost-wall collision
                this.physics.add.collider(ghost, this.walls);

                // Ghost-door collision
                for (const door of this.doors) {
                    this.physics.add.collider(ghost, door);
                }

                // Ghost-platform collision if exists
                if (this.movingPlatform) {
                    this.physics.add.collider(ghost, this.movingPlatform);
                }

                this.ghosts.push(ghost);

                // Play ghost spawn sound
                audioSystem.ghostSpawn();
            }
        }
    }

    createUI() {
        // Room title
        this.titleText = this.add.text(400, 30, ROOMS[this.currentRoom].name, {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // Ghost counter
        this.ghostCountText = this.add.text(780, 30, 'GHOSTS: 0', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(1, 0.5);

        // Timer
        this.timerText = this.add.text(20, 30, 'TIME: 0:00', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        // Recording indicator - pulsing to show actions are being captured
        this.recIndicator = this.add.text(20, 60, '● REC', {
            fontFamily: 'Courier New',
            fontSize: '12px',
            color: '#ff4444'
        }).setOrigin(0, 0.5);

        // Pulse the recording indicator
        this.tweens.add({
            targets: this.recIndicator,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Reset prompt
        this.resetText = this.add.text(780, 580, '[R] RESET ROOM', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(1, 0.5);
    }

    showHint(hintText) {
        // Create hint with typewriter effect
        const hint = this.add.text(400, 560, '', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5, 0.5);

        // Typewriter effect
        let charIndex = 0;
        const typewriter = this.time.addEvent({
            delay: 30,
            callback: () => {
                hint.setText(hintText.substring(0, charIndex + 1));
                charIndex++;
                if (charIndex >= hintText.length) {
                    typewriter.remove();
                }
            },
            repeat: hintText.length - 1
        });

        // Fade out after display
        this.time.delayedCall(4000, () => {
            this.tweens.add({
                targets: hint,
                alpha: 0,
                duration: 800,
                onComplete: () => hint.destroy()
            });
        });
    }

    createExitParticles() {
        // Create 8 particle rectangles that float upward
        for (let i = 0; i < 8; i++) {
            const particle = this.add.rectangle(
                this.exitPortal.x + Phaser.Math.Between(-15, 15),
                this.exitPortal.y + Phaser.Math.Between(0, 60),
                4, 4,
                COLORS.exitPortal
            );
            particle.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
            particle.setData('baseY', this.exitPortal.y + 60);
            this.exitParticles.push(particle);
        }
    }

    update(time, delta) {
        if (this.isTransitioning) return;

        const deltaSeconds = delta / 1000;
        this.roomTime += deltaSeconds;

        // Update total time
        let totalTime = this.registry.get('totalTime') + deltaSeconds;
        this.registry.set('totalTime', totalTime);

        // Update timer display
        const minutes = Math.floor(totalTime / 60);
        const seconds = Math.floor(totalTime % 60);
        this.timerText.setText('TIME: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds);

        // Handle input
        this.handleInput();

        // Record player input
        this.recordInput();

        // Update ghosts
        this.updateGhosts();

        // Update pressure plates
        this.updatePressurePlates();

        // Update doors
        this.updateDoors();

        // Update laser if present
        if (this.laser) {
            this.updateLaser(deltaSeconds);
        }

        // Update moving platform if present
        if (this.movingPlatform) {
            this.updateMovingPlatform(deltaSeconds);
        }

        // Update exit portal visual
        this.updateExitPortal();

        // Update player trail
        this.updatePlayerTrail();

        // Update ghost afterimages
        this.updateGhostAfterimages();

        // Update ambient particles
        this.updateAmbientParticles(deltaSeconds);

        // Check win/lose conditions
        this.checkConditions();

        // Check reset key
        if (Phaser.Input.Keyboard.JustDown(this.wasd.reset)) {
            this.resetRoom();
        }
    }

    updatePlayerTrail() {
        // Update player glow position
        if (this.playerGlow) {
            this.playerGlow.x = this.player.x;
            this.playerGlow.y = this.player.y;
            // Subtle pulse
            this.playerGlow.setAlpha(0.25 + Math.sin(this.roomTime * 4) * 0.1);
            this.playerGlow.setScale(1 + Math.sin(this.roomTime * 4) * 0.05);
        }

        // Add current position to trail
        this.playerTrail.push({
            x: this.player.x,
            y: this.player.y,
            age: 0
        });

        // Keep only recent trail points
        if (this.playerTrail.length > 20) {
            this.playerTrail.shift();
        }

        // Age all points
        for (const point of this.playerTrail) {
            point.age += 1;
        }

        // Draw trail
        this.trailGraphics.clear();
        for (let i = 0; i < this.playerTrail.length; i++) {
            const point = this.playerTrail[i];
            const alpha = (1 - point.age / 25) * 0.3;
            const size = 32 * (1 - point.age / 30);
            if (alpha > 0 && size > 0) {
                this.trailGraphics.fillStyle(0x00d9ff, alpha);
                this.trailGraphics.fillRect(
                    point.x - size / 2,
                    point.y - size / 2,
                    size,
                    size
                );
            }
        }
    }

    updateGhostAfterimages() {
        // Create afterimages for moving ghosts
        for (const ghost of this.ghosts) {
            const lastX = ghost.getData('lastX');
            const lastY = ghost.getData('lastY');
            const moved = Math.abs(ghost.x - lastX) > 2 || Math.abs(ghost.y - lastY) > 2;

            if (moved && Math.random() < 0.15) {
                const afterimage = this.add.rectangle(
                    ghost.x,
                    ghost.y,
                    32, 32,
                    COLORS.player
                );
                afterimage.setAlpha(ghost.getData('baseOpacity') * 0.5);
                this.ghostAfterimages.push(afterimage);

                // Fade out afterimage
                this.tweens.add({
                    targets: afterimage,
                    alpha: 0,
                    scale: 0.8,
                    duration: 400,
                    onComplete: () => {
                        afterimage.destroy();
                        const idx = this.ghostAfterimages.indexOf(afterimage);
                        if (idx > -1) this.ghostAfterimages.splice(idx, 1);
                    }
                });
            }

            ghost.setData('lastX', ghost.x);
            ghost.setData('lastY', ghost.y);
        }
    }

    updateAmbientParticles(deltaSeconds) {
        for (const particle of this.ambientParticles) {
            // Gentle drifting motion
            const drift = particle.getData('drift');
            particle.x += particle.getData('speedX') * deltaSeconds + Math.sin(this.roomTime * 2 + drift) * 0.3;
            particle.y += particle.getData('speedY') * deltaSeconds;

            // Wrap around screen
            if (particle.y < 30) {
                particle.y = 580;
                particle.x = Phaser.Math.Between(50, 750);
            }
            if (particle.x < 30) particle.x = 770;
            if (particle.x > 770) particle.x = 30;

            // Subtle pulsing
            particle.setAlpha(0.05 + Math.sin(this.roomTime * 3 + drift) * 0.05);
        }
    }

    handleInput() {
        const body = this.player.body;

        // Horizontal movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            body.setAccelerationX(-PLAYER_CONFIG.acceleration);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            body.setAccelerationX(PLAYER_CONFIG.acceleration);
        } else {
            // Decelerate
            if (body.velocity.x > 0) {
                body.setAccelerationX(-PLAYER_CONFIG.deceleration);
                if (body.velocity.x < 0) {
                    body.setVelocityX(0);
                    body.setAccelerationX(0);
                }
            } else if (body.velocity.x < 0) {
                body.setAccelerationX(PLAYER_CONFIG.deceleration);
                if (body.velocity.x > 0) {
                    body.setVelocityX(0);
                    body.setAccelerationX(0);
                }
            } else {
                body.setAccelerationX(0);
            }
        }

        // Clamp horizontal velocity
        body.setVelocityX(Phaser.Math.Clamp(body.velocity.x, -PLAYER_CONFIG.speed, PLAYER_CONFIG.speed));

        // Jump
        const jumpPressed = this.cursors.up.isDown || this.wasd.up.isDown || this.wasd.space.isDown;
        const onGround = body.blocked.down || body.touching.down;

        // Detect jump just pressed (before updating wasJumpPressed)
        this.jumpJustPressed = jumpPressed && !this.wasJumpPressed;

        if (this.jumpJustPressed && onGround) {
            body.setVelocityY(PLAYER_CONFIG.jumpVelocity);
            audioSystem.jump();
        }

        // Track landing
        if (onGround && !this.playerWasOnGround && body.velocity.y >= 0) {
            audioSystem.land();
        }
        this.playerWasOnGround = onGround;
        this.wasJumpPressed = jumpPressed;
    }

    recordInput() {
        const inputFrame = {
            timestamp: this.roomTime * 1000,
            left: this.cursors.left.isDown || this.wasd.left.isDown,
            right: this.cursors.right.isDown || this.wasd.right.isDown,
            jump: this.jumpJustPressed || false
        };
        this.currentRecording.push(inputFrame);
    }

    updateGhosts() {
        for (const ghost of this.ghosts) {
            const recording = ghost.getData('recording');
            const playbackTime = this.roomTime * 1000;
            let playbackIndex = ghost.getData('playbackIndex');

            // Advance to correct frame
            while (playbackIndex < recording.length - 1 &&
                recording[playbackIndex + 1].timestamp <= playbackTime) {
                playbackIndex++;
            }

            ghost.setData('playbackIndex', playbackIndex);

            if (playbackIndex < recording.length) {
                const frame = recording[playbackIndex];
                const body = ghost.body;

                // Apply horizontal movement
                if (frame.left) {
                    body.setAccelerationX(-PLAYER_CONFIG.acceleration);
                } else if (frame.right) {
                    body.setAccelerationX(PLAYER_CONFIG.acceleration);
                } else {
                    if (body.velocity.x > 0) {
                        body.setAccelerationX(-PLAYER_CONFIG.deceleration);
                        if (body.velocity.x < 0) {
                            body.setVelocityX(0);
                            body.setAccelerationX(0);
                        }
                    } else if (body.velocity.x < 0) {
                        body.setAccelerationX(PLAYER_CONFIG.deceleration);
                        if (body.velocity.x > 0) {
                            body.setVelocityX(0);
                            body.setAccelerationX(0);
                        }
                    } else {
                        body.setAccelerationX(0);
                    }
                }

                body.setVelocityX(Phaser.Math.Clamp(body.velocity.x, -PLAYER_CONFIG.speed, PLAYER_CONFIG.speed));

                // Apply jump
                const onGround = body.blocked.down || body.touching.down;
                if (frame.jump && onGround) {
                    body.setVelocityY(PLAYER_CONFIG.jumpVelocity);
                }
            }
        }
    }

    updatePressurePlates() {
        for (let i = 0; i < this.pressurePlates.length; i++) {
            const plate = this.pressurePlates[i];
            const plateBounds = plate.getBounds();
            const wasActive = plate.getData('active');
            let nowActive = false;

            // Check player overlap
            const playerBounds = this.player.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, plateBounds)) {
                if ((this.player.body.blocked.down || this.player.body.touching.down) &&
                    Math.abs(this.player.y + 16 - plate.y) < 25) {
                    nowActive = true;
                }
            }

            // Check ghost overlaps
            for (const ghost of this.ghosts) {
                const ghostBounds = ghost.getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(ghostBounds, plateBounds)) {
                    if ((ghost.body.blocked.down || ghost.body.touching.down) &&
                        Math.abs(ghost.y + 16 - plate.y) < 25) {
                        nowActive = true;
                    }
                }
            }

            plate.setData('active', nowActive);

            // Update visual
            if (nowActive) {
                plate.setFillStyle(COLORS.plateActive);
                plate.setY(this.plateOriginalY[i] + 5);
            } else {
                plate.setFillStyle(COLORS.plateInactive);
                plate.setY(this.plateOriginalY[i]);
            }

            // Play sounds
            if (nowActive && !wasActive) {
                audioSystem.plateOn();
            } else if (!nowActive && wasActive) {
                audioSystem.plateOff();
            }
        }
    }

    updateDoors() {
        for (const door of this.doors) {
            const condition = door.getData('openCondition');
            const shouldBeOpen = this.evaluateCondition(condition);
            const wasOpen = door.getData('open');

            if (shouldBeOpen && !wasOpen) {
                // Open door (animate up)
                door.setData('open', true);
                door.body.enable = false;
                this.tweens.add({
                    targets: door,
                    y: door.getData('originalY') - 80,
                    alpha: 0.3,
                    duration: 300
                });
                audioSystem.doorOpen();
            } else if (!shouldBeOpen && wasOpen) {
                // Close door (animate down)
                door.setData('open', false);
                door.body.enable = true;
                this.tweens.add({
                    targets: door,
                    y: door.getData('originalY'),
                    alpha: 1,
                    duration: 300
                });
            }
        }
    }

    evaluateCondition(condition) {
        if (condition.includes(' AND ')) {
            const parts = condition.split(' AND ');
            let result = true;
            for (const part of parts) {
                const plateIndex = parseInt(part.replace('plate', ''));
                result = result && this.pressurePlates[plateIndex].getData('active');
            }
            return result;
        } else {
            const plateIndex = parseInt(condition.replace('plate', ''));
            return this.pressurePlates[plateIndex].getData('active');
        }
    }

    updateLaser(deltaSeconds) {
        // Check if frozen by pressure plate
        if (this.laser.controlPlate !== undefined && this.pressurePlates[this.laser.controlPlate]) {
            if (this.pressurePlates[this.laser.controlPlate].getData('active')) {
                this.laser.frozen = true;
                this.laser.freezeTimer = 2.0;
            }
        }

        // Update freeze timer
        if (this.laser.frozen) {
            this.laser.freezeTimer -= deltaSeconds;
            if (this.laser.freezeTimer <= 0) {
                this.laser.frozen = false;
            }
        } else {
            // Rotate laser
            this.laser.angle += 45 * (Math.PI / 180) * deltaSeconds;

            // Clamp to sweep range (reset to min when exceeding max)
            if (this.laser.angle > this.laser.maxAngle) {
                this.laser.angle = this.laser.minAngle;
            }
        }

        // Draw laser
        this.laserGraphics.clear();

        // Flicker when frozen
        let alpha = 1.0;
        if (this.laser.frozen) {
            alpha = (Math.floor(this.roomTime * 10) % 2 === 0) ? 0.8 : 1.0;
        }

        this.laserGraphics.lineStyle(4, COLORS.laser, alpha);

        this.laser.endX = this.laser.x + Math.cos(this.laser.angle) * 400;
        this.laser.endY = this.laser.y + Math.sin(this.laser.angle) * 400;

        this.laserGraphics.beginPath();
        this.laserGraphics.moveTo(this.laser.x, this.laser.y);
        this.laserGraphics.lineTo(this.laser.endX, this.laser.endY);
        this.laserGraphics.strokePath();
    }

    updateMovingPlatform(deltaSeconds) {
        const controlPlate = this.movingPlatform.getData('controlPlate');
        const active = this.pressurePlates[controlPlate] ? this.pressurePlates[controlPlate].getData('active') : false;

        const startX = this.movingPlatform.getData('startX');
        const endX = this.movingPlatform.getData('endX');
        let currentX = this.movingPlatform.x;

        if (active) {
            // Move right
            let newX = currentX + 100 * deltaSeconds;
            if (newX > endX) {
                newX = endX;
            }
            this.movingPlatform.setX(newX);
            this.movingPlatform.body.updateFromGameObject();
        } else {
            // Move left
            let newX = currentX - 100 * deltaSeconds;
            if (newX < startX) {
                newX = startX;
            }
            this.movingPlatform.setX(newX);
            this.movingPlatform.body.updateFromGameObject();
        }
    }

    updateExitPortal() {
        // Pulse effect
        const pulsePhase = (this.roomTime * 1000) % 1000 / 1000;
        const opacity = 0.7 + 0.3 * Math.sin(pulsePhase * Math.PI * 2);
        this.exitPortal.setAlpha(opacity);

        // Update particles
        for (const particle of this.exitParticles) {
            particle.y -= 30 * (1 / 60);

            // Reset when too high
            if (particle.y < this.exitPortal.y - 60) {
                particle.y = particle.getData('baseY');
                particle.x = this.exitPortal.x + Phaser.Math.Between(-15, 15);
                particle.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
            }
        }
    }

    checkConditions() {
        // Check exit collision
        const playerBounds = this.player.getBounds();
        const exitBounds = this.exitPortal.getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, exitBounds)) {
            this.completeRoom();
            return;
        }

        // Check fell off screen
        if (this.player.y > 650) {
            this.resetRoom();
            return;
        }

        // Check laser collision
        if (this.laser) {
            const laserLine = new Phaser.Geom.Line(
                this.laser.x, this.laser.y,
                this.laser.endX, this.laser.endY
            );

            if (Phaser.Geom.Intersects.LineToRectangle(laserLine, playerBounds)) {
                audioSystem.laserHit();
                this.resetRoom();
                return;
            }
        }
    }

    completeRoom() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Save recording for this room
        const recordings = this.registry.get('ghostRecordings');
        recordings[this.currentRoom] = this.currentRecording;
        this.registry.set('ghostRecordings', recordings);

        // Play completion sound
        audioSystem.roomComplete();

        // Create completion flash effect
        const flash = this.add.rectangle(400, 300, 800, 600, 0x00d9ff);
        flash.setAlpha(0);
        this.tweens.add({
            targets: flash,
            alpha: 0.3,
            duration: 150,
            yoyo: true
        });

        // Check if game complete
        if (this.currentRoom >= 6) {
            // REUNION EFFECT: All ghosts converge on player
            for (const ghost of this.ghosts) {
                this.tweens.add({
                    targets: ghost,
                    x: this.player.x,
                    y: this.player.y,
                    alpha: 0.8,
                    duration: 800,
                    ease: 'Power2'
                });
            }

            // Final flash and transition
            this.time.delayedCall(900, () => {
                const finalFlash = this.add.rectangle(400, 300, 800, 600, 0xffffff);
                finalFlash.setAlpha(0);
                this.tweens.add({
                    targets: finalFlash,
                    alpha: 1,
                    duration: 300,
                    onComplete: () => {
                        this.scene.start('VictoryScene');
                    }
                });
            });
        } else {
            // Show "echo captured" message briefly
            const echoText = this.add.text(400, 300, 'ECHO CAPTURED', {
                fontFamily: 'Courier New',
                fontSize: '28px',
                color: '#00d9ff'
            }).setOrigin(0.5, 0.5).setAlpha(0);

            this.tweens.add({
                targets: echoText,
                alpha: 1,
                duration: 200,
                yoyo: true,
                hold: 300
            });

            // Advance to next room
            this.registry.set('currentRoom', this.currentRoom + 1);

            // Transition
            this.time.delayedCall(600, () => {
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.time.delayedCall(400, () => {
                    this.scene.restart();
                });
            });
        }
    }

    resetRoom() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Reset without saving recording
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.time.delayedCall(200, () => {
            this.scene.restart();
        });
    }
}

// ==================== VICTORY SCENE ====================

class VictoryScene extends Phaser.Scene {
    constructor() {
        super('VictoryScene');
    }

    create() {
        // Play victory fanfare
        audioSystem.victory();

        // Background
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        // Create ambient particles
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            const particle = this.add.rectangle(
                Phaser.Math.Between(50, 750),
                Phaser.Math.Between(50, 550),
                Phaser.Math.Between(2, 6),
                Phaser.Math.Between(2, 6),
                0xffd700
            );
            particle.setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));
            particle.setData('speed', Phaser.Math.FloatBetween(20, 50));
            particle.setData('drift', Phaser.Math.FloatBetween(0, Math.PI * 2));
            this.particles.push(particle);
        }

        // Fade from white
        const whiteOverlay = this.add.rectangle(400, 300, 800, 600, 0xffffff);
        this.tweens.add({
            targets: whiteOverlay,
            alpha: 0,
            duration: 1000,
            onComplete: () => whiteOverlay.destroy()
        });

        // Create converged "unified self" in center
        this.unifiedSelf = this.add.rectangle(400, 280, 40, 40, 0x00d9ff);
        this.unifiedSelf.setAlpha(0);

        // Ghost echoes orbiting (representing past selves now unified)
        this.echoes = [];
        for (let i = 0; i < 6; i++) {
            const echo = this.add.rectangle(400, 280, 24, 24, 0x00d9ff);
            echo.setAlpha(0);
            echo.setData('angle', (i / 6) * Math.PI * 2);
            echo.setData('radius', 60);
            this.echoes.push(echo);
        }

        // Animate unified self appearing
        this.time.delayedCall(500, () => {
            this.tweens.add({
                targets: this.unifiedSelf,
                alpha: 0.9,
                duration: 500
            });

            // Fade in echoes
            this.echoes.forEach((echo, i) => {
                this.tweens.add({
                    targets: echo,
                    alpha: 0.4,
                    duration: 300,
                    delay: i * 100
                });
            });
        });

        // Title (appears after animation)
        const title = this.add.text(400, 420, 'YOU WERE NEVER ALONE', {
            fontFamily: 'Courier New',
            fontSize: '32px',
            color: '#ffd700'
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.time.delayedCall(1200, () => {
            this.tweens.add({
                targets: title,
                alpha: 1,
                duration: 800
            });
        });

        // Stats (appear after title)
        const totalTime = this.registry.get('totalTime');
        const minutes = Math.floor(totalTime / 60);
        const seconds = Math.floor(totalTime % 60);

        const timeText = this.add.text(400, 480, 'Time: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds, {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5).setAlpha(0);

        const roomsText = this.add.text(400, 510, 'Echoes Created: 6', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.time.delayedCall(2000, () => {
            this.tweens.add({ targets: timeText, alpha: 1, duration: 500 });
            this.tweens.add({ targets: roomsText, alpha: 1, duration: 500, delay: 200 });
        });

        // Restart prompt (pulsing)
        this.restartText = this.add.text(400, 560, 'Press SPACE to reflect', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.time.delayedCall(2500, () => {
            this.restartText.setAlpha(1);
            this.tweens.add({
                targets: this.restartText,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        });

        // Input
        this.input.keyboard.on('keydown-SPACE', () => {
            // Full reset
            this.registry.set('currentRoom', 0);
            this.registry.set('totalTime', 0);
            this.registry.set('ghostRecordings', []);
            this.scene.start('GameScene');
        });

        // Start update loop for animations
        this.time.addEvent({
            delay: 16,
            callback: this.updateAnimations,
            callbackScope: this,
            loop: true
        });

        this.sceneTime = 0;
    }

    updateAnimations() {
        this.sceneTime += 0.016;

        // Orbit echoes around unified self
        for (const echo of this.echoes) {
            const angle = echo.getData('angle') + this.sceneTime * 0.5;
            const radius = echo.getData('radius');
            echo.x = 400 + Math.cos(angle) * radius;
            echo.y = 280 + Math.sin(angle) * radius * 0.5; // Elliptical orbit
        }

        // Gentle pulse on unified self
        if (this.unifiedSelf) {
            this.unifiedSelf.setScale(1 + Math.sin(this.sceneTime * 2) * 0.05);
        }

        // Animate particles
        for (const particle of this.particles) {
            particle.y -= particle.getData('speed') * 0.016;
            particle.x += Math.sin(this.sceneTime * 2 + particle.getData('drift')) * 0.5;

            if (particle.y < 30) {
                particle.y = 580;
                particle.x = Phaser.Math.Between(50, 750);
            }
        }
    }
}

// ==================== INITIALIZATION ====================

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: COLORS.background,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: [BootScene, GameScene, VictoryScene]
};

window.onload = function () {
    new Phaser.Game(config);
};
