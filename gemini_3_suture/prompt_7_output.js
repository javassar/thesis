//disclaimer: this code is not directly the prompt 7 output. i gave gemini two prompts to fix console errors before remembering to document this version of the code. nothing fundamental was changed, though, so this is still a good representation of the state of the code after prompt 7
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
    this.player = this.add.circle(currentLevel.playerStart.x, currentLevel.playerStart.y, playerRadius, 0xffcc00);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(playerRadius);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setBounce(0.2);

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

    this.cursors = this.input.keyboard.createCursorKeys();

    // --- Visual Feedback Elements ---

    // For the temporary line player draws
    this.cutLineGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } }); // White scalpel line

    // For the permanent stitch marks
    this.stitchLinesGraphics = this.add.graphics({ lineStyle: { width: 3, color: 0xffcc00, alpha: 0.8 } });

    // For text feedback on cuts
    this.feedbackText = this.add.text(config.width / 2, config.height / 2, '', { fontSize: '24px', fill: '#ff0000', align: 'center' }).setOrigin(0.5).setAlpha(0);


    // Input handling for cutting
    this.isCutting = false;
    this.cutStartPoint = new Phaser.Geom.Point();

    this.input.on('pointerdown', (pointer) => {
        if (!this.isCutting) {
            this.isCutting = true;
            this.cutStartPoint.setTo(pointer.x, pointer.y);
        }
    });

    this.input.on('pointerup', (pointer) => {
        if (this.isCutting) {
            this.isCutting = false;
            this.cutLineGraphics.clear(); // Always clear the temporary line
            this.performSuture(this.cutStartPoint, pointer);
        }
    });
    
    this.input.on('pointermove', (pointer) => {
        if (this.isCutting) {
            this.cutLineGraphics.clear();
            this.cutLineGraphics.lineBetween(this.cutStartPoint.x, this.cutStartPoint.y, pointer.x, pointer.y);
        }
    });


    // --- Utility Functions ---
    this.showFeedback = (message) => {
        this.feedbackText.setText(message);
        this.feedbackText.setAlpha(1);
        this.time.delayedCall(1500, () => {
            this.tweens.add({
                targets: this.feedbackText,
                alpha: 0,
                duration: 500,
                ease: 'Power2'
            });
        });
    };

    // --- Core Game Logic Functions ---

    // This function needs to be a method of the scene for `this` context
    this.performSuture = (startPoint, endPoint) => {
        if (this.stitchesLeft <= 0) {
            this.showFeedback("No stitches left!");
            return;
        }

        const cutLine = new Phaser.Geom.Line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        const dx = Math.abs(cutLine.x2 - cutLine.x1);
        const dy = Math.abs(cutLine.y2 - cutLine.y1);

        if (dx < 10 && dy < 10) {
            this.showFeedback("Cut is too small.");
            return;
        }

        let isHorizontal = dx > dy;
        if (!isHorizontal) {
            this.showFeedback("Only horizontal cuts are effective.");
            return;
        }

        const cutXMin = Math.min(cutLine.x1, cutLine.x2);
        const cutXMax = Math.max(cutLine.x1, cutLine.x2);
        const cutYMin = Math.min(cutLine.y1, cutLine.y2);
        const cutYMax = Math.max(cutLine.y1, cutLine.y2);

        let affectedObjects = [];
        let minXRightOfCut = config.width + 100;

        let shiftablePlatforms = this.worldSegments.getChildren().filter(platform => platform.getData('type') !== 'obsidian');

        shiftablePlatforms.forEach(platform => {
            const platformBounds = platform.getBounds();
            if (platformBounds.left >= cutXMax && !(cutYMax < platformBounds.top || cutYMin > platformBounds.bottom)) {
                affectedObjects.push(platform);
                minXRightOfCut = Math.min(minXRightOfCut, platformBounds.left);
            }
        });

        const exitBounds = this.exit.getBounds();
        if (exitBounds.left >= cutXMax && !(cutYMax < exitBounds.top || cutYMin > exitBounds.bottom)) {
            affectedObjects.push(this.exit);
            minXRightOfCut = Math.min(minXRightOfCut, exitBounds.left);
        }

        let gapWidth = 0;
        if (affectedObjects.length > 0) {
            gapWidth = minXRightOfCut - cutXMax;
            if (gapWidth < 0) gapWidth = 0;
        }

        if (gapWidth < 1) { // Check if the gap is too small to be meaningful
            this.showFeedback("Cut not effective.");
            return;
        }

        let cutPerformed = false;
        affectedObjects.forEach(obj => {
            this.tweens.add({
                targets: obj,
                x: obj.x - gapWidth,
                duration: 200,
                ease: 'Power2',
                onUpdate: () => {
                    obj.body.x = obj.x;
                }
            });
            cutPerformed = true;
        });

        if (this.player.x > cutXMax && affectedObjects.length > 0) {
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
            
            // Draw the permanent stitch line
            const stitchX = cutXMax;
            this.stitchLinesGraphics.lineBetween(stitchX, cutYMin, stitchX, cutYMax);

        } else {
            // This case is now handled by the gapWidth check above
            this.showFeedback("Cut not effective.");
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
        this.player.body.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(160);
    } else {
        this.player.body.setVelocityX(0);
    }

    // Jump
    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.body.setVelocityY(-330);
    }

    // Win condition: player overlaps with exit
    this.physics.overlap(this.player, this.exit, this.loadNextLevel, null, this);
}


