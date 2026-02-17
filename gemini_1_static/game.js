class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Nothing to preload yet
    }

    create() {
        // Create platforms
        const platforms = this.physics.add.staticGroup();
        const platformGraphics = this.make.graphics({ fillStyle: { color: 0x666666 } });
        platformGraphics.fillRect(0, 0, 1, 1); // We'll use scaling to create platforms
        platformGraphics.generateTexture('platform-pixel', 1, 1);
        platformGraphics.destroy();

        const levelLayout = [
            // Ground
            { x: 400, y: 580, width: 800, height: 40 },
            // P1's path
            { x: 100, y: 450, width: 200, height: 20 },
            { x: 300, y: 350, width: 150, height: 20 },
            // P2's path
            { x: 700, y: 450, width: 200, height: 20 },
            { x: 500, y: 350, width: 150, height: 20 },
            // Middle path to goal
            { x: 400, y: 250, width: 120, height: 20 },
        ];

        levelLayout.forEach(p => {
            platforms.create(p.x, p.y, 'platform-pixel').setScale(p.width, p.height).refreshBody();
        });

        // Create players
        this.p1 = this.physics.add.sprite(100, 500, 'p1');
        this.p1.setCollideWorldBounds(true).setDragX(1000).setMaxVelocity(300, 550);

        this.p2 = this.physics.add.sprite(700, 500, 'p2');
        this.p2.setCollideWorldBounds(true).setDragX(1000).setMaxVelocity(300, 550);
        
        // Player textures
        const p1Graphics = this.make.graphics({ fillStyle: { color: 0xffffff } });
        p1Graphics.fillRect(0, 0, 20, 40);
        p1Graphics.generateTexture('p1', 20, 40);
        p1Graphics.destroy();
        this.p1.setTexture('p1');


        const p2Graphics = this.make.graphics({ fillStyle: { color: 0xadd8e6 } });
        p2Graphics.fillRect(0, 0, 20, 40);
        p2Graphics.generateTexture('p2', 20, 40);
        p2Graphics.destroy();
        this.p2.setTexture('p2');


        // Physics colliders
        this.physics.add.collider(this.p1, platforms);
        this.physics.add.collider(this.p2, platforms);
        
        // Tether graphics
        this.tetherGraphics = this.add.graphics();
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        
        this.signalHealth = 100;
        this.sineWaveTime = 0;

        // Goal
        const goalGraphics = this.make.graphics({ fillStyle: { color: 0x00ff00 } });
        goalGraphics.fillRect(0, 0, 60, 60);
        goalGraphics.generateTexture('goal', 60, 60);
        goalGraphics.destroy();
        this.goal = this.physics.add.sprite(400, 100, 'goal');
        this.goal.body.allowGravity = false;
        
        // UI Text
        this.add.text(10, 10, 'The Static Between Us', { fontSize: '24px', fill: '#fff' });
        this.add.text(10, 40, 'Left Figure: WASD  |  Right Figure: Arrows', { fontSize: '16px', fill: '#fff' });
        this.add.text(10, 60, 'Guide them both to the green goal together.', { fontSize: '16px', fill: '#fff' });
        this.distanceText = this.add.text(10, 90, 'Distance: 0', { fontSize: '16px', fill: '#fff' });
        this.healthText = this.add.text(10, 110, 'Signal Health: 100', { fontSize: '16px', fill: '#fff' });

        // Add temporary control labels over players
        const labelStyle = { fontSize: '20px', fill: '#777', fontStyle: 'bold' };
        const wasdLabel = this.add.text(this.p1.x, this.p1.y - 50, 'WASD', labelStyle).setOrigin(0.5);
        const arrowsLabel = this.add.text(this.p2.x, this.p2.y - 50, '⇦⇧⇨', labelStyle).setOrigin(0.5);

        this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.tweens.add({
                    targets: [wasdLabel, arrowsLabel],
                    alpha: 0,
                    duration: 1000,
                    ease: 'Power1'
                });
            },
            callbackScope: this
        });

        // End text
        this.endText = this.add.text(400, 300, "I'm here.", { fontSize: '48px', fill: '#0a0a1a' });
        this.endText.setOrigin(0.5);
        this.endText.setVisible(false);
        this.gameWon = false;
    }

    update(time, delta) {
        if (this.gameWon) return; 

        this.sineWaveTime += 0.1;

        const acceleration = 1200;
        
        // P1 Movement (WASD)
        if (this.keys.A.isDown) {
            this.p1.setAccelerationX(-acceleration);
        } else if (this.keys.D.isDown) {
            this.p1.setAccelerationX(acceleration);
        } else {
            this.p1.setAccelerationX(0);
        }
        if (this.keys.W.isDown && this.p1.body.touching.down) {
            this.p1.setVelocityY(-550);
        }

        // P2 Movement (Arrows)
        if (this.cursors.left.isDown) {
            this.p2.setAccelerationX(-acceleration);
        } else if (this.cursors.right.isDown) {
            this.p2.setAccelerationX(acceleration);
        } else {
            this.p2.setAccelerationX(0);
        }
        if (this.cursors.up.isDown && this.p2.body.touching.down) {
            this.p2.setVelocityY(-550);
        }
        
        const distance = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        this.drawSineWave(this.p1, this.p2, distance);
        this.checkDistance(distance, delta);

        // Update UI text
        this.distanceText.setText('Distance: ' + Math.floor(distance));
        this.healthText.setText('Signal Health: ' + Math.floor(this.signalHealth));
        
        // Check for win condition
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.p1.getBounds(), this.goal.getBounds()) &&
            Phaser.Geom.Intersects.RectangleToRectangle(this.p2.getBounds(), this.goal.getBounds())) {
            this.winSequence();
        }
    }

    drawSineWave(p1, p2, distance) {
        let color = 0x00ffff; // Cyan - Healthy
        let thickness = 2;
        if (this.signalHealth <= 50) {
            color = 0xff0000; // Red - Critical
            thickness = 4;
        } else if (this.signalHealth <= 80) {
            color = 0xffff00; // Yellow - Warning
            thickness = 3;
        }

        this.tetherGraphics.clear();
        this.tetherGraphics.lineStyle(thickness, color, 1);
        
        this.tetherGraphics.beginPath();

        for (let i = 0; i <= 1; i += 0.05) {
            let x = Phaser.Math.Linear(p1.x, p2.x, i);
            let y = Phaser.Math.Linear(p1.y, p2.y, i);
            
            let perpendicularAngle = Phaser.Math.Angle.Between(p1.x, p1.y, p2.x, p2.y) + Math.PI / 2;
            
            let waveHeight = (this.signalHealth < 80) ? (distance / 20) : (distance / 40);
            let offset = Math.sin(this.sineWaveTime + i * 10) * waveHeight;

            x += Math.cos(perpendicularAngle) * offset;
            y += Math.sin(perpendicularAngle) * offset;
            
            if (i === 0) {
                this.tetherGraphics.moveTo(x, y);
            } else {
                this.tetherGraphics.lineTo(x, y);
            }
        }
        
        this.tetherGraphics.strokePath();
    }
    
    checkDistance(distance, delta) {
        const farThreshold = 500;
        const nearThreshold = 60;
        const sweetSpotLower = 200;
        const sweetSpotUpper = 300;
        
        const deltaSeconds = delta / 1000;

        // Reset effects
        this.cameras.main.clearTint();

        if (distance > farThreshold) {
            this.cameras.main.setTint(0x888888); // Grey tint
            this.signalHealth -= 25 * deltaSeconds; // ~4 seconds to drain from 100
        } else if (distance < nearThreshold) {
            this.cameras.main.flash(100, 255, 0, 0); // Red flash
            this.signalHealth -= 20 * deltaSeconds; // ~5 seconds to drain from 100
        } else if (distance >= sweetSpotLower && distance <= sweetSpotUpper) {
            // In the sweet spot, regenerate health
            this.signalHealth += 10 * deltaSeconds;
        }

        // Clamp health
        this.signalHealth = Phaser.Math.Clamp(this.signalHealth, 0, 100);

        // Lose condition
        if (this.signalHealth <= 0) {
            this.restartLevel();
        }
    }
    
    restartLevel() {
        this.scene.restart();
    }

    winSequence() {
        if (this.gameWon) return;
        this.gameWon = true;
        this.physics.pause();
        this.tetherGraphics.clear();

        this.tweens.add({
            targets: [this.p1, this.p2],
            x: this.goal.x,
            y: this.goal.y,
            ease: 'Power1',
            duration: 1000,
        });

        this.cameras.main.fadeOut(2000, 255, 255, 255, (camera, progress) => {
            if (progress === 1) {
                this.endText.setVisible(true);
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0a0a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: [GameScene]
};

const game = new Phaser.Game(config);

