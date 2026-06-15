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
let patchCount = 0; // New variable to track patches

let liveCodingFxActive = false;
let liveCodingTexts = [];
const liveCodingPhrases = [
    "Fixing_Everything_NOW.exe",
    "ERROR_CODE_0xDEADBEEF",
    "RECOMPILING_KERNEL.bin",
    "PATCH_APPLIED_FORCE.dll",
    "DEBUG_MODE_ENGAGED...",
    "SYSTEM_CRASH_IMMINENT!"
];

// Store initial properties for reset/toggle
const initialHeroScale = 1;
const initialHeroGravityY = 300; // From config.physics.arcade.gravity.y

// Array to store hackable objects for easier iteration
let hackableObjects = [];

// Dev Dialogue Messages
const devMessages = {
    initial: "Testing the jump height again. Should be perfect now.",
    lowFrustration: [
        "Hmm, that's odd. Just a small glitch, I suppose.",
        "The simulation is acting up a bit today.",
        "Nothing a quick patch won't fix.",
        "Minor adjustments needed."
    ],
    mediumFrustration: [
        "Wait, what? The collision was fine a second ago!",
        "What is happening to the physics engine?!",
        "This isn't supposed to be possible!",
        "Seriously, what is going on here?"
    ],
    highFrustration: [
        "This is getting ridiculous! I just fixed that!",
        "My code is perfect! It can't be breaking like this!",
        "I'm losing my mind over this buggy mess!",
        "CRITICAL ERROR: System instability detected!"
    ],
    franticFrustration: [
        "I can't keep up! Everything is falling apart!",
        "MY PROJECT! NO! IT CAN'T BE!",
        "This is impossible! I'm live coding to fix this NOW!",
        "AHHH! Why won't it just WORK?!"
    ],
    heroSuccess: "The hero reached the flag. Dev is happy.",
    heroSpikes: "The hero touched spikes! Dev is annoyed.",
    corruptionChange: (objectName, property) => `${objectName}'s ${property} changed unexpectedly!`,
    patchApplied: "Fixed that bug. Let's try again.",
    patchNewPlatform: "Fixed that bug. And added a new platform.",
    patchAntiGravity: "Fixed that bug. Let's try anti-gravity zones.",
    cannotChange: (objectName) => `Cannot change properties for ${objectName}.`,
    uninstallPrompt: "CRITICAL ERROR: Uninstall project?",
    gameOver: "The Dev finished the game without further issues. Project complete."
};

function getDevMessage(type, objectName = '', property = '') {
    const currentFrustration = frustration;
    let message = '';

    if (type === 'corruptionChange') {
        message = devMessages.corruptionChange(objectName, property);
    } else if (type === 'heroSuccess') {
        message = devMessages.heroSuccess;
    } else if (type === 'heroSpikes') {
        message = devMessages.heroSpikes;
    } else if (type === 'patchApplied') {
        message = devMessages.patchApplied;
    } else if (type === 'patchNewPlatform') {
        message = devMessages.patchNewPlatform;
    } else if (type === 'patchAntiGravity') {
        message = devMessages.patchAntiGravity;
    } else if (type === 'cannotChange') {
        message = devMessages.cannotChange(objectName);
    } else if (type === 'uninstallPrompt') {
        message = devMessages.uninstallPrompt;
    } else if (type === 'gameOver') {
        message = devMessages.gameOver;
    } else if (type === 'initial') {
        message = devMessages.initial;
    } else { // dynamic messages based on frustration
        if (currentFrustration >= 80) {
            message = Phaser.Math.RND.pick(devMessages.franticFrustration);
        } else if (currentFrustration >= 50) {
            message = Phaser.Math.RND.pick(devMessages.highFrustration);
        } else if (currentFrustration >= 20) {
            message = Phaser.Math.RND.pick(devMessages.mediumFrustration);
        } else {
            message = Phaser.Math.RND.pick(devMessages.lowFrustration);
        }
    }

    // Only append patch timer if game hasn't ended
    if (!gameEnded && (type !== 'uninstallPrompt' && type !== 'gameOver')) {
        return message + ` (Patch in ${patchTimeRemaining}s)`;
    }
    return message;
}


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
    hackableObjects.push(ground);

    // Hero (visual rectangle and physics body)
    let heroRect = this.add.rectangle(100, 450, 32, 64, 0x00FF00).setDepth(1).setInteractive();
    this.physics.add.existing(heroRect);
    hero = heroRect; // Assign the physics-enabled rectangle to hero
    hero.body.setCollideWorldBounds(true);
    hero.body.setSize(32, 64, false); // No offset
    hero.name = 'hero';
    hero.initialScale = initialHeroScale;
    hero.initialGravityY = initialHeroGravityY;
    hackableObjects.push(hero);

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
    hackableObjects.push(this.flag);

    // Spikes (simple red rectangles for now) - using graphics
    this.spikes = this.add.graphics(); // Assign to this.spikes
    this.spikes.fillStyle(0xFF0000, 1);
    this.spikes.fillRect(450, 552, 64, 32); // Example spikes
    this.spikes.setDepth(0);
    this.spikes.setInteractive(new Phaser.Geom.Rectangle(450, 552, 64, 32), Phaser.Geom.Rectangle.Contains);
    this.spikes.name = 'spikes';
    this.spikes.initialScale = 1;
    hackableObjects.push(this.spikes);

    // Invisible physics body for spikes
    let spikesPhysics = this.add.rectangle(450 + 32, 552 + 16, 64, 32).setVisible(false); // Centered
    this.physics.add.existing(spikesPhysics);
    spikesPhysics.name = 'spikes_physics';
    spikesPhysics.body.setAllowGravity(false);
    spikesPhysics.body.setImmovable(true);


    // Dev Dialogue (Placeholder)
    devText = this.add.text(config.width / 2, 50, getDevMessage('initial'), {
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
    // Glitch cursor flickering effect
    this.tweens.add({
        targets: glitchCursor,
        alpha: { from: 1, to: 0.5 },
        duration: 100,
        yoyo: true,
        repeat: -1
    });

    this.input.on('pointermove', (pointer) => {
        if (!gameEnded) { // Only move cursor if game hasn't ended
            glitchCursor.x = pointer.x;
            glitchCursor.y = pointer.y;
        }
    });
    this.input.mouse.disableContextMenu(); // Prevent right-click context menu

    // Hover effects for hackable objects
    hackableObjects.forEach(obj => {
        obj.on('pointerover', () => {
            if (!gameEnded && !corruptionMenu.visible) {
                // For rectangles, change tint. For graphics, redraw with border? Or use tint.
                if (obj instanceof Phaser.GameObjects.Rectangle) {
                    obj.setStrokeStyle(2, 0x00FF00); // Green border
                } else if (obj instanceof Phaser.GameObjects.Graphics) {
                    obj.setTint(0x00FF00);
                }
            }
        });

        obj.on('pointerout', () => {
            if (obj instanceof Phaser.GameObjects.Rectangle) {
                obj.setStrokeStyle(0); // Remove border
            } else if (obj instanceof Phaser.GameObjects.Graphics) {
                obj.clearTint();
            }
        });
    });

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
            if (hackableObjects.includes(obj)) {
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
            // Corruption visual feedback: temporarily tint the object
            // This is applied after the corruption, not on menu open
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
            devText.setText(getDevMessage('corruptionChange', targetObject.name, 'gravity'));
            frustration = Math.min(100, frustration + 5); // Small frustration increase for successful hack
            applyCorruptionVisual(targetObject);
        } else if (targetObject.name === 'flag' || targetObject.name === 'spikes') {
            devText.setText(getDevMessage('cannotChange', targetObject.name));
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
            devText.setText(getDevMessage('corruptionChange', targetObject.name, 'scale'));
            frustration = Math.min(100, frustration + 5); // Small frustration increase for successful hack
            applyCorruptionVisual(targetObject);
        }
        corruptionMenu.setVisible(false);
    });

    button3.on('pointerdown', () => { // Collision
        if (targetObject && targetObject.body) {
            targetObject.body.enable = !targetObject.body.enable;
            devText.setText(getDevMessage('corruptionChange', targetObject.name, 'collision'));
            frustration = Math.min(100, frustration + 5); // Small frustration increase for successful hack
            applyCorruptionVisual(targetObject);
        } else if (targetObject.name === 'flag' || targetObject.name === 'spikes') {
            devText.setText(getDevMessage('cannotChange', targetObject.name));
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
        devText.setText(getDevMessage('heroSuccess'));
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
        devText.setText(getDevMessage('heroSpikes'));
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

    function applyCorruptionVisual(obj) {
        if (!obj) return;
        // Apply a temporary glitch tint/flicker
        if (obj instanceof Phaser.GameObjects.Rectangle) {
            obj.setTint(0xFF00FF); // Magenta tint for corruption
            this.time.delayedCall(200, () => obj.clearTint(), [], this);
            this.tweens.add({
                targets: obj,
                alpha: { from: 1, to: 0.7 },
                duration: 50,
                yoyo: true,
                repeat: 1
            });
        } else if (obj instanceof Phaser.GameObjects.Graphics) {
            obj.setTint(0xFF00FF);
            this.time.delayedCall(200, () => obj.clearTint(), [], this);
            this.tweens.add({
                targets: obj,
                alpha: { from: 1, to: 0.7 },
                duration: 50,
                yoyo: true,
                repeat: 1
            });
        }
    }

    // Initialize Live Coding Text Objects
    for (let i = 0; i < 5; i++) { // Create 5 text objects for the effect
        let lcText = this.add.text(0, 0, '', {
            fontFamily: '"Consolas", "Courier New"',
            fontSize: '16px',
            color: '#FF0000',
            alpha: 0
        }).setOrigin(0.5).setDepth(15);
        liveCodingTexts.push(lcText);
    }
}

function spawnLiveCodingText(scene) {
    if (!liveCodingFxActive || gameEnded) return;

    let textObj = liveCodingTexts.find(t => t.alpha === 0); // Find an inactive text object
    if (!textObj) return;

    textObj.setText(Phaser.Math.RND.pick(liveCodingPhrases));
    textObj.x = Phaser.Math.Between(config.width * 0.1, config.width * 0.9);
    textObj.y = Phaser.Math.Between(config.height * 0.1, config.height * 0.8);
    textObj.alpha = 1;

    scene.tweens.add({
        targets: textObj,
        y: textObj.y - 50, // Move up
        alpha: 0,
        duration: Phaser.Math.Between(1500, 2500),
        ease: 'Linear'
    });
}


function onPatchTimerTick() {
    if (gameEnded) return;

    patchTimeRemaining--;
    if (frustration < 100) { // Only update dev text if game is not in final frustrated state
        devText.setText(getDevMessage('dynamic'));
    }

    if (patchTimeRemaining <= 0) {
        performPatch.call(this); // Reset context for 'this'
    } else {
        // Trigger live coding effect if frustration is high
        if (frustration > 70 && !liveCodingFxActive) { // Start effect
            liveCodingFxActive = true;
            this.time.addEvent({
                delay: 300, // Spawn a new text every 300ms
                callback: spawnLiveCodingText,
                callbackScope: this,
                loop: true
            });
        }
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
    patchCount++; // Increment patch count

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

    // Dynamic Environment Changes based on patchCount
    let patchMessage = '';
    if (patchCount === 1) {
        // After first patch, add a new platform above the hero's path
        let newPlatform = this.add.rectangle(300, 400, 150, 20, 0xFFFFFF).setDepth(0).setInteractive();
        this.physics.add.existing(newPlatform, true);
        platforms.add(newPlatform);
        newPlatform.name = 'platform_raised';
        newPlatform.initialScale = 1;
        newPlatform.initialGravityY = 0;
        hackableObjects.push(newPlatform);
        this.physics.add.collider(hero, newPlatform); // Ensure hero can collide with it
        patchMessage = getDevMessage('patchNewPlatform');
    } else if (patchCount === 2) {
        // After second patch, add an anti-gravity zone (represented by another platform)
        let antiGravityPlatform = this.add.rectangle(550, 300, 100, 20, 0x00FFFF).setDepth(0).setInteractive(); // Cyan color
        this.physics.add.existing(antiGravityPlatform, true);
        platforms.add(antiGravityPlatform);
        antiGravityPlatform.name = 'anti_gravity_platform';
        antiGravityPlatform.initialScale = 1;
        antiGravityPlatform.initialGravityY = -300; // This platform will apply anti-gravity
        hackableObjects.push(antiGravityPlatform);
        this.physics.add.collider(hero, antiGravityPlatform);
        patchMessage = getDevMessage('patchAntiGravity');
    } else if (patchCount >= 3) {
        // Further patches could introduce more complex changes or "locked" variables
        patchMessage = getDevMessage('patchApplied'); // Generic patch message for now
    } else {
         patchMessage = getDevMessage('patchApplied'); // Default for first patch (if not specific)
    }

    // Reset hero position
    hero.x = 100;
    hero.y = 450;
    hero.body.setVelocity(0); // Stop any lingering velocity

    devText.setText(patchMessage);
    patchTimeRemaining = 60; // Reset timer
}

function triggerEnding(win = true) {
    gameEnded = true;
    this.physics.pause();
    this.time.removeAllEvents(); // Stop all timers
    this.input.enabled = false; // Disable all input
    corruptionMenu.setVisible(false); // Hide corruption menu
    liveCodingFxActive = false; // Stop live coding effect

    if (win) {
        devText.setText(getDevMessage('uninstallPrompt'));
        uninstallButton.setVisible(true);
        this.input.enabled = true; // Re-enable input for the uninstall button
        glitchCursor.setVisible(false); // Hide the glitch cursor, as it's not needed for the button.
    } else {
        // Lose condition - e.g., timer ran out without enough frustration
        devText.setText(getDevMessage('gameOver'));
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
    // Apply anti-gravity if hero is on the anti-gravity platform
    platforms.children.each(platform => {
        if (platform.name === 'anti_gravity_platform' && this.physics.overlap(hero, platform)) {
            hero.body.setGravityY(platform.initialGravityY); // Apply anti-gravity
        } else if (platform.name !== 'anti_gravity_platform' && this.physics.overlap(hero, platform)) {
             hero.body.setGravityY(initialHeroGravityY); // Revert to normal gravity if on a normal platform
        }
    });


    // Check for "Broken" state (Out of Bounds)
    if (hero.y > config.height || hero.x < 0 || hero.x > config.width) {
        frustration += 0.05; // Small, continuous frustration increase
        frustration = Math.min(100, frustration);
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
    } else if (frustration > 0 && frustration < 100) { // Only update if not ended
        // The devText is primarily updated by onPatchTimerTick or specific events
        // No general update here to prevent overwriting
    }
}
