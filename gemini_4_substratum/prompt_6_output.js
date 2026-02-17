const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// --- Global Game Variables ---
let hero;
let heroSpeed; // Will be set per level
let currentLevelTime = 0;
let stripsData = [];
let isGameOver = false;
let respawnDelay = 1000;
let dustParticles;
let dustEmitter;
let progressBar;
let instructionsText;
let heroMoving = false; // Flag to control hero movement

// --- Level Data ---
const tileWidth = 50;
const levels = [
    { // Level 1: The Basics
        data: [
            ['STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'STONE'],
            ['STONE', 'STONE', 'STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'STONE', 'STONE'],
            ['STONE', 'VOID', 'STONE', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE']
        ],
        heroStartStrip: 1,
        goalX: 17 * tileWidth,
        instruction: 'Drag the strips (not the hero\'s path!) to create a solid path. Hero starts slow, then speeds up!',
        heroSpeed: 1, // Slower initial speed for learning
        startDelay: 2000 // 2 seconds delay before hero moves
    },
    { // Level 2: Shattered Bridge (Leapfrog)
        data: [
            ['VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'STONE', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID'],
            ['VOID', 'VOID', 'STONE', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID'],
            ['VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'STONE', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID', 'VOID']
        ],
        heroStartStrip: 1,
        goalX: 15 * tileWidth,
        instruction: 'Leapfrog the platforms! Drag the block the hero just left, back into his path ahead.',
        heroSpeed: 2, // Slightly faster for this challenge
        startDelay: 3000 // Longer delay for understanding new mechanic
    },
    { // Level 3: Counter-Sliding
        data: [
            ['STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE'],
            ['SPIKE', 'SPIKE', 'SPIKE', 'SPIKE', 'VOID', 'SPIKE', 'SPIKE', 'SPIKE', 'SPIKE', 'SPIKE', 'VOID', 'SPIKE', 'SPIKE', 'SPIKE', 'SPIKE', 'SPIKE', 'VOID', 'SPIKE'],
            ['STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE']
        ],
        heroStartStrip: 0,
        goalX: 17 * tileWidth,
        rule: 'counter-slide', // Top and bottom strips move opposite to each other
        instruction: 'Beware! Some paths are linked. Moving one strip might move another!',
        heroSpeed: 2.5,
        startDelay: 3000
    }
];

let currentLevelIndex = 0;
let totalStripLength = levels[currentLevelIndex].data[0].length * tileWidth;


// --- Main Phaser Functions ---

function preload() {
    // Create a texture for the dust particle
    const graphics = this.make.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 5, 5);
    graphics.generateTexture('dust', 5, 5);
    graphics.destroy();
}

function create() {
    this.add.text(config.width / 2, config.height / 2 - 50, 'SUBSTRATUM', {
        fontSize: '64px', fill: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const startText = this.add.text(config.width / 2, config.height / 2 + 50, 'Click to "Grant the Hero Passage."', {
        fontSize: '24px', fill: '#ffffff'
    }).setOrigin(0.5);

    startText.setInteractive({ useHandCursor: true });
    startText.on('pointerdown', () => startGame.call(this));
}

function startGame() {
    this.children.getAll().forEach(child => child.destroy());
    createGameElements.call(this);
}

function createGameElements() {
    // --- Visuals ---
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1D2B53, 0x1D2B53, 0x7E2553, 0x7E2553, 1);
    graphics.fillRect(0, 0, config.width, config.height);

    for (let i = 0; i < 3; i++) {
        const stripGroup = this.add.container(0, i * 200);
        stripGroup.setSize(config.width * 2, 200);
        stripsData.push({ group: stripGroup, tiles: [], offset: 0, y: i * 200 });
        stripGroup.setInteractive(new Phaser.Geom.Rectangle(0, 0, stripGroup.width, 200), Phaser.Geom.Rectangle.Contains);
        this.input.setDraggable(stripGroup);
    }

    // --- Hero ---
    hero = this.add.rectangle(100, 0, 30, 30, 0xffd700).setOrigin(0.5);
    hero.bodyHeight = 30;
    hero.bodyWidth = 20;

    // --- Particles ---
    dustParticles = this.add.particles('dust');
    dustEmitter = dustParticles.createEmitter({
        speed: { min: -100, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        blendMode: 'SCREEN',
        lifespan: 500,
        gravityY: 150,
        on: false
    });

    // --- UI ---
    progressBar = this.add.rectangle(0, 5, 0, 10, 0xffd700).setOrigin(0, 0);
    instructionsText = this.add.text(config.width / 2, 30, '', {
        fontSize: '18px', fill: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // --- Load Level ---
    loadLevel.call(this, currentLevelIndex);

    // --- Input Handling ---
    this.input.on('dragstart', function (pointer, gameObject) {
        gameObject.startX = gameObject.x;
        gameObject.startPointerX = pointer.x;
    });

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        const deltaX = pointer.x - gameObject.startPointerX;
        const newX = gameObject.startX + deltaX;
        gameObject.x = newX;

        const currentStripData = stripsData.find(s => s.group === gameObject);
        if (currentStripData) {
            currentStripData.offset = newX;
        }

        // --- Counter-slide Logic ---
        const level = levels[currentLevelIndex];
        if (level.rule === 'counter-slide') {
            const myIndex = stripsData.indexOf(currentStripData);
            if (myIndex === 0) { // Top strip
                const bottomStrip = stripsData[2];
                bottomStrip.group.x = -newX; // Move opposite
                bottomStrip.offset = -newX;
            } else if (myIndex === 2) { // Bottom strip
                const topStrip = stripsData[0];
                topStrip.group.x = -newX; // Move opposite
                topStrip.offset = -newX;
            }
        }
    });

    this.input.on('dragend', function (pointer, gameObject) {
        const currentStripData = stripsData.find(s => s.group === gameObject);
        if (currentStripData) {
            const snappedX = Math.round(gameObject.x / tileWidth) * tileWidth;
            gameObject.x = snappedX;
            currentStripData.offset = snappedX;

            // Also snap the counter-slid strip
            const level = levels[currentLevelIndex];
             if (level.rule === 'counter-slide') {
                const myIndex = stripsData.indexOf(currentStripData);
                if (myIndex === 0) {
                    const bottomStrip = stripsData[2];
                    bottomStrip.group.x = -snappedX;
                    bottomStrip.offset = -snappedX;
                } else if (myIndex === 2) {
                     const topStrip = stripsData[0];
                    topStrip.group.x = -snappedX;
                    topStrip.offset = -snappedX;
                }
            }
        }
    });
}

function loadLevel(levelIndex) {
    const level = levels[levelIndex];
    totalStripLength = level.data[0].length * tileWidth;
    instructionsText.setText(level.instruction);
    heroSpeed = level.heroSpeed; // Set hero speed for the current level
    heroMoving = false; // Stop hero movement initially

    // Set a timed event to start hero movement after a delay
    this.time.delayedCall(level.startDelay, () => {
        heroMoving = true;
    }, [], this);

    for (let i = 0; i < 3; i++) {
        stripsData[i].group.removeAll(true);
        stripsData[i].tiles = [];

        for (let j = 0; j < level.data[i].length; j++) {
            const tileType = level.data[i][j];
            const tileX = j * tileWidth;
            let tile;
            const stripHeight = 200;

            if (tileType === 'VOID') {
                tile = this.add.rectangle(tileX, 0, tileWidth, stripHeight, 0x0a0a0a).setOrigin(0, 0);
            } else {
                // Add a base stone texture
                const stone = this.add.rectangle(tileX, 0, tileWidth, stripHeight, 0x787878).setOrigin(0,0);
                const highlight = this.add.rectangle(tileX, 0, tileWidth, 5, 0x909090).setOrigin(0,0);
                stripsData[i].group.add(stone);
                stripsData[i].group.add(highlight);
                tile = stone; // The rectangle itself is the main object for type checking

                if (tileType === 'SPIKE') {
                    const spike = this.add.triangle(tileX + (tileWidth/2), stripHeight - 30, 0, 30, 30, 30, 15, 0, 0xcccccc);
                    stripsData[i].group.add(spike);
                }
            }
            tile.type = tileType;
            stripsData[i].tiles.push(tile);
        }
    }

    hero.x = 100;
    hero.y = (stripsData[level.heroStartStrip].y + 200) - (hero.displayHeight / 2) - 5; // Place on hero strip
    hero.baseY = hero.y; // For bobbing animation
    
    // Do NOT reset strip positions here to avoid frustration on death
    // stripsData.forEach(strip => {
    //     strip.group.x = 0;
    //     strip.offset = 0;
    // });

    isGameOver = false;
}

function update(time, delta) {
    if (isGameOver) return;

    // --- Hero Animation and Movement ---
    if (heroMoving) { // Only move hero if heroMoving is true
        hero.y = hero.baseY + Math.sin(time * 0.01) * 2; // Simple bobbing motion
        hero.x += heroSpeed;
    }

    // --- Strip Wrapping ---
    stripsData.forEach(strip => {
        // If the strip moves too far left, wrap its x position
        if (strip.group.x < -totalStripLength) {
            strip.group.x += totalStripLength;
            strip.offset = strip.group.x;
        }
        // If the strip moves too far right, wrap its x position
        else if (strip.group.x > config.width) { // Corrected: Should be strip.group.x not strip.x
            strip.group.x -= totalStripLength;
            strip.offset = strip.group.x;
        }
    });

    // --- Collision Detection ---
    const heroBottomY = hero.y + (hero.displayHeight / 2);
    let activeStrip = null;
    for (const strip of stripsData) {
        if (heroBottomY > strip.y && heroBottomY <= strip.y + 200) {
            activeStrip = strip;
            break;
        }
    }

    if (!activeStrip) {
        restartSegment.call(this, true); // Fell off the world
        return;
    }

    let relativeHeroX = hero.x - activeStrip.group.x;
    let normalizedHeroX = relativeHeroX % totalStripLength;
    if (normalizedHeroX < 0) normalizedHeroX += totalStripLength;
    
    let tileIndex = Math.floor(normalizedHeroX / tileWidth);
    let tileAtHero = activeStrip.tiles[tileIndex];

    if (tileAtHero && (tileAtHero.type === 'VOID' || tileAtHero.type === 'SPIKE')) {
        restartSegment.call(this);
    }

    // --- Progress Bar & Win Condition ---
    const goalX = levels[currentLevelIndex].goalX;
    progressBar.width = (hero.x / goalX) * config.width;
    if (hero.x >= goalX) {
        winGame.call(this);
    }
}

function restartSegment(fellOffWorld = false) {
    if (isGameOver) return;
    isGameOver = true;
    heroMoving = false; // Stop hero movement on death

    if (fellOffWorld) {
        dustEmitter.explode(30, hero.x, hero.y - 100);
    } else {
        dustEmitter.explode(30, hero.x, hero.y);
    }
    
    hero.setVisible(false);

    this.time.delayedCall(respawnDelay, () => {
        hero.setVisible(true);
        // Load the current level again without resetting strip positions
        loadLevel.call(this, currentLevelIndex); 
        heroMoving = true; // Hero starts moving again after respawn delay
    }, [], this);
}

function winGame() {
    currentLevelIndex++;
    if (currentLevelIndex < levels.length) {
        // Hero speed is now set by the next level's configuration
        loadLevel.call(this, currentLevelIndex);
    } else {
        isGameOver = true;
        this.input.enabled = false;
        hero.destroy();
        progressBar.destroy();
        instructionsText.destroy();
        this.add.text(config.width / 2, config.height / 2, 'I did it all by myself.', {
            fontSize: '48px', fill: '#ffd700', align: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: {x: 20, y: 10}
        }).setOrigin(0.5);
    }
}

