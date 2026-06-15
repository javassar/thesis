let hero;
let heroSpeed = 2; // Initial speed
let currentLevelTime = 0; // To track game time for speed increase
let stripsData = []; // To hold strip Phaser objects and their tile data

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    backgroundColor: '#300060',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Load any assets here if needed later
}

function create() {
    this.cameras.main.setBackgroundColor(config.backgroundColor);
    this.add.text(config.width / 2, config.height / 2 - 50, 'SUBSTRATUM', {
        fontSize: '64px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    const startText = this.add.text(config.width / 2, config.height / 2 + 50, 'Click to "Grant the Hero Passage."', {
        fontSize: '24px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    startText.setInteractive({ useHandCursor: true });
    startText.on('pointerdown', this.startGame, this);
}

function startGame() {
    // Clear title screen elements
    this.children.getAll().forEach(child => child.destroy());

    // Initialize game elements
    createGameElements.call(this); // Call createGameElements in the context of the scene
}

function createGameElements() {
    const stripHeight = 200;
    const tileWidth = 50;
    const colors = [0x5f4a7b, 0x4a7b5f, 0x7b5f4a]; // Distinct colors for strips

    // Create strips
    for (let i = 0; i < 3; i++) {
        let stripGroup = this.add.container(0, i * stripHeight);
        stripGroup.setSize(this.config.width * 2, stripHeight); // Make it wider for wrapping
        
        // Add a background to the strip for visual distinction
        let stripBg = this.add.rectangle(0, 0, this.config.width * 2, stripHeight, colors[i]).setOrigin(0,0);
        stripGroup.add(stripBg);

        // Initial tiles for demonstration
        let tiles = [];
        let levelData = [
            ['STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'VOID'], // Strip 0
            ['STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'SPIKE'], // Strip 1
            ['STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE']  // Strip 2
        ];
        
        for (let j = 0; j < levelData[i].length; j++) {
            let tileType = levelData[i][j];
            let tileColor = 0xaaaaaa; // Default stone color
            if (tileType === 'VOID') tileColor = 0x000000;
            if (tileType === 'SPIKE') tileColor = 0xff0000;

            let tile = this.add.rectangle(j * tileWidth, 0, tileWidth, stripHeight, tileColor).setOrigin(0,0);
            tile.type = tileType;
            tile.originalX = j * tileWidth; // Store original x for resetting
            stripGroup.add(tile);
            tiles.push(tile);
        }

        stripsData.push({
            group: stripGroup,
            tiles: tiles,
            offset: 0,
            y: i * stripHeight
        });

        // Make strip interactive for dragging
        stripGroup.setInteractive(new Phaser.Geom.Rectangle(0,0, stripGroup.width, stripGroup.height), Phaser.Geom.Rectangle.Contains);
        this.input.setDraggable(stripGroup);
    }

    // Hero (Sir Pompous)
    hero = this.add.rectangle(100, stripsData[1].y + stripHeight - 40, 40, 40, 0xffff00); // Yellow rect for hero
    hero.setOrigin(0.5); // Center origin
    hero.bodyHeight = 35; // Hitbox height
    hero.bodyWidth = 20;  // Hitbox width
    hero.yOffset = -5; // For hitbox alignment

    // Goal Door
    const GOAL_X = this.config.width * 5; // Far out for now
    this.add.rectangle(GOAL_X, this.config.height - 150, 100, 150, 0x00ff00); // Green rect for goal door

    // Progress Bar (simple line)
    this.add.rectangle(0, 10, this.config.width, 5, 0xffd700).setOrigin(0, 0); // Gold line at top

    // In-game instructions
    this.add.text(this.config.width / 2, 50, 'Drag the strips left/right to help the hero!', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#00000080'
    }).setOrigin(0.5);

    // Input handling for strip dragging
    this.input.on('dragstart', function (pointer, gameObject) {
        gameObject.startX = gameObject.x;
        gameObject.startPointerX = pointer.x;
    });

    // Input handling for strip dragging
    this.input.on('dragstart', function (pointer, gameObject) {
        gameObject.startX = gameObject.x;
        gameObject.startPointerX = pointer.x;
    });

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        let deltaX = pointer.x - gameObject.startPointerX;
        let newX = gameObject.startX + deltaX;
        gameObject.x = newX;
        
        // Find the strip data for this group
        let currentStripData = stripsData.find(s => s.group === gameObject);
        if (currentStripData) {
            currentStripData.offset = newX; // Keep offset in sync with group x
        }
    });

    this.input.on('dragend', function (pointer, gameObject) {
        // Snap to grid
        let currentStripData = stripsData.find(s => s.group === gameObject);
        if (currentStripData) {
            let snappedX = Math.round(gameObject.x / tileWidth) * tileWidth;
            gameObject.x = snappedX;
            currentStripData.offset = snappedX;
        }
    });
}

const tileWidth = 50; // Define globally for access
const levelData = [
    ['STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'VOID', 'STONE', 'STONE', 'VOID'], // Strip 0
    ['STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'SPIKE', 'STONE', 'STONE', 'SPIKE'], // Strip 1
    ['STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE', 'STONE']  // Strip 2
];
const totalStripLength = levelData[0].length * tileWidth; // Total pixel width of one cycle of tiles

    currentStripData.offset = snappedX;
      

function getStripAt(yPos) {
    const stripHeight = 200;
    const stripIndex = Math.floor(yPos / stripHeight);
    return stripsData[stripIndex];
}

function getTileAtHero(strip, heroX) {
    // Calculate hero's effective X position relative to the strip's internal coordinates,
    // accounting for the strip's current offset and wrapping.
    let relativeHeroX = heroX - strip.group.x;

    // Normalize relativeHeroX to be within one cycle of the level content
    // This is crucial for correctly identifying the tile after wrapping
    let normalizedHeroX = relativeHeroX % totalStripLength;
    if (normalizedHeroX < 0) {
        normalizedHeroX += totalStripLength;
    }
    
    let tileIndex = Math.floor(normalizedHeroX / tileWidth);
    
    // Ensure tileIndex is within bounds
    if (tileIndex >= strip.tiles.length) {
        tileIndex = strip.tiles.length - 1; // Fallback, should not happen with correct normalization
    }

    return strip.tiles[tileIndex];
}

let isGameOver = false;
let respawnTimer = 0;
let respawnDelay = 1000; // 1 second

function update(time, delta) {
    if (isGameOver) return;

    // Increase hero speed over time
    currentLevelTime += delta;
    if (currentLevelTime >= 60000) { // Every 60 seconds
        heroSpeed += 0.2;
        currentLevelTime = 0;
        console.log("Hero speed increased to:", heroSpeed);
    }

    // Hero movement
    hero.x += heroSpeed;

    // Strip wrapping logic (for the strip's container itself)
    stripsData.forEach(strip => {
        // If the strip moves too far left, wrap its x position
        if (strip.group.x < -totalStripLength) {
            strip.group.x += totalStripLength;
            strip.offset = strip.group.x;
        }
        // If the strip moves too far right, wrap its x position
        else if (strip.group.x > config.width) { // When dragging right past origin
            strip.group.x -= totalStripLength;
            strip.offset = strip.group.x;
        }
    });

    // Find which strip the hero is on
    // Hero's y is centered, stripsData.y is the top of the strip.
    // Need to find the strip where (strip.y <= hero.y < strip.y + stripHeight)
    const heroBottomY = hero.y + (hero.displayHeight / 2); // Assuming hero.displayHeight is 40
    let activeStrip = null;
    const stripHeight = 200;
    for(let i = 0; i < stripsData.length; i++) {
        if (heroBottomY > stripsData[i].y && heroBottomY <= (stripsData[i].y + stripHeight)) {
            activeStrip = stripsData[i];
            break;
        }
    }
    
    if (!activeStrip) {
        // Hero is outside any strip (e.g., fell into a deep void)
        console.log('Hero fell off the world!');
        restartSegment.call(this);
        return;
    }

    // Get the specific tile under the hero's feet (approximate mid-foot)
    // hero.x is center, so hero.x - (hero.bodyWidth / 2) gives the left edge of hitbox
    let tileAtHero = getTileAtHero(activeStrip, hero.x - (hero.bodyWidth / 2)); 

    if (tileAtHero) {
        if (tileAtHero.type === 'VOID') {
            console.log('Hero fell into VOID!');
            // hero.fall(); // Placeholder for animation
            restartSegment.call(this);
        } else if (tileAtHero.type === 'SPIKE') {
            console.log('Hero hit SPIKE!');
            // hero.die(); // Placeholder for animation
            restartSegment.call(this);
        }
    }

    // Win condition check (GOAL_X needs to be dynamic based on current level)
    const GOAL_X = config.width * 5; // Should be managed by current segment
    if (hero.x >= GOAL_X) {
        console.log('You Win!');
        winGame.call(this);
    }
}

function restartSegment() {
    isGameOver = true;
    this.time.delayedCall(respawnDelay, () => {
        console.log('Restarting Segment...');
        // Reset hero position
        hero.x = 100;
        // Reset strip offsets
        stripsData.forEach(strip => {
            strip.group.x = 0;
            strip.offset = 0;
        });
        isGameOver = false;
    }, [], this);
}

function winGame() {
    isGameOver = true;
    // Stop hero, disable input, show victory text
    this.add.text(config.width / 2, config.height / 2, 'I did it all by myself!', {
        fontSize: '48px',
        fill: '#ffd700'
    }).setOrigin(0.5);
    // Optionally fade to black
}
