const levelData = [
    {
        playerStart: { x: 100, y: 350 },
        platforms: [
            { x: 50, y: 450, width: 200, height: 50, type: 'normal' },
            { x: 400, y: 300, width: 100, height: 50, type: 'obsidian' },
            { x: 600, y: 400, width: 250, height: 50, type: 'normal' }
        ],
        exit: { x: 800, y: 350, width: 30, height: 30 },
        stitches: 3
    }
];

let currentLevelIndex = 0;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // --- Basic Setup ---
        this.cameras.main.setBackgroundColor('#222222');
        const currentLevel = levelData[currentLevelIndex];

        // --- World and Platforms ---
        this.worldSegments = this.physics.add.staticGroup();
        currentLevel.platforms.forEach(pData => {
            const platform = this.add.rectangle(pData.x, pData.y, pData.width, pData.height)
                .setOrigin(0, 0)
                .setData('type', pData.type);

            if (pData.type === 'obsidian') {
                platform.setFillStyle(0x333333);
            } else {
                platform.setFillStyle(0xd2b48c);
            }
            this.worldSegments.add(platform);
        });

        // --- Player ---
        const playerRadius = 10;
        const playerSize = playerRadius * 2;
        this.player = this.add.rectangle(currentLevel.playerStart.x, currentLevel.playerStart.y, playerSize, playerSize, 0xffcc00);
        this.physics.add.existing(this.player, false); // DYNAMIC body

        this.player.body.setCircle(playerRadius);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setBounce(0.2);

        // --- Exit ---
        const exitData = currentLevel.exit;
        this.exit = this.add.rectangle(exitData.x, exitData.y, exitData.width, exitData.height, 0x00ff00).setOrigin(0, 0);
        this.physics.add.existing(this.exit, true); // STATIC body

        // --- Colliders ---
        this.physics.add.collider(this.player, this.worldSegments);
        this.physics.add.overlap(this.player, this.exit, () => this.loadNextLevel(), null, this);
        
        // --- UI and Feedback ---
        this.stitchesLeft = currentLevel.stitches;
        this.stitchesText = this.add.text(16, 16, 'Stitches: ' + this.stitchesLeft, { fontSize: '20px', fill: '#FFF' });
        this.instructionsText = this.add.text(this.cameras.main.width / 2, 50, 'Click-drag to cut space. Arrow keys to move/jump.', { fontSize: '18px', fill: '#FFF', align: 'center' }).setOrigin(0.5);
        this.feedbackText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { fontSize: '24px', fill: '#ff0000', align: 'center' }).setOrigin(0.5).setAlpha(0);
        this.cutLineGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff, alpha: 1 } });
        this.stitchLinesGraphics = this.add.graphics({ lineStyle: { width: 3, color: 0xffcc00, alpha: 0.8 } });

        // --- Input ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.isCutting = false;
        this.cutStartPoint = new Phaser.Geom.Point();
        this.input.on('pointerdown', (pointer) => { this.isCutting = true; this.cutStartPoint.setTo(pointer.x, pointer.y); });
        this.input.on('pointerup', (pointer) => { if (this.isCutting) { this.isCutting = false; this.cutLineGraphics.clear(); this.performSuture(this.cutStartPoint, pointer); } });
        this.input.on('pointermove', (pointer) => { if (this.isCutting) { this.cutLineGraphics.clear(); this.cutLineGraphics.lineBetween(this.cutStartPoint.x, this.cutStartPoint.y, pointer.x, pointer.y); } });
    }

    update() {
        if (!this.player || !this.player.body) return; // Guard against updates before player is ready

        // --- Player Movement ---
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(160);
        } else {
            this.player.body.setVelocityX(0);
        }
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.body.setVelocityY(-330);
        }

        // --- Lose Condition ---
        if (this.player.y > this.cameras.main.height) {
            this.restartLevel();
        }
    }

    // --- Game Logic Methods ---

    performSuture(startPoint, endPoint) {
        if (this.stitchesLeft <= 0) { this.showFeedback("No stitches left!"); return; }

        const cutLine = new Phaser.Geom.Line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        const dx = Math.abs(cutLine.x2 - cutLine.x1);
        const dy = Math.abs(cutLine.y2 - cutLine.y1);

        if (dx < 10 && dy < 10) { this.showFeedback("Cut is too small."); return; }
        if (dx <= dy) { this.showFeedback("Only horizontal cuts are effective."); return; }

        const cutXMax = Math.max(cutLine.x1, cutLine.x2);
        const cutYMin = Math.min(cutLine.y1, cutLine.y2);
        const cutYMax = Math.max(cutLine.y1, cutLine.y2);
        
        let platformsToShift = this.worldSegments.getChildren().filter(platform => {
            const platformBounds = platform.getBounds();
            // Check if the platform is to the right of the cut and overlaps vertically
            return platform.getData('type') !== 'obsidian' &&
                   platformBounds.left >= cutXMax &&
                   !(cutYMax < platformBounds.top || cutYMin > platformBounds.bottom);
        });

        if (platformsToShift.length === 0) { this.showFeedback("Cut not effective."); return; }

        const minXRightOfCut = Math.min(...platformsToShift.map(p => p.getBounds().left));
        const gapWidth = minXRightOfCut - cutXMax;

        if (gapWidth < 1) { this.showFeedback("Cut not effective."); return; }

        // Shift platforms by destroying and recreating
        platformsToShift.forEach(platform => {
            const pData = { x: platform.x - gapWidth, y: platform.y, width: platform.displayWidth, height: platform.displayHeight, type: platform.getData('type') };
            const newPlatform = this.add.rectangle(pData.x, pData.y, pData.width, pData.height, platform.fillColor).setOrigin(0, 0).setData('type', pData.type);
            this.worldSegments.add(newPlatform);
            platform.destroy();
        });
        
        // Shift player and exit
        if (this.player.x > cutXMax) { this.player.x -= gapWidth; }
        if (this.exit.x >= cutXMax) { this.exit.x -= gapWidth; this.exit.body.x -= gapWidth; }

        this.stitchesLeft--;
        this.stitchesText.setText('Stitches: ' + this.stitchesLeft);
        this.stitchLinesGraphics.lineBetween(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    }

    showFeedback(message) {
        this.feedbackText.setText(message).setAlpha(1);
        this.time.delayedCall(1500, () => {
            this.tweens.add({ targets: this.feedbackText, alpha: 0, duration: 500 });
        });
    }

    restartLevel() {
        this.scene.restart();
    }

    loadNextLevel() {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            currentLevelIndex++;
            if (currentLevelIndex < levelData.length) {
                this.scene.restart();
            } else {
                this.endGame();
            }
        });
    }

    endGame() {
        this.input.enabled = false;
        this.physics.pause();
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        const sendComplete = () => {
            if (this._sentCompletion) return;
            this._sentCompletion = true;
            window.parent.postMessage({
                type: 'game-complete',
                data: { result: 'win', levelsCompleted: currentLevelIndex }
            }, '*');
        };
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.cameras.main.setBackgroundColor(0x000000);
            this.cameras.main.resetFX();
            this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, "Some gaps cannot be crossed.\nThey must be removed.", {
                fontSize: '32px',
                fill: '#FFF',
                align: 'center'
            }).setOrigin(0.5).setDepth(100);
            const continueText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 80, 'Press ENTER to continue', {
                fontSize: '18px',
                fill: '#DDD'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);
            continueText.on('pointerdown', sendComplete);
            this.input.keyboard.once('keydown-ENTER', sendComplete);
            if (this.player) this.player.destroy();
        });
    }
}

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
    scene: [GameScene] // Use the new Scene Class
};

const game = new Phaser.Game(config);
