// game.js
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container', // Added parent
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

var playerObject;
var platforms;
var cursors;
var wallObject; // Existing Wall.static
var wallZipObject; // Wall.zip for door mechanic
var hazardObject; // Hazard.fire/ice
var exitShortcutObject;

// UI elements for renaming
var renameInput;
var activeFileObject = null;
var isTyping = false; // To pause game input when typing

var playerIsBurning = false; // Flag for fire hazard

var game = new Phaser.Game(config);

function preload ()
{
// Preload desktop wallpaper image for win screen using base64
    this.load.image('desktop_wallpaper', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
}

// FileObject Class
class FileObject extends Phaser.GameObjects.Container {
    constructor(scene, x, y, name, extension, color = 0x888888, width = 64, height = 64) {
        super(scene, x, y);

        this.scene = scene;
        this.fileName = name;
        this.extension = extension;
        this.currentName = this.fileName + this.extension;

        // Store original color for resetting purposes
        this.originalColor = color;

        // Create the rectangular body
        this.bodyRect = scene.add.rectangle(0, 0, width, height, color);
        this.add(this.bodyRect);

        // Create the text label
        this.textLabel = scene.add.text(0, -height / 2 - 10, this.currentName, {
            fontSize: '12px',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.textLabel);

        // Add physics to the container's bodyRect
        scene.physics.world.enable(this.bodyRect);
        this.bodyRect.body.setCollideWorldBounds(true);
        this.bodyRect.body.setBounce(0.2); // Default bounce for all objects
        // Initial immovable state based on extension
        if (extension === '.static' || extension === '.door' || extension === '.zip' || extension === '.fire' || extension === '.ice') {
             this.bodyRect.body.setImmovable(true);
        } else {
             this.bodyRect.body.setImmovable(false);
        }

        scene.add.existing(this);

        this.updatePhysics();
        this.setClickable();
    }

    updatePhysics() {
        this.bodyRect.body.setAllowGravity(true);
        this.bodyRect.body.setImmovable(false);
        this.bodyRect.body.setEnable(true);
        this.bodyRect.setVisible(true);
        this.bodyRect.body.setBounce(0.2); // Reset to default bounce
        this.bodyRect.fillColor = this.originalColor; // Reset color

        // Stop any ongoing tweens before applying new physics
        if (this.doorTween) {
            this.doorTween.stop();
            this.doorTween = null;
            this.bodyRect.scaleY = 1; // Reset scale in case tween was interrupted
        }

        switch (this.extension) {
            case ".png": // Player character - normal gravity
                this.bodyRect.body.setAllowGravity(true);
                this.bodyRect.body.gravity.y = config.physics.arcade.gravity.y; // Restore default gravity
                this.bodyRect.body.setImmovable(false);
                break;
            case ".gravity_0": // Player character - no gravity
                this.bodyRect.body.setAllowGravity(true); // Still allow gravity but set it to 0
                this.bodyRect.body.gravity.y = 0;
                this.bodyRect.body.setImmovable(false);
                break;
            case ".falling":
                break;
            case ".static":
                this.bodyRect.body.setAllowGravity(false);
                this.bodyRect.body.setImmovable(true);
                break;
            case ".bouncy":
                this.bodyRect.body.setBounce(0.9); // High bounce
                break;
            case ".ghost":
                this.bodyRect.body.setEnable(false);
                this.bodyRect.setVisible(false);
                break;
            case ".door":
                this.bodyRect.body.setAllowGravity(false);
                this.bodyRect.body.setImmovable(true);
                // Animate the door sliding open
                this.doorTween = this.scene.tweens.add({
                    targets: this.bodyRect,
                    scaleY: 0, // Shrink vertically
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        this.bodyRect.setVisible(false); // Hide completely after animation
                        this.bodyRect.body.setEnable(false); // Disable physics body
                    }
                });
                break;
            case ".zip":
                this.bodyRect.body.setAllowGravity(false);
                this.bodyRect.body.setImmovable(true);
                this.bodyRect.setVisible(true);
                this.bodyRect.body.setEnable(true);
                this.bodyRect.scaleY = 1; // Ensure full scale
                break;
            case ".fire":
                this.bodyRect.body.setAllowGravity(false);
                this.bodyRect.body.setImmovable(true);
                this.bodyRect.fillColor = 0xFF0000; // Red
                break;
            case ".ice":
                this.bodyRect.body.setAllowGravity(false);
                this.bodyRect.body.setImmovable(true);
                this.bodyRect.fillColor = 0xADD8E6; // Light Blue
                break;
            default:
                break;
        }
        this.textLabel.setText(this.fileName + this.extension);
    }

    setClickable() {
        this.bodyRect.setInteractive();
        this.bodyRect.on('pointerdown', this.onClicked, this);
    }

    onClicked() {
        if (isTyping) return; // Don't allow clicking other objects while typing

        activeFileObject = this;
        isTyping = true;
        
        // Convert game world coordinates to screen coordinates
        const canvasBounds = this.scene.sys.game.canvas.getBoundingClientRect();
        const gameX = this.bodyRect.body.x + this.bodyRect.body.width / 2;
        const gameY = this.bodyRect.body.y; // Position above the object

        // Scale factor for Phaser canvas potentially being scaled by CSS
        const scaleX = this.scene.sys.game.canvas.offsetWidth / this.scene.sys.game.config.width;
        const scaleY = this.scene.sys.game.canvas.offsetHeight / this.scene.sys.game.config.height;

        // Adjust screen coordinates by scale factor
        const screenX = canvasBounds.left + (gameX * scaleX);
        const screenY = canvasBounds.top + (gameY * scaleY);

        renameInput.style.display = 'block';
        renameInput.style.left = `${screenX - renameInput.offsetWidth / 2}px`;
        renameInput.style.top = `${screenY - renameInput.offsetHeight}px`; // Position above
        renameInput.value = this.currentName;
        renameInput.focus();
        renameInput.select(); // Select existing text for easy overwrite
    }

    rename(newExt) {
        const validExtensions = [".png", ".static", ".falling", ".bouncy", ".ghost", ".door", ".zip", ".fire", ".ice", ".gravity_0"]; // Added .gravity_0
        if (validExtensions.includes(newExt)) {
            this.extension = newExt;
            this.currentName = this.fileName + this.extension;
            this.textLabel.setText(this.currentName);
            this.updatePhysics();
            // playClickSound(); // Not implemented yet
            return true;
        } else {
            // triggerErrorEffect(this); // Not implemented yet
            console.log(`Invalid extension: ${newExt}`);
            return false;
        }
    }
}

// Function to handle rename input submission or blur
function handleRenameInput() {
    if (activeFileObject && renameInput.value) {
        const fullNewName = renameInput.value;
        const lastDotIndex = fullNewName.lastIndexOf('.');
        if (lastDotIndex > 0) { // Ensure there's a dot and it's not the first character
            const newFileName = fullNewName.substring(0, lastDotIndex);
            const newExtension = fullNewName.substring(lastDotIndex);
            activeFileObject.fileName = newFileName; // Update filename as well
            activeFileObject.rename(newExtension);
        } else {
            // No extension provided, treat entire input as filename and use a default extension or warn
            activeFileObject.fileName = fullNewName;
            activeFileObject.rename(""); // Or some default invalid state
        }
    }
    renameInput.style.display = 'none';
    isTyping = false;
    activeFileObject = null;
}


function create ()
{
    // Create texture from base64 data
    this.textures.addBase64('desktop_wallpaper', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

    this.cameras.main.setBackgroundColor('#000000'); // Black background

    // Add player instructions
    this.add.text(10, 10, 'Move with Arrow Keys. Jump with Up Arrow.\nClick objects to rename them (e.g., Wall.ghost, Hazard.ice, User.gravity_0)', {
        fontSize: '16px',
        fill: '#FFFFFF',
        backgroundColor: '#333333',
        padding: { x: 5, y: 5 }
    });

    // Get reference to the HTML input element
    renameInput = document.getElementById('renameInput');
    renameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            handleRenameInput();
        }
    });
    renameInput.addEventListener('blur', handleRenameInput); // Handle blur event

    // Reset playerIsBurning flag
    playerIsBurning = false;

    // Create platforms group
    platforms = this.physics.add.staticGroup();

    // Generate a texture for the platform dynamically
    var graphics = this.add.graphics();
    graphics.fillStyle(0x00FF00, 1); // Green platform
    graphics.fillRect(0, 0, config.width, 32); // Platform width same as game width
    graphics.generateTexture('ground', config.width, 32); // Use game width for texture
    graphics.destroy();

    // Add a ground platform
    platforms.create(config.width / 2, config.height - 16, 'ground'); // Center at bottom (height - half of texture height)

    // Create player as a FileObject
    playerObject = new FileObject(this, 100, config.height - 100, 'User', '.png', 0xFFFFFF, 32, 32);
    playerObject.bodyRect.body.setCollideWorldBounds(true);
    playerObject.bodyRect.body.setBounce(0.2);
    
    // Create a sample Wall object (static)
    wallObject = new FileObject(this, 400, config.height - 100, 'Wall', '.static', 0x888888, 64, 128);

    // Create Wall.zip object that can become a door
    wallZipObject = new FileObject(this, 600, config.height - 100, 'Wall', '.zip', 0xAAAAAA, 64, 128); // Grayish color for .zip
    wallZipObject.bodyRect.body.setImmovable(true); // Initially immovable

    // Create Hazard.fire object
    hazardObject = new FileObject(this, 250, config.height - 16 - 32 / 2, 'Hazard', '.fire', 0xFF0000, 64, 32); // Red for fire, placed on ground
    hazardObject.bodyRect.body.setAllowGravity(false);
    hazardObject.bodyRect.body.setImmovable(true);

    // Create Exit.shortcut object
    exitShortcutObject = new FileObject(this, config.width - 50, config.height - 100, 'Exit', '.shortcut', 0x0000FF, 32, 32); // Blue square
    exitShortcutObject.bodyRect.body.setAllowGravity(false);
    exitShortcutObject.bodyRect.body.setImmovable(true);

    // Colliders
    this.physics.add.collider(playerObject.bodyRect, platforms);
    this.physics.add.collider(playerObject.bodyRect, wallObject.bodyRect);
    this.physics.add.collider(playerObject.bodyRect, wallZipObject.bodyRect);

    // Overlap for win condition
    this.physics.add.overlap(playerObject.bodyRect, exitShortcutObject.bodyRect, winGame, null, this);

    // Overlap for hazard condition
    this.physics.add.overlap(playerObject.bodyRect, hazardObject.bodyRect, hitHazard, null, this);

    // Initialize keyboard input
    cursors = this.input.keyboard.createCursorKeys();
}

// hitHazard function
function hitHazard(playerBody, hazardBody) {
    if (hazardBody.gameObject.parentContainer.extension === '.fire' && !playerIsBurning) {
        playerIsBurning = true; // Set flag to prevent re-triggering

        // Flash player red
        this.tweens.add({
            targets: playerObject.bodyRect,
            fillColor: 0xFF0000, // Red
            duration: 100,
            yoyo: true, // Flash back and forth
            repeat: 2, // Repeat a few times
            onComplete: () => {
                // After flashing, if still burning, trigger game over
                if (playerIsBurning) {
                    this.physics.pause();
                    this.add.text(config.width / 2, config.height / 2, 'Burned! Game Over!', {
                        fontSize: '48px',
                        fill: '#FF0000'
                    }).setOrigin(0.5);
                    this.time.delayedCall(2000, () => {
                        this.scene.restart();
                    }, [], this);
                }
            }
        });
    }
}


function update ()
{
    if (isTyping) {
        playerObject.bodyRect.body.setVelocityX(0);
        return;
    }

    // Handle player movement
    if (cursors.left.isDown) {
        playerObject.bodyRect.body.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        playerObject.bodyRect.body.setVelocityX(160);
    } else {
        // If no left/right key is pressed
        if (playerObject.extension === '.gravity_0') {
            // Apply gradual deceleration for floating (low friction)
            playerObject.bodyRect.body.setVelocityX(playerObject.bodyRect.body.velocity.x * 0.95); // Adjust 0.95 for desired slipperiness
            // Stop completely if velocity is very low
            if (Math.abs(playerObject.bodyRect.body.velocity.x) < 5) {
                playerObject.bodyRect.body.setVelocityX(0);
            }
        } else {
            // Normal instant stop for other extensions
            playerObject.bodyRect.body.setVelocityX(0);
        }
    }

    if (cursors.up.isDown && playerObject.bodyRect.body.touching.down) {
        playerObject.bodyRect.body.setVelocityY(-330);
    }

    // Check if player is on an ice surface
    let onIce = false;
    if (this.physics.world.overlap(playerObject.bodyRect, hazardObject.bodyRect)) {
        if (hazardObject.extension === '.ice' && playerObject.bodyRect.body.onFloor()) {
            onIce = true;
        }
    }
    
    if (onIce) {
        // Reduce player horizontal velocity rapidly
        playerObject.bodyRect.body.setVelocityX(playerObject.bodyRect.body.velocity.x * 0.9); // Slower deceleration
    }

    // Lose condition
    if (playerObject.bodyRect.body.y > config.height) {
        this.add.text(config.width / 2, config.height / 2, 'Game Over!', {
            fontSize: '48px',
            fill: '#FF0000'
        }).setOrigin(0.5);
        this.physics.pause();
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        }, [], this);
    }
}

// Win Game function
function winGame(playerBody, exitBody) {
    this.physics.pause(); // Stop all physics
    // "game window closes" visual effect
    this.tweens.add({
        targets: this.cameras.main,
        zoom: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
            // Display final screen
            // Ensure the background is fully visible before adding UI elements
            const bg = this.add.image(config.width / 2, config.height / 2, 'desktop_wallpaper').setOrigin(0.5);
            bg.displayWidth = config.width;
            bg.displayHeight = config.height;
            bg.setScrollFactor(0); // Ensure it stays fixed relative to camera

            // "User.png is finally pasted" effect - place player on desktop
            playerObject.setVisible(false); // Hide the game player
            const playerOnDesktop = this.add.rectangle(config.width / 2, config.height / 2 + 50, playerObject.bodyRect.width, playerObject.bodyRect.height, playerObject.bodyRect.fillColor).setDepth(1).setScrollFactor(0);
            this.add.text(playerOnDesktop.x, playerOnDesktop.y - 20, 'User.png', {
                fontSize: '12px',
                fill: '#FFFFFF'
            }).setOrigin(0.5).setDepth(1).setScrollFactor(0);

            // Add "You Win!" text
            this.add.text(config.width / 2, config.height / 2 - 100, 'You Win!', {
                fontSize: '64px',
                fill: '#00FF00' // Green for win
            }).setOrigin(0.5).setDepth(1).setScrollFactor(0);

            // Add restart instruction and make it interactive
            const restartText = this.add.text(config.width / 2, config.height / 2 + 150, 'Click to Restart', {
                fontSize: '24px',
                fill: '#FFFFFF',
                backgroundColor: '#333333',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5).setInteractive().setDepth(1).setScrollFactor(0);

            restartText.on('pointerdown', () => {
                this.scene.restart();
            });

            this.cameras.main.setZoom(1); // Reset zoom for the static win screen
        }
    });
}
