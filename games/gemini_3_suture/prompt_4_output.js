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
            { x: 50, y: 450, width: 200, height: 50 },
            { x: 600, y: 400, width: 250, height: 50 } // A second platform further away
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
        platformGraphics.fillStyle(0xd2b48c, 1); // Parchment color
        platformGraphics.fillRect(0, 0, pData.width, pData.height);

        const platformContainer = this.add.container(pData.x, pData.y);
        platformContainer.add(platformGraphics);
        platformContainer.setSize(pData.width, pData.height);

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
    this.instructionsText = this.add.text(config.width / 2, 50, 'Click and drag to cut a horizontal line.\nTry to move the platforms to reach the green exit.', {
        fontSize: '18px',
        fill: '#FFF',
        align: 'center'
    }).setOrigin(0.5);

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

        // Simplified for now: assume horizontal cut and target the single platform
        // and only shift if cut is to the left of the platform and within a reasonable y-range
        const cutLine = new Phaser.Geom.Line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        // Determine if the cut is mostly horizontal or vertical
        const dx = Math.abs(cutLine.x2 - cutLine.x1);
        const dy = Math.abs(cutLine.y2 - cutLine.y1);

        if (dx < 10 && dy < 10) { // Too small a cut
            console.log("Cut too small.");
            return;
        }

        let isHorizontal = dx > dy;
        // For simplicity, let's only process horizontal cuts for now
        if (!isHorizontal) {
            console.log("Only horizontal cuts are supported in this iteration.");
            return;
        }

        const gapWidth = dx; // A very simplified gapWidth calculation: the length of the horizontal cut
        let cutPerformed = false;

        this.worldSegments.getChildren().forEach(platform => {
            const platformBounds = platform.getBounds();

            // Check if the platform is to the right of the cut
            // and if the cut's y-range overlaps with the platform's y-range
            if (platformBounds.left >= cutX && !(cutY2 < platformBounds.top || cutY1 > platformBounds.bottom)) {
                this.tweens.add({
                    targets: platform,
                    x: platform.x - gapWidth,
                    duration: 200,
                    ease: 'Power2',
                    onUpdate: () => {
                        platform.body.x = platform.x;
                    }
                });
                cutPerformed = true;
            }
        });

        // Also shift the exit if it's affected
        const exitBounds = this.exit.getBounds();
        if (exitBounds.left >= cutX && !(cutY2 < exitBounds.top || cutY1 > exitBounds.bottom)) {
            this.tweens.add({
                targets: this.exit,
                x: this.exit.x - gapWidth,
                duration: 200,
                ease: 'Power2',
                onUpdate: () => {
                    this.exit.body.x = this.exit.x;
                }
            });
            cutPerformed = true;
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
{
    // Game logic for each frame
    if (this.player.y > config.height) {
        this.restartLevel();
    }

    // Win condition: player overlaps with exit
    this.physics.overlap(this.player, this.exit, this.loadNextLevel, null, this);
}

}

function update ()
{
    // Game logic for each frame
}
