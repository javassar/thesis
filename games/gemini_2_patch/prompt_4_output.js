const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222222',
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

let hero;
let platforms;
let flag;
let spikes;
let devText;
let frustrationText; // New text object for frustration
let instructionsText; // New text object for instructions
let frustration = 0;
let corruptionMenu;
let glitchCursor;
let targetObject = null; // Object currently being "hacked"
let patchTimerEvent;
let patchTimeRemaining = 60;
let gameTimerEvent;
let gameTimeRemaining = 300; // 5 minutes = 300 seconds
let gameEnded = false;
let uninstallButton;

// Store initial properties for reset/toggle
const initialHeroScale = 1;
const initialHeroGravityY = 300; // From config.physics.arcade.gravity.y

function preload() {
    // No assets to preload yet
}

function create() {
    // Add grid overlay
    const graphics = this.add.graphics({ lineStyle: { width: 1, color: 0x333333, alpha: 0.2 } });
    for (let x = 0; x < config.width; x += 32) {
        graphics.lineBetween(x, 0, x, config.height);
    }
    for (let y = 0; y < config.height; y += 32) {
        graphics.lineBetween(0, y, config.width, y);
    }

    // Platforms
    platforms = this.physics.add.staticGroup();

    // Ground platform (visual rectangle and physics body)
    let ground = this.add.rectangle(400, 584, 800, 32, 0xFFFFFF).setDepth(0).setInteractive();
    this.physics.add.existing(ground, true); // true makes it a static body
    platforms.add(ground);
    ground.name = 'platform';
    ground.initialScale = 1;
    ground.initialGravityY = 0; // Static body has no gravity

    // Hero (visual rectangle and physics body)
    let heroRect = this.add.rectangle(100, 450, 32, 64, 0x00FF00).setDepth(1).setInteractive();
    this.physics.add.existing(heroRect);
    hero = heroRect; // Assign the physics-enabled rectangle to hero
    hero.body.setCollideWorldBounds(true);
    hero.body.setSize(32, 64, false); // No offset
    hero.name = 'hero';
    hero.initialScale = initialHeroScale;
    hero.initialGravityY = initialHeroGravityY;

    this.physics.add.collider(hero, platforms);

    // Flag (simple triangle on a pole) - using graphics
    this.flag = this.add.graphics(); // Assign to this.flag
    this.flag.fillStyle(0xFFFFFF, 1);
    this.flag.fillRect(700, 480, 10, 80); // Pole
    this.flag.fillTriangle(710, 480, 710, 510, 750, 495); // Flag part
    this.flag.setDepth(0);
    this.flag.setInteractive(new Phaser.Geom.Rectangle(695, 475, 60, 110), Phaser.Geom.Rectangle.Contains);
    this.flag.name = 'flag';
    // Flag is a graphics object, not a physics object, so no direct body.gravity or scale.
    // However, for consistency in targetObject, we'll give it dummy properties
    this.flag.initialScale = 1;

    // Spikes (simple red rectangles for now) - using graphics
    this.spikes = this.add.graphics(); // Assign to this.spikes
    this.spikes.fillStyle(0xFF0000, 1);
    this.spikes.fillRect(450, 552, 64, 32); // Example spikes
    this.spikes.setDepth(0);
    this.spikes.setInteractive(new Phaser.Geom.Rectangle(450, 552, 64, 32), Phaser.Geom.Rectangle.Contains);
    this.spikes.name = 'spikes';
    this.spikes.initialScale = 1;

    // Invisible physics body for spikes
    let spikesPhysics = this.add.rectangle(450 + 32, 552 + 16, 64, 32).setVisible(false); // Centered
    this.physics.add.existing(spikesPhysics);
    spikesPhysics.name = 'spikes_physics';
    spikesPhysics.body.setAllowGravity(false);
    spikesPhysics.body.setImmovable(true);


    // Dev Dialogue (Placeholder)
    devText = this.add.text(config.width / 2, 50, `Testing the jump height again. Should be perfect now. (Patch in ${patchTimeRemaining}s)`, {
        fontFamily: '"Consolas", "Courier New"',
        fontSize: '18px',
        color: '#00FF00',
        align: 'center'
    }).setOrigin(0.5);

    // Frustration Meter Display
    frustrationText = this.add.text(10, 10, `Frustration: ${frustration.toFixed(0)}`, {
        fontFamily: '"Consolas", "Courier New"',
        fontSize: '16px',
        color: '#FFFFFF'
    });

    // Instructions Text
    instructionsText = this.add.text(config.width / 2, config.height - 30, 'Click on game elements (hero, platform, flag, spikes) to corrupt them!', {
        fontFamily: '"Consolas", "Courier New"',
        fontSize: '16px',
        color: '#AAAAAA',
        align: 'center'
    }).setOrigin(0.5);


    // Corruption Menu UI (hidden initially)
    corruptionMenu = this.add.container(0, 0).setDepth(10).setVisible(false);
    let menuBackground = this.add.rectangle(0, 0, 150, 100, 0x555555).setOrigin(0, 0);
    let button1 = this.add.text(10, 10, 'Gravity', { fontSize: '16px', color: '#ffffff' }).setInteractive();
    let button2 = this.add.text(10, 40, 'Scale', { fontSize: '16px', color: '#ffffff' }).setInteractive();
    let button3 = this.add.text(10, 70, 'Collision', { fontSize: '16px', color: '#ffffff' }).setInteractive();
    corruptionMenu.add([menuBackground, button1, button2, button3]);

    // Glitch (Player Cursor)
    glitchCursor = this.add.circle(0, 0, 8, 0xFFFFFF).setDepth(100).setVisible(true);
    this.input.on('pointermove', (pointer) => {
        if (!gameEnded) { // Only move cursor if game hasn't ended
            glitchCursor.x = pointer.x;
            glitchCursor.y = pointer.y;
        }
    });
    this.input.mouse.disableContextMenu(); // Prevent right-click context menu

    // Input handling for game objects and menu
    this.input.on('pointerdown', (pointer, currentlyOverGameObjects) => {
        if (gameEnded && currentlyOverGameObjects.includes(uninstallButton)) {
            // Only allow clicking uninstall button when game ended
            return;
        }
        if (gameEnded) return; // Disable all other input if game ended

        let clickedOnMenu = false;
        let clickedHackableObject = null;

        for (let obj of currentlyOverGameObjects) {
            // Check if any part of the corruption menu was clicked
            if (corruptionMenu.list.includes(obj)) {
                clickedOnMenu = true;
                break;
            }
            // Check if a hackable object was clicked
            if (obj === hero || obj === ground || obj === this.flag || obj === this.spikes) {
                clickedHackableObject = obj;
            }
        }

        if (clickedOnMenu) {
            // If menu was clicked, let the button handlers deal with it
            // Don't close the menu here
        } else if (clickedHackableObject) {
            targetObject = clickedHackableObject;
            corruptionMenu.setPosition(pointer.x, pointer.y);
            corruptionMenu.setVisible(true);
        } else {
            // Clicked neither menu nor hackable object, so hide menu
            corruptionMenu.setVisible(false);
            targetObject = null;
        }
    });

    // Handle clicks on corruption menu buttons
    button1.on('pointerdown', () => { // Gravity
        if (targetObject && targetObject.body) {
            if (targetObject.body.gravity.y === targetObject.initialGravityY) {
                targetObject.body.setGravityY(-initialHeroGravityY * 0.5); // Example: half inverse gravity
            } else {
                targetObject.body.setGravityY(targetObject.initialGravityY);
            }
            devText.setText(`Gravity of ${targetObject.name} changed! (Patch in ${patchTimeRemaining}s)`);
            frustration = Math.min(100, frustration + 5); // Small frustration increase for successful hack
        } else if (targetObject.name === 'flag' || targetObject.name === 'spikes') {
            devText.setText(`Cannot change gravity for ${targetObject.name}. (Patch in ${patchTimeRemaining}s)`);
        }
        corruptionMenu.setVisible(false);
    });

    button2.on('pointerdown', () => { // Scale
        if (targetObject && targetObject.setScale) {
            const newScale = targetObject.scaleX === targetObject.initialScale ? 2 : targetObject.initialScale; // Toggle between initial and 2x
            this.tweens.add({
                targets: targetObject,
                scaleX: newScale,
                scaleY: newScale,
                duration: 200,
                onUpdate: () => {
                    // If it's a physics body, also update its size
                    if (targetObject.body) {
                        targetObject.body.setSize(targetObject.width * targetObject.scaleX, targetObject.height * targetObject.scaleY);
                    }
                }
            });
            devText.setText(`Scale of ${targetObject.name} changed! (Patch in ${patchTimeRemaining}s)`);
            frustration = Math.min(100, frustration + 5); // Small frustration increase for successful hack
        }
        corruptionMenu.setVisible(false);
    });

    button3.on('pointerdown', () => { // Collision
        if (targetObject && targetObject.body) {
            targetObject.body.enable = !targetObject.body.enable;
            devText.setText(`Collision for ${targetObject.name} toggled to ${targetObject.body.enable}! (Patch in ${patchTimeRemaining}s)`);
            frustration = Math.min(100, frustration + 5); // Small frustration increase for successful hack
        } else if (targetObject.name === 'flag' || targetObject.name === 'spikes') {
            devText.setText(`Cannot change collision for ${targetObject.name}. (Patch in ${patchTimeRemaining}s)`);
        }
        corruptionMenu.setVisible(false);
    });


    // Collision detection
    this.physics.add.overlap(hero, this.flag, () => {
        frustration -= 10;
        frustration = Math.max(0, frustration); // Ensure frustration doesn't go below 0
        console.log("Hero touched flag! Frustration:", frustration);
        // Reset hero position or trigger event
        hero.body.setVelocityX(0);
        hero.x = 100;
        hero.y = 450;
        devText.setText(`The hero reached the flag. Dev is happy. Frustration: ${frustration.toFixed(0)} (Patch in ${patchTimeRemaining}s)`);
        frustrationText.setText(`Frustration: ${frustration.toFixed(0)}`);
    });

    this.physics.add.overlap(hero, spikesPhysics, () => {
        frustration += 15;
        frustration = Math.min(100, frustration); // Ensure frustration doesn't exceed 100
        console.log("Hero touched spikes! Frustration:", frustration);
        // Reset hero position or trigger event
        hero.body.setVelocityX(0);
        hero.x = 100;
        hero.y = 450;
        devText.setText(`The hero touched spikes! Dev is annoyed. Frustration: ${frustration.toFixed(0)} (Patch in ${patchTimeRemaining}s)`);
        frustrationText.setText(`Frustration: ${frustration.toFixed(0)}`);
    });

    // Patch Cycle Timer
    patchTimerEvent = this.time.addEvent({
        delay: 1000, // 1 second
        callback: onPatchTimerTick,
        callbackScope: this,
        loop: true
    });

    // Global Game Timer (5 minutes)
    gameTimerEvent = this.time.addEvent({
        delay: 1000, // 1 second
        callback: onGameTimerTick,
        callbackScope: this,
        loop: true
    });

    // Create the Uninstall button (hidden initially)
    uninstallButton = this.add.text(config.width / 2, config.height / 2, 'UNINSTALL', {
        fontFamily: '"Consolas", "Courier New"',
        fontSize: '48px',
        color: '#FF0000',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(20).setInteractive().setVisible(false);

    uninstallButton.on('pointerdown', () => {
        if (gameEnded) {
            // Screen goes black
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                // Display "File Deleted"
                this.add.text(config.width / 2, config.height / 2, 'File Deleted', {
                    fontFamily: '"Consolas", "Courier New"',
                    fontSize: '64px',
                    color: '#FFFFFF'
                }).setOrigin(0.5).setDepth(21);
                // Optionally stop all game updates or refresh
                this.physics.pause();
                this.time.removeAllEvents();
                this.input.enabled = false;
                gameEnded = true; // Ensure it stays ended
            });
        }
    });
}

function onPatchTimerTick() {
    if (gameEnded) return;

    patchTimeRemaining--;
    devText.setText(devText.text.split('(')[0].trim() + ` (Patch in ${patchTimeRemaining}s)`);

    if (patchTimeRemaining <= 0) {
        performPatch.call(this); // Reset context for 'this'
    }
}

function onGameTimerTick() {
    if (gameEnded) return;

    gameTimeRemaining--;
    // Update a separate text for game timer if desired, or integrate into devText

    if (gameTimeRemaining <= 0 && frustration < 100) {
        // Lose condition (or just game over if not frustrated enough)
        triggerEnding.call(this, false); // Pass false for a "lose" ending
    }
}

function performPatch() {
    // Stop hero movement momentarily for "patching" effect
    hero.body.setVelocityX(0);

    // Reset hero properties
    hero.body.setGravityY(hero.initialGravityY);
    hero.body.enable = true;
    this.tweens.add({
        targets: hero,
        scaleX: hero.initialScale,
        scaleY: hero.initialScale,
        duration: 200,
        onUpdate: () => {
            if (hero.body) {
                hero.body.setSize(hero.width * hero.scaleX, hero.height * hero.scaleY);
            }
        }
    });

    // Reset ground platform properties
    if (platforms.children.entries[0] && platforms.children.entries[0].name === 'platform') {
        const platform = platforms.children.entries[0];
        if (platform.body) {
            platform.body.setGravityY(platform.initialGravityY);
            platform.body.enable = true;
        }
        this.tweens.add({
            targets: platform,
            scaleX: platform.initialScale,
            scaleY: platform.initialScale,
            duration: 200,
            onUpdate: () => {
                if (platform.body) {
                    platform.body.setSize(platform.width * platform.scaleX, platform.height * platform.scaleY);
                }
            }
        });
    }

    // Reset hero position
    hero.x = 100;
    hero.y = 450;
    hero.body.setVelocity(0); // Stop any lingering velocity

    devText.setText(`Fixed that bug. Let's try again. (Patch in ${patchTimeRemaining}s)`);
    patchTimeRemaining = 60; // Reset timer
}

function triggerEnding(win = true) {
    gameEnded = true;
    this.physics.pause();
    this.time.removeAllEvents(); // Stop all timers
    this.input.enabled = false; // Disable all input
    corruptionMenu.setVisible(false); // Hide corruption menu

    if (win) {
        devText.setText("CRITICAL ERROR: Uninstall project?");
        uninstallButton.setVisible(true);
        this.input.enabled = true; // Re-enable input for the uninstall button
        glitchCursor.setVisible(false); // Hide the glitch cursor, as it's not needed for the button.
    } else {
        // Lose condition - e.g., timer ran out without enough frustration
        devText.setText("The Dev finished the game without further issues. Project complete.");
        // Maybe display a "Game Over" message
        this.add.text(config.width / 2, config.height / 2, 'GAME OVER', {
            fontFamily: '"Consolas", "Courier New"',
            fontSize: '64px',
            color: '#FFFF00'
        }).setOrigin(0.5).setDepth(20);
    }
}

function update() {
    if (gameEnded) return;

    // Update frustration text
    frustrationText.setText(`Frustration: ${frustration.toFixed(0)}`);

    // AI Hero behavior
    if (hero.body.blocked.down || hero.body.touching.down) {
        if (hero.x < this.flag.x - 20) { // Move towards flag, stopping a bit before it
            hero.body.setVelocityX(100);
        } else if (hero.x > this.flag.x + 20) {
            hero.body.setVelocityX(-100);
        } else {
            hero.body.setVelocityX(0); // Stop when near flag
        }
    }

    // Check for "Broken" state (Out of Bounds)
    if (hero.y > config.height || hero.x < 0 || hero.x > config.width) {
        frustration += 0.05; // Small, continuous frustration increase
        frustration = Math.min(100, frustration);
        // devText.setText(`What is happening to the physics engine?! Frustration: ${frustration.toFixed(0)} (Patch in ${patchTimeRemaining}s)`); // Moved to below for general devText update
        if (frustration >= 100) {
            triggerEnding.call(this, true); // Win condition
        }
        // If hero is OOB, reset its position after some time to prevent infinite frustration gain
        if (hero.y > config.height + 50 || hero.x < -50 || hero.x > config.width + 50) {
             hero.x = 100;
             hero.y = 450;
             hero.body.setVelocity(0); // Stop any lingering velocity
        }
    }

    // Dev reactions based on frustration level
    if (frustration >= 100) {
        if (!gameEnded) { // Only trigger ending once
            triggerEnding.call(this, true);
        }
    } else if (frustration > 50) {
        if (!devText.text.includes("physics engine")) { // Avoid constant updates
             devText.setText(`What is happening to the physics engine?! Frustration: ${frustration.toFixed(0)} (Patch in ${patchTimeRemaining}s)`);
        }
    } else {
        // Default dev text if frustration is low and no other specific message
        if (!devText.text.includes("Testing") && !devText.text.includes("reached the flag") && !devText.text.includes("touched spikes") && !devText.text.includes("Fixed that bug")) {
            devText.setText(`Testing the jump height again. Should be perfect now. (Patch in ${patchTimeRemaining}s)`);
        }
    }
}
