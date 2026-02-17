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

        // More direct initial instruction
        this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 100,
            "The document says you are STATIC.\nChange the story to become mobile.",
            {
                font: '20px Courier',
                fill: '#000',
                align: 'center',
                wordWrap: { width: 600 }
            }
        ).setOrigin(0.5);

        this.redactionBars = this.physics.add.staticGroup();
        // Create the world
        this.redactionBars.create(400, 584, 'redactionBar').setScale(25, 1).refreshBody(); // Floor
        
        // A barrier with a fragile section blocking the way forward
        this.redactionBars.create(500, 500, 'redactionBar').setScale(1, 5).refreshBody();  // Lower part of barrier
        let fragileWall = this.redactionBars.create(500, 350, 'redactionBar').setScale(1, 5).refreshBody(); // Fragile middle part
        this.redactionBars.create(500, 200, 'redactionBar').setScale(1, 5).refreshBody();  // Upper part of barrier
        
        // Mark the fragile section
        this.applyProperty(fragileWall, 'fragile');
        
        // Add an exit indicator and zone
        this.add.text(750, 530, 'EXIT >>', { font: '24px Courier', fill: '#000' });
        let exitZone = this.add.zone(770, 540).setSize(60, 60);
        this.physics.world.enable(exitZone);
        exitZone.body.setAllowGravity(false);
        this.physics.add.overlap(this.player, exitZone, this.onExit, null, this);
        
        this.words = this.add.group(); // Initialize words group here

        // Add a keyword that can make things fragile
        this.add.text(100, 100, 'A cold, FRAGILE glass.', { font: '24px Courier', fill: '#000' });
        this.words.add(new Keyword(this, 200, 100, 'FRAGILE', 'fragile'));
        
        // Background text for the prison stage
        this.add.text(50, 150, 'The specimen is heavy and static.', { font: '24px Courier', fill: '#000' });
        // Make the "static" word grabbable.
        this.words.add(new Keyword(this, 600, 150, 'STATIC', 'static_remove_mobility'));

        this.physics.add.collider(this.player, this.redactionBars, this.onPlayerVsRedactionBar, null, this);


        this.cursors = this.input.keyboard.createCursorKeys(); // Initialize cursor keys
        this.activeProperties = new Map(); // Map to store active properties on objects

        // Initial Player State: slow and heavy
        this.playerSpeed = 50; // Slower movement
        this.physics.world.gravity.y = 800; // Higher gravity for "heavy" feeling




                        


                                                


                        


                                                                        // Player Instructions


                        


                                                


                        


                                                                        const instructions = [


                        


                                                


                        


                                                                            "GOAL: Escape the document.",


                        


                                                


                        


                                                                            "You are the blot (■).",


                        


                                                


                        


                                                                            "The black bars are [REDACTED] walls.",


                        


                                                


                        


                                                                            "Drag BOLD words to change reality."


                        


                                                


                        


                                                                        ];


                        


                                                


                        


                                                                        this.add.text(50, 450, instructions, { font: '16px Courier', fill: '#000', lineSpacing: 10 });


                        


                                


                        


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


                        


                                


                        


                                                            this.returnToOriginalPos(gameObject);


                        


                                


                        


                                            


                        


                                


                        


                                                            if (gameObject.property === 'static_remove_mobility') {


                        


                                


                        


                                                                // If the 'static' word is dragged away from its original position (not applied to any object)


                        


                                


                        


                                                                                                                                // and returns to origin, consider it "removed" from the sentence.


                        


                                


                        


                                                                                                                                this.playerSpeed = 160; // Player becomes mobile


                        


                                


                        


                                                                                                                                this.physics.world.gravity.y = 300; // Restore normal gravity


                        


                                


                        


                                                                                                                                gameObject.destroy(); // Remove the word once its effect is triggered


                        


                                


                        


                                            


                        


                                


                        


                                                                // Display a temporary "Mobility Restored!" message


                        


                                


                        


                                                                let restoredText = this.add.text(this.game.config.width / 2, this.game.config.height / 2, 'Mobility Restored!', {


                        


                                


                        


                                                                    font: '32px Courier',


                        


                                


                        


                                                                    fill: '#000',


                        


                                


                        


                                                                    backgroundColor: '#E6E2D3'


                        


                                


                        


                                                                }).setOrigin(0.5);


                        


                                


                        


                                            


                        


                                


                        


                                                                this.tweens.add({


                        


                                


                        


                                                                    targets: restoredText,


                        


                                


                        


                                                                    alpha: 0,


                        


                                


                        


                                                                    duration: 2000,


                        


                                


                        


                                                                    delay: 1000,


                        


                                


                        


                                                                    onComplete: () => restoredText.destroy()


                        


                                


                        


                                                                });


                        


                                


                        


                                                            }


                        


                                


                        


                                                        }


                        


                                


                        


                                                    });


                        


                                


                        


                                                }


                        


                                


                        


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
        // Store the property directly on the target object
        target.activeProperty = property;

        switch(property) {
            case 'fragile':
                target.setTint(0xff0000); // Visual indicator for fragile
                break;
            case 'bouncy':
                target.setTint(0x00ff00); // Visual indicator for bouncy
                // For static bodies, bounce needs to be handled by the colliding body
                // We'll handle this in the onPlayerVsRedactionBar for now
                break;
        }
    }

    // New collision handler for player and redaction bars
    onPlayerVsRedactionBar(player, bar) {
        if (bar.activeProperty === 'fragile') {
            bar.destroy();
        } else if (bar.activeProperty === 'bouncy') {
            // Apply bounce effect to the player if the bar is bouncy
            player.setVelocityY(-player.body.velocity.y * 1.5); // Adjust bounce strength as needed
        }
    }

    onExit(player, zone) {
        this.physics.pause();
        player.setVelocity(0,0);
        this.add.text(400, 300, 'STAGE CLEAR', { fontSize: '48px', fill: '#000', backgroundColor: '#E6E2D3' }).setOrigin(0.5);
    }


}

// Keyword System
class Keyword extends Phaser.GameObjects.Text {
    constructor(scene, x, y, word, property) {
        super(scene, x, y, word, { font: 'bold 20px Courier', fill: '#000' });
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
