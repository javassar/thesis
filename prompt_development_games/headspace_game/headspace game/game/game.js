// Headspace - A game about emotional intelligence
// "Every feeling is trying to help. Not every feeling is right."

// Color palettes for each emotion
const EMOTION_COLORS = {
    fear: {
        primary: 0x4a6fa5,
        secondary: 0x2d3a4f,
        background: 0x1a1a2e,
        accent: 0x6b8cae
    },
    joy: {
        primary: 0xffd700,
        secondary: 0xffa500,
        background: 0x3d2e1f,
        accent: 0xffeb99
    },
    anger: {
        primary: 0xdc143c,
        secondary: 0x8b0000,
        background: 0x2a1a1a,
        accent: 0xff6b6b
    },
    calm: {
        primary: 0x5f9ea0,
        secondary: 0x3d7a7c,
        background: 0x1a2a2a,
        accent: 0x8fcfd1
    }
};

// ============================================================================
// BOOT SCENE
// ============================================================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x5f9ea0, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        // We'll generate graphics programmatically instead of loading external assets
    }

    create() {
        // Create animations and proceed to menu
        this.scene.start('MenuScene');
    }
}

// ============================================================================
// MENU SCENE
// ============================================================================
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        // Title with emotion colors cycling through
        const title = this.add.text(width / 2, height / 3, 'HEADSPACE', {
            fontSize: '64px',
            fontFamily: 'Georgia, serif',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Tagline
        const tagline = this.add.text(width / 2, height / 3 + 60,
            '"Every feeling is trying to help. Not every feeling is right."', {
            fontSize: '18px',
            fontFamily: 'Georgia, serif',
            fill: '#888888',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Emotion color indicators
        const emotions = ['fear', 'joy', 'anger', 'calm'];
        const emotionColors = [0x4a6fa5, 0xffd700, 0xdc143c, 0x5f9ea0];

        for (let i = 0; i < 4; i++) {
            const circle = this.add.circle(
                width / 2 - 90 + i * 60,
                height / 2 + 20,
                15,
                emotionColors[i]
            );

            // Pulse animation
            this.tweens.add({
                targets: circle,
                scale: 1.2,
                duration: 1000 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Start instruction
        const startText = this.add.text(width / 2, height * 0.7,
            'Press SPACE or click to begin', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Blink animation
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Controls hint
        this.add.text(width / 2, height * 0.85,
            'Controls: Arrow keys or WASD to move | 1-4 to switch emotions', {
            fontSize: '14px',
            fill: '#666666'
        }).setOrigin(0.5);

        // Input handling
        this.input.keyboard.once('keydown-SPACE', () => {
            this.startGame();
        });

        this.input.once('pointerdown', () => {
            this.startGame();
        });
    }

    startGame() {
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('ScenarioOneScene');
        });
    }
}

// ============================================================================
// BASE SCENARIO SCENE
// ============================================================================
class BaseScenarioScene extends Phaser.Scene {
    constructor(key) {
        super({ key });
        this.currentEmotion = 'calm';
        this.emotionTransitioning = false;
        this.switchCooldown = 0;
        this.emotionsUsedThisScene = new Set();
    }

    createHost(x, y) {
        // Create host character as a simple humanoid shape
        this.host = this.add.container(x, y);

        // Body
        const body = this.add.rectangle(0, 0, 32, 48, 0xffffff);
        // Head
        const head = this.add.circle(0, -32, 12, 0xffffff);

        this.host.add([body, head]);

        // Add physics
        this.physics.world.enable(this.host);
        this.host.body.setSize(32, 64);
        this.host.body.setOffset(-16, -40);
        this.host.body.setCollideWorldBounds(true);

        return this.host;
    }

    createEmotionUI() {
        const emotions = ['fear', 'joy', 'anger', 'calm'];
        const colors = [0x4a6fa5, 0xffd700, 0xdc143c, 0x5f9ea0];
        const labels = ['1', '2', '3', '4'];

        this.emotionPortraits = {};

        for (let i = 0; i < 4; i++) {
            const x = 80 + i * 70;
            const y = 50;

            // Portrait background
            const bg = this.add.circle(x, y, 25, colors[i], 0.3);
            bg.setScrollFactor(0);
            bg.setStrokeStyle(3, colors[i]);

            // Label
            const label = this.add.text(x, y + 35, `[${labels[i]}]`, {
                fontSize: '12px',
                fill: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0);

            // Emotion name
            const name = this.add.text(x, y, emotions[i].charAt(0).toUpperCase(), {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Georgia, serif'
            }).setOrigin(0.5).setScrollFactor(0);

            this.emotionPortraits[emotions[i]] = { bg, label, name };

            // Make clickable
            bg.setInteractive();
            bg.on('pointerdown', () => this.switchEmotion(emotions[i]));
        }

        this.updateEmotionUI();
    }

    updateEmotionUI() {
        const emotions = ['fear', 'joy', 'anger', 'calm'];
        for (const emotion of emotions) {
            const portrait = this.emotionPortraits[emotion];
            if (emotion === this.currentEmotion) {
                portrait.bg.setAlpha(1);
                portrait.name.setAlpha(1);
            } else {
                portrait.bg.setAlpha(0.4);
                portrait.name.setAlpha(0.5);
            }
        }
    }

    setupEmotionInput() {
        this.input.keyboard.on('keydown-ONE', () => this.switchEmotion('fear'));
        this.input.keyboard.on('keydown-TWO', () => this.switchEmotion('joy'));
        this.input.keyboard.on('keydown-THREE', () => this.switchEmotion('anger'));
        this.input.keyboard.on('keydown-FOUR', () => this.switchEmotion('calm'));
    }

    switchEmotion(newEmotion) {
        if (this.emotionTransitioning) return;
        if (this.switchCooldown > 0) return;
        if (newEmotion === this.currentEmotion) return;

        // Check if host is grounded (if physics exists)
        if (this.host && this.host.body && !this.host.body.blocked.down && !this.host.body.touching.down) {
            // Allow switching even in air for better gameplay
        }

        this.emotionTransitioning = true;
        this.switchCooldown = 200;

        const oldEmotion = this.currentEmotion;
        this.currentEmotion = newEmotion;
        this.emotionsUsedThisScene.add(newEmotion);

        // Visual transition
        this.transitionVisuals(oldEmotion, newEmotion);

        // Camera effects
        this.applyCameraEffects(newEmotion);

        // Update UI
        this.updateEmotionUI();

        // Allow transitioning again after delay
        this.time.delayedCall(400, () => {
            this.emotionTransitioning = false;
        });
    }

    transitionVisuals(oldEmotion, newEmotion) {
        const colors = EMOTION_COLORS[newEmotion];

        // Fade background color
        this.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 400,
            onUpdate: (tween) => {
                const value = tween.getValue() / 100;
                this.cameras.main.setBackgroundColor(
                    Phaser.Display.Color.Interpolate.ColorWithColor(
                        Phaser.Display.Color.IntegerToColor(EMOTION_COLORS[oldEmotion].background),
                        Phaser.Display.Color.IntegerToColor(colors.background),
                        100,
                        value * 100
                    )
                );
            }
        });

        // Update environment colors if method exists
        if (this.updateEnvironmentColors) {
            this.updateEnvironmentColors(newEmotion);
        }
    }

    applyCameraEffects(emotion) {
        switch (emotion) {
            case 'fear':
                this.cameras.main.zoomTo(1.1, 400);
                break;
            case 'joy':
                this.cameras.main.zoomTo(0.95, 400);
                break;
            case 'anger':
                this.cameras.main.shake(200, 0.005);
                this.cameras.main.zoomTo(1.0, 400);
                break;
            case 'calm':
                this.cameras.main.zoomTo(0.95, 400);
                break;
        }
    }

    updateHostMovement() {
        if (!this.host || !this.host.body) return;

        const cursors = this.input.keyboard.createCursorKeys();
        const wasd = this.input.keyboard.addKeys('W,A,S,D');

        const speed = 140;

        // Horizontal movement
        if (cursors.left.isDown || wasd.A.isDown) {
            this.host.body.setVelocityX(-speed);
            this.host.scaleX = -1;
        } else if (cursors.right.isDown || wasd.D.isDown) {
            this.host.body.setVelocityX(speed);
            this.host.scaleX = 1;
        } else {
            this.host.body.setVelocityX(0);
        }

        // Jumping
        if ((cursors.up.isDown || wasd.W.isDown || cursors.space.isDown) &&
            (this.host.body.blocked.down || this.host.body.touching.down)) {
            this.host.body.setVelocityY(-500);
        }
    }

    showText(text, duration = 3000, y = 650) {
        const textObj = this.add.text(640, y, text, {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.tweens.add({
            targets: textObj,
            alpha: 0,
            duration: 500,
            delay: duration - 500,
            onComplete: () => textObj.destroy()
        });

        return textObj;
    }

    update(time, delta) {
        // Update cooldown
        this.switchCooldown = Math.max(0, this.switchCooldown - delta);

        // Update host movement
        this.updateHostMovement();
    }
}

// ============================================================================
// SCENARIO ONE: THE CONVERSATION
// ============================================================================
class ScenarioOneScene extends BaseScenarioScene {
    constructor() {
        super('ScenarioOneScene');
    }

    create() {
        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(EMOTION_COLORS[this.currentEmotion].background);

        // Create level
        this.createLevel();

        // Create host
        this.createHost(150, 500);

        // Create Alex (partner)
        this.createAlex();

        // Create obstacles
        this.createObstacles();

        // Setup emotion system
        this.createEmotionUI();
        this.setupEmotionInput();

        // Setup physics collisions
        this.physics.add.collider(this.host, this.platforms);

        // Camera follow
        this.cameras.main.startFollow(this.host, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 2800, 720);
        this.physics.world.setBounds(0, 0, 2800, 720);

        // Tutorial text
        this.showText('Alex wants to move away for a job.', 3000);
        this.time.delayedCall(3500, () => {
            this.showText('Reach them to respond. Press 1-4 to switch feelings.', 4000);
        });

        // Track state
        this.reachedAlex = false;
        this.usedJoyBridge = false;
        this.brokeBarrier = false;
        this.hitTrap = false;
    }

    createLevel() {
        // Create platforms group
        this.platforms = this.physics.add.staticGroup();

        // Ground - with gap in middle
        this.createPlatform(0, 680, 1000, 40);      // Left ground
        this.createPlatform(1400, 680, 1400, 40);   // Right ground

        // Some stepping platforms
        this.createPlatform(900, 550, 150, 20);
        this.createPlatform(1100, 450, 150, 20);
        this.createPlatform(1300, 550, 150, 20);

        // Background elements
        this.createCafeBackground();
    }

    createPlatform(x, y, width, height) {
        const platform = this.add.rectangle(x + width/2, y + height/2, width, height,
            EMOTION_COLORS[this.currentEmotion].primary, 0.8);
        this.platforms.add(platform);
        platform.body.updateFromGameObject();
        return platform;
    }

    createCafeBackground() {
        // Cafe table (decorative)
        this.add.rectangle(500, 620, 120, 60, 0x8B4513).setDepth(-1);
        this.add.rectangle(500, 580, 100, 10, 0x654321).setDepth(-1);

        // Window
        this.add.rectangle(300, 400, 150, 200, 0x87CEEB, 0.3).setDepth(-2);
        this.add.rectangle(300, 400, 150, 200).setStrokeStyle(4, 0x444444).setDepth(-1);

        // More tables
        this.add.rectangle(2200, 620, 120, 60, 0x8B4513).setDepth(-1);
    }

    createAlex() {
        // Alex character at the far right
        this.alex = this.add.container(2400, 580);

        const alexBody = this.add.rectangle(0, 0, 32, 48, 0xcccccc);
        const alexHead = this.add.circle(0, -32, 12, 0xcccccc);

        this.alex.add([alexBody, alexHead]);

        // Alex's speech bubble
        this.alexBubble = this.add.text(2400, 480, '"I think I should take it."', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
    }

    createObstacles() {
        // The chasm/gap (appears different per emotion)
        this.gapX = 1000;
        this.gapWidth = 400;

        // Trap (only visible in Fear)
        this.trap = this.add.rectangle(1200, 640, 60, 20, 0xff0000, 0);
        this.physics.add.existing(this.trap, true);
        this.trapWarning = this.add.text(1200, 600, '!', {
            fontSize: '24px',
            fill: '#ff0000'
        }).setOrigin(0.5).setAlpha(0);

        // Barrier around Alex (only in Anger)
        this.barrier = this.add.rectangle(2200, 580, 20, 120, 0xff4444, 0);
        this.physics.add.existing(this.barrier, true);

        // Joy bridge (created when needed)
        this.joyBridge = null;

        // Collision detection for trap
        this.physics.add.overlap(this.host, this.trap, () => this.onHitTrap(), null, this);
    }

    updateEnvironmentColors(emotion) {
        const colors = EMOTION_COLORS[emotion];

        // Update platforms color
        this.platforms.getChildren().forEach(platform => {
            platform.setFillStyle(colors.primary, 0.8);
        });

        // Update Alex appearance based on emotion
        this.updateAlexAppearance(emotion);

        // Update trap visibility (only visible in Fear)
        this.trap.setAlpha(emotion === 'fear' ? 0.8 : 0);
        this.trapWarning.setAlpha(emotion === 'fear' ? 1 : 0);

        // Update barrier visibility (only visible and solid in Anger)
        this.barrier.setAlpha(emotion === 'anger' ? 0.8 : 0);
        this.barrier.body.enable = (emotion === 'anger');

        // Show/hide joy bridge
        if (this.joyBridge) {
            this.joyBridge.setVisible(emotion === 'joy');
            if (this.joyBridge.body) {
                this.joyBridge.body.enable = (emotion === 'joy');
            }
        }
    }

    updateAlexAppearance(emotion) {
        const colors = {
            fear: 0x666688,    // Cold, distant
            joy: 0xffddaa,     // Warm, loving
            anger: 0x886666,   // Dismissive
            calm: 0xaaaaaa     // Neutral
        };

        const alexParts = this.alex.list;
        alexParts.forEach(part => {
            if (part.setFillStyle) {
                part.setFillStyle(colors[emotion]);
            }
        });

        // Update Alex's speech based on emotion
        const speeches = {
            fear: '"I\'ve already decided..."',
            joy: '"We\'ll figure this out together."',
            anger: '"You never support me."',
            calm: '"I wanted to talk about this."'
        };
        this.alexBubble.setText(speeches[emotion]);
    }

    onHitTrap() {
        if (this.hitTrap || this.currentEmotion === 'fear') return;

        this.hitTrap = true;
        this.host.body.setVelocityX(-200);
        this.showText("You didn't see that coming...", 2000);

        // Reset after a moment
        this.time.delayedCall(1000, () => {
            this.hitTrap = false;
        });
    }

    update(time, delta) {
        super.update(time, delta);

        // Joy ability: create bridge when near gap and pressing space
        if (this.currentEmotion === 'joy' && !this.joyBridge) {
            const hostX = this.host.x;
            if (hostX > this.gapX - 100 && hostX < this.gapX + this.gapWidth + 100) {
                if (this.input.keyboard.addKey('SPACE').isDown ||
                    this.input.keyboard.addKey('W').isDown) {
                    this.createJoyBridge();
                }
            }
        }

        // Anger ability: break barrier
        if (this.currentEmotion === 'anger' && this.barrier && this.barrier.alpha > 0) {
            const dist = Phaser.Math.Distance.Between(
                this.host.x, this.host.y,
                this.barrier.x, this.barrier.y
            );
            if (dist < 60 && Math.abs(this.host.body.velocity.x) > 50) {
                this.breakBarrier();
            }
        }

        // Check if reached Alex
        if (!this.reachedAlex) {
            const distToAlex = Phaser.Math.Distance.Between(
                this.host.x, this.host.y,
                this.alex.x, this.alex.y
            );
            if (distToAlex < 100) {
                this.reachAlex();
            }
        }
    }

    createJoyBridge() {
        this.joyBridge = this.add.rectangle(
            this.gapX + this.gapWidth / 2,
            660,
            this.gapWidth + 100,
            20,
            0xffd700,
            0.8
        );
        this.physics.add.existing(this.joyBridge, true);
        this.physics.add.collider(this.host, this.joyBridge);

        this.usedJoyBridge = true;
        this.showText('Joy creates a bridge of hope.', 2000);

        // Bridge fades after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.joyBridge) {
                this.tweens.add({
                    targets: this.joyBridge,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        if (this.joyBridge) {
                            this.joyBridge.destroy();
                            this.joyBridge = null;
                        }
                    }
                });
            }
        });
    }

    breakBarrier() {
        this.brokeBarrier = true;

        this.cameras.main.shake(200, 0.01);
        this.showText('You forced your way through. But at what cost?', 2500);

        this.tweens.add({
            targets: this.barrier,
            alpha: 0,
            scaleX: 1.5,
            duration: 300,
            onComplete: () => {
                this.barrier.destroy();
                this.barrier = null;
            }
        });
    }

    reachAlex() {
        this.reachedAlex = true;
        this.host.body.setVelocity(0);

        // Determine ending based on journey
        let endingType = 'balanced';
        let endingText = '';

        if (this.currentEmotion === 'joy' && !this.emotionsUsedThisScene.has('fear')) {
            endingType = 'naive_optimism';
            endingText = 'You reached Alex with hope. But did you hear what they were really saying?';
        } else if (this.brokeBarrier) {
            endingType = 'forced_anger';
            endingText = 'You broke through. The conversation happened. Trust didn\'t survive it.';
        } else if (this.emotionsUsedThisScene.size >= 2) {
            endingType = 'balanced';
            endingText = 'You arrived scared, hopeful, and present. The conversation was hard. And real.';
        } else {
            endingType = 'distant';
            endingText = 'You found a way across. But you kept your distance.';
        }

        this.showText(endingText, 5000, 400);

        // Teaching moment
        this.time.delayedCall(5500, () => {
            this.showText('Joy could reach them. But would Joy see the truth?', 3500, 400);
        });

        // Transition to next scene
        this.time.delayedCall(10000, () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('ScenarioTwoScene');
            });
        });
    }
}

// ============================================================================
// SCENARIO TWO: THE INTERVIEW
// ============================================================================
class ScenarioTwoScene extends BaseScenarioScene {
    constructor() {
        super('ScenarioTwoScene');
    }

    create() {
        this.currentEmotion = 'calm';
        this.emotionsUsedThisScene = new Set();

        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(EMOTION_COLORS[this.currentEmotion].background);

        // Create level
        this.createLevel();

        // Create host (on ground level)
        this.createHost(150, 620);

        // Create interviewer
        this.createInterviewer();

        // Create memories
        this.createMemories();

        // Setup emotion system
        this.createEmotionUI();
        this.setupEmotionInput();

        // Setup physics
        this.physics.add.collider(this.host, this.platforms);

        // Camera
        this.cameras.main.startFollow(this.host, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 2400, 720);
        this.physics.world.setBounds(0, 0, 2400, 720);

        // Setup text
        this.showText('"Tell me about a time you failed."', 3000);
        this.time.delayedCall(3500, () => {
            this.showText('Find a memory and carry it to the interviewer.', 3500);
        });

        // State
        this.heldMemory = null;
        this.memoryJourney = [];
        this.deliveredMemory = false;
    }

    createLevel() {
        this.platforms = this.physics.add.staticGroup();

        // Office floor
        this.createPlatform(0, 680, 2400, 40);

        // Floating platforms (memory shelves) - stepped design for easier access
        // First tier - easy to reach from ground
        this.createPlatform(300, 580, 180, 20);
        this.createPlatform(700, 580, 180, 20);
        this.createPlatform(1100, 580, 180, 20);

        // Second tier - reachable from first tier
        this.createPlatform(500, 480, 180, 20);
        this.createPlatform(900, 480, 180, 20);

        // Third tier - reachable from second tier
        this.createPlatform(700, 380, 180, 20);

        // Office background
        this.createOfficeBackground();
    }

    createPlatform(x, y, width, height) {
        const platform = this.add.rectangle(x + width/2, y + height/2, width, height,
            EMOTION_COLORS[this.currentEmotion].primary, 0.8);
        this.platforms.add(platform);
        platform.body.updateFromGameObject();
        return platform;
    }

    createOfficeBackground() {
        // Desk
        this.add.rectangle(2100, 620, 200, 60, 0x5c4033).setDepth(-1);

        // Window
        this.add.rectangle(100, 350, 120, 180, 0x87CEEB, 0.3).setDepth(-2);
        this.add.rectangle(100, 350, 120, 180).setStrokeStyle(3, 0x444444).setDepth(-1);

        // Bookshelf
        this.add.rectangle(300, 400, 80, 200, 0x654321).setDepth(-2);
    }

    createInterviewer() {
        this.interviewer = this.add.container(2100, 580);

        const body = this.add.rectangle(0, 0, 36, 52, 0x333366);
        const head = this.add.circle(0, -34, 14, 0xddccbb);

        this.interviewer.add([body, head]);

        this.interviewerBubble = this.add.text(2100, 480, '"I\'m waiting..."', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
    }

    createMemories() {
        this.memories = [];

        // Memory positions adjusted to be on/near platforms
        const memoryData = [
            { x: 390, y: 540, type: 'project', label: 'Failed Project' },       // On first tier left
            { x: 590, y: 440, type: 'risk', label: 'Risk Not Taken' },          // On second tier left
            { x: 790, y: 340, type: 'relationship', label: 'Lost Connection' }  // On third tier
        ];

        memoryData.forEach((data, i) => {
            const memory = this.add.container(data.x, data.y);

            // Orb
            const orb = this.add.circle(0, 0, 20, 0xffffff, 0.8);
            orb.setStrokeStyle(3, 0xaaaaaa);

            // Label (small)
            const label = this.add.text(0, 30, data.type, {
                fontSize: '10px',
                fill: '#aaaaaa'
            }).setOrigin(0.5);

            memory.add([orb, label]);
            memory.memoryType = data.type;
            memory.orb = orb;

            // Floating animation
            this.tweens.add({
                targets: memory,
                y: data.y - 10,
                duration: 1500 + i * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.memories.push(memory);
        });
    }

    updateEnvironmentColors(emotion) {
        const colors = EMOTION_COLORS[emotion];

        this.platforms.getChildren().forEach(platform => {
            platform.setFillStyle(colors.primary, 0.8);
        });

        // Update memory colors
        this.memories.forEach(memory => {
            memory.orb.setFillStyle(colors.accent, 0.8);
            memory.orb.setStrokeStyle(3, colors.primary);
        });

        // Update held memory if exists
        if (this.heldMemory) {
            this.heldMemory.orb.setFillStyle(colors.accent, 0.9);
        }
    }

    update(time, delta) {
        super.update(time, delta);

        // Check memory pickup
        if (!this.heldMemory) {
            this.memories.forEach((memory, index) => {
                const dist = Phaser.Math.Distance.Between(
                    this.host.x, this.host.y,
                    memory.x, memory.y
                );
                if (dist < 50) {
                    this.pickupMemory(memory, index);
                }
            });
        }

        // Update held memory position
        if (this.heldMemory) {
            this.heldMemory.x = this.host.x;
            this.heldMemory.y = this.host.y - 60;

            // Track emotion changes
            if (this.memoryJourney[this.memoryJourney.length - 1] !== this.currentEmotion) {
                this.memoryJourney.push(this.currentEmotion);
            }

            // Slow down host while carrying
            this.host.body.velocity.x *= 0.9;
        }

        // Check delivery
        if (this.heldMemory && !this.deliveredMemory) {
            const distToInterviewer = Phaser.Math.Distance.Between(
                this.host.x, this.host.y,
                this.interviewer.x, this.interviewer.y
            );
            if (distToInterviewer < 100) {
                this.deliverMemory();
            }
        }
    }

    pickupMemory(memory, index) {
        this.heldMemory = memory;
        this.memoryJourney = [this.currentEmotion];
        this.memories.splice(index, 1);

        this.showText('Carry this memory to the interviewer.', 2500);
        this.showText('Switch emotions to transform how you present it.', 3000, 680);
    }

    deliverMemory() {
        this.deliveredMemory = true;
        this.host.body.setVelocity(0);

        // Evaluate quality
        const quality = this.evaluateMemoryQuality();

        const outcomes = {
            excellent: 'The memory lands perfectly. Honest, reflective, hopeful.\nThe interviewer nods with genuine interest.',
            good: 'The interviewer nods thoughtfully. A real answer.\nYou showed growth.',
            awkward: 'The interviewer shifts uncomfortably. Too raw.\nBut perhaps... authentic.',
            fake: 'The interviewer\'s smile tightens. They don\'t buy it.\nToo polished, not real.'
        };

        this.interviewerBubble.setText('"Thank you for sharing that."');
        this.showText(outcomes[quality], 5000, 400);

        // Teaching moment
        this.time.delayedCall(5500, () => {
            this.showText('"The memory was the same. The feeling made it different."', 4000, 400);
        });

        // Transition
        this.time.delayedCall(10000, () => {
            this.cameras.main.fade(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.scene.start('ScenarioThreeScene');
            });
        });
    }

    evaluateMemoryQuality() {
        const journey = this.memoryJourney;

        // Best: fear (honesty) -> joy (growth) -> calm (composure)
        if (journey.includes('fear') && journey.includes('joy') &&
            journey[journey.length - 1] === 'calm') {
            return 'excellent';
        }

        // Good: multiple emotions, not ending in anger
        if (journey.length >= 2 && journey[journey.length - 1] !== 'anger') {
            return 'good';
        }

        // Awkward: pure fear
        if (journey.length === 1 && journey[0] === 'fear') {
            return 'awkward';
        }

        // Fake: pure joy
        if (journey.length === 1 && journey[0] === 'joy') {
            return 'fake';
        }

        return 'good';
    }
}

// ============================================================================
// SCENARIO THREE: THE GOODBYE
// ============================================================================
class ScenarioThreeScene extends BaseScenarioScene {
    constructor() {
        super('ScenarioThreeScene');
    }

    create() {
        this.currentEmotion = 'calm';
        this.emotionsUsedThisScene = new Set();

        this.cameras.main.fadeIn(1000);
        this.cameras.main.setBackgroundColor(EMOTION_COLORS[this.currentEmotion].background);

        // Create level (simpler, more abstract)
        this.createLevel();

        // Create host
        this.createHost(200, 500);

        // Create grandmother
        this.createGrandmother();

        // Setup emotion system
        this.createEmotionUI();
        this.setupEmotionInput();

        // Physics
        this.physics.add.collider(this.host, this.platforms);

        // Camera
        this.cameras.main.startFollow(this.host, true, 0.05, 0.05);
        this.cameras.main.setBounds(0, 0, 1600, 720);
        this.physics.world.setBounds(0, 0, 1600, 720);

        // State
        this.emotionBarriers = {
            fear: 400,
            joy: 350,
            anger: 450,
            calm: 200
        };
        this.emotionsContributed = new Set();
        this.closestReached = 1000;
        this.endingTriggered = false;

        // Opening text
        this.time.delayedCall(500, () => {
            this.showText('Grandmother says: "I\'m so proud of you."', 4000);
        });
        this.time.delayedCall(5000, () => {
            this.showText('Reach her to say goodbye. Each emotion can only get so close.', 4500);
        });
    }

    createLevel() {
        this.platforms = this.physics.add.staticGroup();

        // Simple floor
        this.createPlatform(0, 680, 1600, 40);

        // Hospital room elements
        this.createHospitalBackground();
    }

    createPlatform(x, y, width, height) {
        const platform = this.add.rectangle(x + width/2, y + height/2, width, height,
            EMOTION_COLORS[this.currentEmotion].primary, 0.6);
        this.platforms.add(platform);
        platform.body.updateFromGameObject();
        return platform;
    }

    createHospitalBackground() {
        // Bed
        this.bed = this.add.rectangle(1200, 620, 200, 80, 0xeeeeee, 0.3).setDepth(-1);
        this.add.rectangle(1200, 580, 180, 40, 0xffffff, 0.2).setDepth(-1);

        // Window with light
        this.window = this.add.rectangle(1400, 400, 120, 200, 0xffffee, 0.2).setDepth(-2);

        // Monitor (subtle)
        this.add.rectangle(1350, 550, 40, 60, 0x222222, 0.3).setDepth(-1);
    }

    createGrandmother() {
        this.grandmother = this.add.container(1200, 560);

        // Lying figure (simplified)
        const body = this.add.rectangle(0, 10, 60, 30, 0xddccbb, 0.9);
        const head = this.add.circle(-35, 5, 15, 0xeeddcc);

        this.grandmother.add([body, head]);

        // Grandmother's words
        this.grandmotherText = this.add.text(1200, 480, '', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'italic',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.8);
    }

    updateEnvironmentColors(emotion) {
        const colors = EMOTION_COLORS[emotion];

        this.platforms.getChildren().forEach(platform => {
            platform.setFillStyle(colors.primary, 0.6);
        });

        // Room atmosphere changes dramatically
        switch (emotion) {
            case 'fear':
                this.window.setFillStyle(0x4466aa, 0.1);
                this.bed.setFillStyle(0xaaaacc, 0.2);
                break;
            case 'joy':
                this.window.setFillStyle(0xffffaa, 0.4);
                this.bed.setFillStyle(0xffffee, 0.3);
                break;
            case 'anger':
                this.window.setFillStyle(0xff6666, 0.2);
                this.bed.setFillStyle(0xffcccc, 0.2);
                break;
            case 'calm':
                this.window.setFillStyle(0xaaffff, 0.2);
                this.bed.setFillStyle(0xeeffff, 0.3);
                break;
        }
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.endingTriggered) return;

        // Calculate distance to grandmother
        const distance = Math.abs(this.host.x - this.grandmother.x);

        // Emotional barrier - each emotion can only get so close
        const barrier = this.emotionBarriers[this.currentEmotion];
        if (distance < barrier) {
            // Push back gently
            this.host.x = this.grandmother.x - barrier;

            // Mark this emotion as having contributed
            if (!this.emotionsContributed.has(this.currentEmotion)) {
                this.emotionsContributed.add(this.currentEmotion);
                this.showEmotionMessage();
            }
        }

        // Track closest approach
        if (distance < this.closestReached) {
            this.closestReached = distance;
        }

        // Check for victory - all emotions must contribute
        this.checkVictory();
    }

    showEmotionMessage() {
        const messages = {
            fear: "Fear whispers: 'If you get too close, you'll feel the loss.'",
            joy: "Joy pleads: 'Remember the good times! Don't focus on this.'",
            anger: "Anger shouts: 'This isn't fair! She shouldn't have to go!'",
            calm: "Calm observes: 'Be present. Just... be present.'"
        };

        // Clear previous emotion message to prevent overlap
        if (this.currentEmotionText) {
            this.currentEmotionText.destroy();
        }
        this.currentEmotionText = this.showText(messages[this.currentEmotion], 3500, 600);

        // Update grandmother's response
        const responses = {
            fear: '"It\'s okay to be scared."',
            joy: '"We had such wonderful times."',
            anger: '"I know. I know."',
            calm: '"You\'re here. That\'s enough."'
        };
        this.grandmotherText.setText(responses[this.currentEmotion]);
    }

    checkVictory() {
        // Need all four emotions
        const allUsed = this.emotionsContributed.size >= 4;

        if (allUsed && this.closestReached < 250) {
            this.triggerEnding();
        }
    }

    triggerEnding() {
        this.endingTriggered = true;
        this.host.body.setVelocity(0);

        // Clear any existing emotion message
        if (this.currentEmotionText) {
            this.currentEmotionText.destroy();
        }

        this.showText('All of your feelings are part of you.', 3000, 300);

        // Visual: blend all emotion colors
        this.time.delayedCall(3500, () => {
            // Move host to grandmother
            this.tweens.add({
                targets: this.host,
                x: this.grandmother.x - 80,
                duration: 2000,
                ease: 'Sine.easeInOut'
            });
        });

        // Fade to white
        this.time.delayedCall(6000, () => {
            this.cameras.main.fade(2000, 255, 255, 255);
        });

        this.time.delayedCall(8500, () => {
            this.showText('You hold her hand.', 3000, 360);
        });

        this.time.delayedCall(12000, () => {
            this.showText('She smiles.', 3000, 360);
        });

        this.time.delayedCall(15500, () => {
            this.cameras.main.fade(2000, 0, 0, 0);
        });

        this.time.delayedCall(18000, () => {
            this.scene.start('EndingScene');
        });
    }
}

// ============================================================================
// ENDING SCENE
// ============================================================================
class EndingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000);

        const messages = [
            { text: 'Every feeling was trying to help.', delay: 1000, duration: 3500 },
            { text: 'Fear wanted to protect you.', delay: 5000, color: '#4a6fa5', duration: 3000 },
            { text: 'Joy wanted to sustain you.', delay: 8500, color: '#ffd700', duration: 3000 },
            { text: 'Anger wanted to defend you.', delay: 12000, color: '#dc143c', duration: 3000 },
            { text: 'Calm wanted to steady you.', delay: 15500, color: '#5f9ea0', duration: 3000 },
            { text: 'None of them were wrong.', delay: 19000, duration: 4000 },
            { text: 'Thank you for being present.', delay: 24000, duration: -1 }  // -1 means don't fade
        ];

        messages.forEach((msg, index) => {
            this.time.delayedCall(msg.delay, () => {
                const text = this.add.text(640, 360, msg.text, {
                    fontSize: index === 0 || index >= 5 ? '32px' : '24px',
                    fill: msg.color || '#ffffff',
                    fontFamily: 'Georgia, serif'
                }).setOrigin(0.5).setAlpha(0);

                this.tweens.add({
                    targets: text,
                    alpha: 1,
                    duration: 1000
                });

                // Fade out after duration (unless duration is -1)
                if (msg.duration > 0) {
                    this.tweens.add({
                        targets: text,
                        alpha: 0,
                        duration: 800,
                        delay: msg.duration - 800
                    });
                }
            });
        });

        // Restart option
        this.time.delayedCall(28000, () => {
            const restart = this.add.text(640, 500, 'Press any key to begin again', {
                fontSize: '18px',
                fill: '#666666'
            }).setOrigin(0.5);

            this.tweens.add({
                targets: restart,
                alpha: 0.3,
                duration: 1000,
                yoyo: true,
                repeat: -1
            });

            this.input.keyboard.once('keydown', () => {
                this.cameras.main.fade(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('MenuScene');
                });
            });

            this.input.once('pointerdown', () => {
                this.cameras.main.fade(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('MenuScene');
                });
            });
        });
    }
}

// ============================================================================
// GAME CONFIGURATION
// ============================================================================
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, ScenarioOneScene, ScenarioTwoScene, ScenarioThreeScene, EndingScene]
};

// Create game instance
const game = new Phaser.Game(config);
