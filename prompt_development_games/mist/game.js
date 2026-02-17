// MIST - Phaser Technical Implementation (Revised for Creativity & Bug Fixes)

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0c0c2c', // Darker night sky
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let traveler;
let mist;
let brush;
let fogBrush; // A new brush for re-fogging
let stamina = 100;
let staminaText;
let instructionsText;
let winText;
let bobTween;

// Parallax background layers
let bgLayers = [];
const PARALLAX_WIDTH = 1600; // Define a width for the parallax pattern

function preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
}

function create() {
    // 1. Create a more dynamic, procedurally generated world (with loop fix)
    const layerColors = [0x1a1a3a, 0x282852, 0x36366a];
    const layerSpeeds = [0.25, 0.5, 0.75];

    for (let i = 0; i < layerColors.length; i++) {
        const layer = this.add.graphics({ fillStyle: { color: layerColors[i] } });
        // Draw the building pattern twice for seamless looping
        for (let k = 0; k < 2; k++) {
            for (let j = 0; j < 10; j++) { // Reduced count to fit in PARALLAX_WIDTH
                const x = (k * PARALLAX_WIDTH) + j * 150 + Phaser.Math.Between(-50, 50);
                const height = Phaser.Math.Between(100, 300);
                const width = Phaser.Math.Between(80, 150);
                layer.fillRect(x, 600 - height, width, height);

                // Draw "windows"
                 if (i > 0) {
                     layer.fillStyle(0xffffaa, Phaser.Math.FloatBetween(0.3, 0.7)); // Set fill style for windows
                     for(let wx = 0; wx < width / 20; wx++) {
                         for (let wy = 0; wy < height / 20; wy++) {
                             if(Math.random() > 0.4) {
                                layer.fillRect(x + 10 + wx*20, 600 - height + 10 + wy*20, 5, 8);
                             }
                         }
                     }
                }
            }
        }
        bgLayers.push({ gfx: layer, speed: layerSpeeds[i] });
    }
    
    // Ground
    const groundGfx = this.add.graphics({ fillStyle: { color: 0x080818 } });
    groundGfx.fillRect(0, 0, 800, 100);
    groundGfx.generateTexture('ground_texture', 800, 100);
    groundGfx.destroy();
    const ground = this.add.tileSprite(400, 550, 800, 100, 'ground_texture');
    bgLayers.push({ gfx: ground, speed: 1, isTileSprite: true });


    // 2. Create a more lifelike Traveler (with texture generation fix)
    const travelerGraphics = this.add.graphics();
    travelerGraphics.fillStyle(0xffffff);
    travelerGraphics.fillCircle(6, 6, 6); // Head (adjust position for 0,0 origin)
    travelerGraphics.fillRect(0, 12, 12, 20); // Body
    travelerGraphics.generateTexture('traveler_texture', 12, 32);
    travelerGraphics.destroy();
    
    this.traveler = this.physics.add.sprite(50, 480, 'traveler_texture').setOrigin(0.5, 0.5);
    this.traveler.setSize(12, 32);

    // Bobbing animation for walking, now targeting the sprite itself
    bobTween = this.tweens.add({
        targets: this.traveler,
        y: '+=2',
        duration: 300,
        yoyo: true,
        repeat: -1,
        paused: true
    });


    // 3. THE MIST SYSTEM
    this.mist = this.make.renderTexture({ width: 800, height: 600 }, true);
    this.mist.fill(0xD1D9E0, 0.95);
    this.mist.setDepth(10);

    // Wiping brush
    const brushGraphics = this.make.graphics();
    brushGraphics.fillStyle(0xffffff);
    brushGraphics.fillCircle(20, 20, 20);
    brushGraphics.generateTexture('brush_alpha', 40, 40);
    brushGraphics.destroy();
    this.brush = this.make.image({ key: 'brush_alpha', add: false });
    
    // Fog brush (Bug Fix 1)
    const fogBrushGraphics = this.make.graphics();
    fogBrushGraphics.fillStyle(0xD1D9E0, 0.95); // Mist color and alpha
    fogBrushGraphics.fillCircle(20, 20, 20);
    fogBrushGraphics.generateTexture('fog_brush', 40, 40);
    fogBrushGraphics.destroy();
    this.fogBrush = this.make.image({ key: 'fog_brush', add: false });


    this.input.on('pointermove', (pointer) => {
        if (pointer.isDown && stamina > 0) {
            this.mist.erase(this.brush, pointer.x - 20, pointer.y - 20);
            stamina -= 0.5;
            if (stamina < 0) stamina = 0;
        }
    });
    
    // 4. Implement the "Breathe" mechanic (with Bug Fix 1)
    this.input.keyboard.on('keydown-SPACE', () => {
        if (stamina < 100) {
            // Draw with the fog brush instead of the white erase brush
            this.mist.draw(this.fogBrush, this.input.activePointer.x - 20, this.input.activePointer.y - 20, 1.0);
            stamina += 5;
             if (stamina > 100) stamina = 100;
        }
    });


    // 5. UI Elements (with Bug Fix 3)
    WebFont.load({
        google: { families: ['Gaegu'] },
        active: () => {
            instructionsText = this.add.text(400, 30, 'Click-drag to wipe mist. Spacebar to breathe (adds mist, restores stamina).', { 
                fontFamily: 'Gaegu', 
                fontSize: '20px', 
                fill: '#ffffff', 
                align: 'center',
                wordWrap: { width: 780, useAdvancedWrap: true } // Bug Fix 3
            }).setOrigin(0.5).setDepth(11);
            staminaText = this.add.text(40, 560, 'Stamina: 100', { fontFamily: 'Gaegu', fontSize: '24px', fill: '#ffffff' }).setDepth(11);
            winText = this.add.text(400, 300, 'They made it home because you noticed.', { fontFamily: 'Gaegu', fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5).setDepth(11).setVisible(false);
        }
    });
}

function update(time, delta) {
    if (!this.traveler || !this.mist) return;

    // A. Traveler AI Logic
    if (this.traveler.body.velocity.x === 0) {
        const aheadX = Math.floor(this.traveler.x + 15);
        const aheadY = Math.floor(this.traveler.y);

        checkMistAlphaAt.call(this, aheadX, aheadY, (alpha) => {
            if (alpha < 20) {
                this.traveler.setVelocityX(80);
                this.traveler.setTint(0xffffff); // Apply tint directly to sprite
                if(bobTween) bobTween.resume();
            } else {
                this.traveler.setVelocityX(0);
                this.traveler.setTint(0xffff00); // Apply tint directly to sprite
                if(bobTween) bobTween.pause();
            }
        });
    }
    
    // B. Parallax scrolling background (with Bug Fix 2)
    if (this.traveler.body.velocity.x > 0) {
        bgLayers.forEach(layer => {
            if (layer.isTileSprite) {
                layer.gfx.tilePositionX += layer.speed * (this.traveler.body.velocity.x / 80);
            } else {
                layer.gfx.x -= layer.speed * (this.traveler.body.velocity.x / 80);
                // Correct looping logic
                if (layer.gfx.x < -PARALLAX_WIDTH) {
                    layer.gfx.x += PARALLAX_WIDTH;
                }
            }
        });
    }

    // Manual graphics sync is no longer needed.


    // C. Stamina Regen
    if (!this.input.activePointer.isDown && stamina < 100) {
        stamina += 0.2;
        if (stamina > 100) stamina = 100;
    }

    // D. Update UI
    if (staminaText) {
        staminaText.setText('Stamina: ' + Math.floor(stamina));
    }

    // E. Win Condition
    if (this.traveler.x >= 800) {
        this.traveler.setVelocityX(0);
        if(bobTween) bobTween.pause();
        if(winText) winText.setVisible(true);
    }
}

function checkMistAlphaAt(x, y, callback) {
    if (x < 0 || x >= 800 || y < 0 || y >= 600) {
        callback(255);
        return;
    }
    this.mist.snapshotPixel(x, y, (color) => {
        callback(color.a);
    });
}

