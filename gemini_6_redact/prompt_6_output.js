class RedactGame extends Phaser.Scene {
    constructor() {
        super({ key: 'RedactGame' });
    }

    preload() {
        // No assets to load yet, will generate blot texture in create()
    }

    create() {
        // Create a simple graphic for the blot (moved from preload)
        let graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('blot', 16, 16);

        // Generate texture for redaction bars
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('redactionBar', 32, 32);
        graphics.destroy();

        this.player = this.physics.add.sprite(100, 450, 'blot'); // Start above ground
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);

        // Initial hint for restricted movement
        let hintText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 50, 'You feel heavy and static. Look for keywords to change your reality!', {
            font: '20px Courier',
            fill: '#000',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: hintText,
            alpha: 0,
            duration: 5000,
            delay: 3000,
            onComplete: () => {
                hintText.destroy();
            }
        });

        this.redactionBars = this.physics.add.staticGroup();
        // Create a floor
        this.floorRedactionBar = this.redactionBars.create(400, 568, 'redactionBar').setScale(800 / 32, 1).refreshBody();

        this.physics.add.collider(this.player, this.redactionBars, this.onPlayerVsRedactionBar, null, this);


        this.cursors = this.input.keyboard.createCursorKeys(); // Initialize cursor keys
        this.activeProperties = new Map(); // Map to store active properties on objects

        // Initial Player State: slow and heavy
        this.playerSpeed = 50; // Slower movement
        this.physics.world.gravity.y = 800; // Higher gravity for "heavy" feeling

        // Background text for the prison stage
        this.add.text(50, 150, 'The specimen is heavy and static.', { font: '24px Courier', fill: '#000' });

        this.words = this.add.group(); // Initialize words group here
        // Make the "static" word grabbable.
        let staticWord = new Keyword(this, 600, 150, 'STATIC', 'static_remove_mobility');
        this.words.add(staticWord);

        // Ending text and keyword
        this.add.text(50, 50, 'The story ends here.', { font: '24px Courier', fill: '#000' });
        let hereWord = new Keyword(this, 300, 50, 'HERE', 'exit_game');
        this.words.add(hereWord);

        // Add WATER keyword
        let waterWord = new Keyword(this, 100, 50, 'WATER', 'neutralize_lava');
        this.words.add(waterWord);


                        


                                                


                        


                                                        // Placeholder for The Pen antagonist


                        


                                                        let penGraphics = this.add.graphics();


                        


                                                        penGraphics.fillStyle(0x000000, 1);


                        


                                                        penGraphics.fillRect(0, 0, 50, 10); // Simple rectangle for the pen


                        


                                                        penGraphics.generateTexture('pen', 50, 10);


                        


                                                        penGraphics.destroy();


                        


                                                        this.pen = this.add.sprite(this.game.config.width / 2, 50, 'pen');


                        


                                                        this.pen.visible = false; // Pen starts invisible


                        


                                                


                        


                                                        // Timer for Pen to appear and start writing (after some time in the game)


                        


                                                        this.time.delayedCall(5000, this.startPenWriting, [], this);


                        


                                                


                        


                                                        // Player Instructions


                        


                                                        this.add.text(50, 250, 'Use WASD or Arrow Keys to Move', { font: '16px Courier', fill: '#000' });


                        


                                                this.add.text(50, 270, 'Spacebar or W/Up to Jump', { font: '16px Courier', fill: '#000' });


                        


                                                this.add.text(50, 290, 'Click and Drag Keywords to Redaction Bars', { font: '16px Courier', fill: '#000' });


                        


                                


                        


                                        // Drag Logic


                        


                                        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {


                        


                                            gameObject.x = dragX;


                        


                                            gameObject.y = dragY;


                        


                                        });


                        


                                


                        


                                        this.input.on('dragend', (pointer, gameObject) => {


                        


                                


                        


                                            let target = this.getOverlappingObstacle(gameObject);


                        


                                


                        


                                            if (target) {


                        


                                


                        


                                                this.applyProperty(target, gameObject.property);


                        


                                


                        


                                            } else {


                        


                                


                        


                                                if (gameObject === hereWord && gameObject.property === 'exit_game' && gameObject.y < 50 && gameObject.x > 750) {


                        


                                


                        


                                                    // Win condition met


                        


                                


                        


                                                    this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'CASE CLOSED', { fontSize: '48px', fill: '#000' }).setOrigin(0.5);


                        


                                


                        


                                                    this.scene.pause(); // Stop the game


                        


                                


                        


                                                } else {


                        


                                


                        


                                                    this.returnToOriginalPos(gameObject);


                        


                                


                        


                                                    if (gameObject === staticWord && gameObject.property === 'static_remove_mobility') {


                        


                                


                        


                                                        // If the 'static' word is dragged away from its original position (not applied to any object)


                        


                                


                        


                                                        // and returns to origin, consider it "removed" from the sentence.


                        


                                


                        


                                                        this.playerSpeed = 160; // Player becomes mobile


                        


                                


                        


                                                        gameObject.destroy(); // Remove the word once its effect is triggered


                        


                                


                        


                                                        this.add.text(50, 200, 'Mobility Restored!', { font: '20px Courier', fill: '#000' });


                        


                                


                        


                                                    }


                        


                                


                        


                                                }


                        


                                


                        


                                            }


                        


                                


                        


                                        });


                        

    update() {
        if (this.cursors.left.isDown || this.input.keyboard.addKey('A').isDown) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown || this.input.keyboard.addKey('D').isDown) {
            this.player.setVelocityX(this.playerSpeed);
        } else {
            this.player.setVelocityX(0);
        }

        if ((this.cursors.up.isDown || this.input.keyboard.addKey('W').isDown || this.input.keyboard.addKey('SPACE').isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-500); // Increased jump velocity for higher gravity
        }
    }

    getOverlappingObstacle(word) {
        let overlappingObstacle = null;
        this.redactionBars.children.each(function(bar) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(word.getBounds(), bar.getBounds())) {
                overlappingObstacle = bar; // Return the GameObject directly
                return; // Exit early once found
            }
        });
        return overlappingObstacle;
    }

    returnToOriginalPos(word) {
        this.tweens.add({
            targets: word,
            alpha: 0.2, // Fade out slightly
            x: word.originalX, // Use stored original X
            y: word.originalY, // Use stored original Y
            duration: 3000, // 3 seconds
            ease: 'Power2',
            // No onComplete alpha reset, so it stays faded
        });
    }

    applyProperty(target, property) {
        console.log(`Applying property "${property}" to target:`, target);
        // Store the property on the target object using the object itself as the key
        this.activeProperties.set(target, property);

        switch(property) {
            case 'fragile':
                target.setTint(0xff0000); // Visual indicator for fragile
                break;
            case 'bouncy':
                target.setTint(0x00ff00); // Visual indicator for bouncy
                // For static bodies, bounce needs to be handled by the colliding body
                // We'll handle this in the onPlayerVsRedactionBar for now
                break;
            case 'lava':
                target.setTint(0xffa500); // Visual indicator for lava
                break;
            case 'neutralize_lava':
                if (this.activeProperties.get(target) === 'lava') {
                    this.activeProperties.delete(target); // Remove lava property
                    target.setTint(0xffffff); // Reset tint

                    let neutralizedText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Lava Neutralized!', {
                        font: '32px Courier',
                        fill: '#000'
                    }).setOrigin(0.5);

                    this.tweens.add({
                        targets: neutralizedText,
                        alpha: 0,
                        duration: 2000,
                        onComplete: () => {
                            neutralizedText.destroy();
                        }
                    });
                }
                break;
        }
    }

    // New collision handler for player and redaction bars
    onPlayerVsRedactionBar(player, bar) {
        const property = this.activeProperties.get(bar);
        if (property === 'fragile') {
            bar.destroy();
        } else if (property === 'lava') {
            this.scene.restart(); // Restart the current scene (game)
        } else if (property === 'bouncy') {
            // Apply bounce effect to the player if the bar is bouncy
            player.setVelocityY(-player.body.velocity.y * 1.5); // Adjust bounce strength as needed
        }
    }

    startPenWriting() {
        this.pen.visible = true;
        this.add.text(this.pen.x - 200, this.pen.y + 50, 'The floor is lava.', { font: '20px Courier', fill: '#000' });
        // Apply lava property to the floor after a short delay
        this.time.delayedCall(1000, () => {
            this.applyProperty(this.floorRedactionBar, 'lava');
        }, [], this);
    }
}

// Keyword System
class Keyword extends Phaser.GameObjects.Text {
    constructor(scene, x, y, word, property) {
        super(scene, x, y, word, { font: '20px Courier', fill: '#000' });
        this.setInteractive();
        scene.input.setDraggable(this);
        this.property = property;
        this.originalX = x; // Store original X
        this.originalY = y; // Store original Y
        scene.add.existing(this); // Add to the scene
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#E6E2D3', // Aged paper texture
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }, // Default gravity, can be changed by keywords
            debug: false
        }
    },
    scene: RedactGame
};

const game = new Phaser.Game(config);
