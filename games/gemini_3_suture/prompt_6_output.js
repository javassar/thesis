const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Level Data Definition
const levelData = [
    {
        playerStart: { x: 100, y: 400 },
        platforms: [
            { x: 50, y: 450, width: 200, height: 50, type: 'normal' },
            { x: 400, y: 300, width: 100, height: 50, type: 'obsidian' }, // Obsidian wall
            { x: 600, y: 400, width: 250, height: 50, type: 'normal' } // A second platform further away
        ],
        exit: { x: 800, y: 350, width: 30, height: 30 }, // Exit above the second platform
        stitches: 3
    }
];

let currentLevelIndex = 0;

function preload ()
{
    // No assets to preload yet
}

function create ()
{
    // Set the background color to The Void
    this.cameras.main.setBackgroundColor('#222222');

    // Create a group for world segments
    this.worldSegments = this.add.group();

    const currentLevel = levelData[currentLevelIndex];

    // Create platforms from level data
    currentLevel.platforms.forEach(pData => {
        const platformGraphics = this.add.graphics();
        if (pData.type === 'obsidian') {
            platformGraphics.fillStyle(0x333333, 1); // Dark grey for obsidian
        } else {
            platformGraphics.fillStyle(0xd2b48c, 1); // Parchment color
        }
        platformGraphics.fillRect(0, 0, pData.width, pData.height);

        const platformContainer = this.add.container(pData.x, pData.y);
        platformContainer.add(platformGraphics);
        platformContainer.setSize(pData.width, pData.height);
        platformContainer.setData('type', pData.type); // Store the type

        this.physics.world.enable(platformContainer);
        platformContainer.body.setAllowGravity(false);
        platformContainer.body.setImmovable(true);

        this.worldSegments.add(platformContainer);
    });

    // Add the player (Ember)
    const playerRadius = 10;
    this.player = this.physics.add.circle(currentLevel.playerStart.x, currentLevel.playerStart.y, playerRadius, 0xffcc00);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // Add collider between player and world segments
    this.physics.add.collider(this.player, this.worldSegments);

    // Create the exit
    this.exit = this.physics.add.staticSprite(currentLevel.exit.x + currentLevel.exit.width / 2, currentLevel.exit.y + currentLevel.exit.height / 2);
    this.exit.setSize(currentLevel.exit.width, currentLevel.exit.height);
    this.exit.setDisplaySize(currentLevel.exit.width, currentLevel.exit.height); // Visual size
    this.exit.setTint(0x00ff00); // Green exit for visibility

    // Game state variables
    this.stitchesLeft = currentLevel.stitches; // Initial number of stitches

    // UI for stitches
    this.stitchesText = this.add.text(16, 16, 'Stitches: ' + this.stitchesLeft, { fontSize: '20px', fill: '#FFF' });

    // On-screen instructions
    this.instructionsText = this.add.text(config.width / 2, 50, 'Click and drag to cut a horizontal line.\nTry to move the platforms to reach the green exit.\nUse arrow keys to move the player.', {
        fontSize: '18px',
        fill: '#FFF',
        align: 'center'
    }).setOrigin(0.5);

    // Input handling for player movement
    this.cursors = this.input.keyboard.createCursorKeys();

    // Input handling for cutting
    this.isCutting = false;
    this.cutStartPoint = new Phaser.Geom.Point();
    this.cutLineGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } }); // White scalpel line

    this.input.on('pointerdown', (pointer) => {
        this.isCutting = true;
        this.cutStartPoint.x = pointer.x;
        this.cutStartPoint.y = pointer.y;
    });

    this.input.on('pointerup', (pointer) => {
        if (this.isCutting) {
            this.isCutting = false;
            // Draw the temporary scalpel line
            this.cutLineGraphics.clear();
            this.cutLineGraphics.lineBetween(this.cutStartPoint.x, this.cutStartPoint.y, pointer.x, pointer.y);

            this.performSuture(this.cutStartPoint, pointer);

            // Clear the line after a short delay for visual feedback
            this.time.delayedCall(200, () => {
                this.cutLineGraphics.clear();
            });
        }
    });

    // --- Core Game Logic Functions ---

    // This function needs to be a method of the scene for `this` context
    this.performSuture = (startPoint, endPoint) => {
        if (this.stitchesLeft <= 0) {
            console.log("No stitches left!");
            return;
        }

        const cutLine = new Phaser.Geom.Line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        const dx = Math.abs(cutLine.x2 - cutLine.x1);
        const dy = Math.abs(cutLine.y2 - cutLine.y1);

        if (dx < 10 && dy < 10) { // Too small a cut
            console.log("Cut too small.");
            return;
        }

        let isHorizontal = dx > dy;
        if (!isHorizontal) {
            console.log("Only horizontal cuts are supported in this iteration.");
            return;
        }

        const cutXMin = Math.min(cutLine.x1, cutLine.x2);
        const cutXMax = Math.max(cutLine.x1, cutLine.x2);
        const cutYMin = Math.min(cutLine.y1, cutLine.y2);
        const cutYMax = Math.max(cutLine.y1, cutLine.y2);

        let affectedObjects = []; // Stores objects that will be shifted
        let minXRightOfCut = config.width + 100; // Initialize with a value beyond canvas

        let shiftablePlatforms = this.worldSegments.getChildren().filter(platform => platform.getData('type') !== 'obsidian');

        // Identify platforms to shift and find the leftmost object to the right of the cut
        shiftablePlatforms.forEach(platform => {
            const platformBounds = platform.getBounds();

            if (platformBounds.left >= cutXMax && !(cutYMax < platformBounds.top || cutYMin > platformBounds.bottom)) {
                // Platform is to the right of the cut and its y-range overlaps
                affectedObjects.push(platform);
                minXRightOfCut = Math.min(minXRightOfCut, platformBounds.left);
            }
        });

        // Also consider the exit
        const exitBounds = this.exit.getBounds();
        if (exitBounds.left >= cutXMax && !(cutYMax < exitBounds.top || cutYMin > exitBounds.bottom)) {
            affectedObjects.push(this.exit);
            minXRightOfCut = Math.min(minXRightOfCut, exitBounds.left);
        }

        let gapWidth = 0;
        if (affectedObjects.length > 0) {
            // Calculate gapWidth: distance from the right end of the cut to the leftmost affected object
            gapWidth = minXRightOfCut - cutXMax;
            if (gapWidth < 0) gapWidth = 0; // Should not happen if logic is correct
        } else {
            // If nothing is to the right, just remove the length of the cut itself
            gapWidth = dx;
        }

        if (gapWidth === 0) {
            console.log("No effective gap to close or cut was too short.");
            return;
        }

        let cutPerformed = false;
        // Shift all identified affected objects
        affectedObjects.forEach(obj => {
            this.tweens.add({
                targets: obj,
                x: obj.x - gapWidth,
                duration: 200,
                ease: 'Power2',
                onUpdate: () => {
                    // Update physics body position during tween
                    obj.body.x = obj.x;
                }
            });
            cutPerformed = true;
        });

        // Shift the player if they are to the right of the cut
        if (this.player.x > cutXMax && affectedObjects.length > 0) { // Only shift player if something else shifted
             this.tweens.add({
                targets: this.player,
                x: this.player.x - gapWidth,
                duration: 200,
                ease: 'Power2',
                onUpdate: () => {
                    this.player.body.x = this.player.x;
                }
            });
        }
        
        if (cutPerformed) {
            this.stitchesLeft--;
            this.stitchesText.setText('Stitches: ' + this.stitchesLeft);
            console.log("Performed suture! World shifted left by", gapWidth);
        } else {
            console.log("Cut not in an effective position for this iteration.");
        }
    };

    // --- Utility Functions ---
    this.restartLevel = () => {
        this.scene.restart();
    };

    this.loadNextLevel = () => {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            currentLevelIndex++;
            if (currentLevelIndex < levelData.length) {
                this.scene.restart();
            } else {
                this.endGame();
            }
        });
    };

    this.endGame = () => {
        this.input.enabled = false;
        this.physics.pause();

        this.cameras.main.fade(1000, 0, 0, 0); // Fade to black
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // "Folds" into a single point of light - represented by scaling down the player
            this.tweens.add({
                targets: this.player,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    this.player.destroy();
                    // Display final text
                    this.add.text(config.width / 2, config.height / 2, "Some gaps cannot be crossed.\nThey must be removed.", {
                        fontSize: '32px',
                        fill: '#FFF',
                        align: 'center'
                    }).setOrigin(0.5);
                }
            });
        });
    };
}

function update () {
    // Game logic for each frame
    if (this.player.y > config.height) {
        this.restartLevel();
    }

    // Player movement
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
    } else {
        this.player.setVelocityX(0);
    }

    // Jump
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
    }

    // Win condition: player overlaps with exit
    this.physics.overlap(this.player, this.exit, this.loadNextLevel, null, this);
}


