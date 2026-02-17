const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#121212',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
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

let player;
let platforms;
let cursors;
let goal;
let stitchesLeftText;
let instructionsText;
let resetButton;
let glitchParticles;

let activeAnchor = null;
let stitchesLeft = 3;
const MAX_STITCHES = 3;
let isStitching = false;
let threadGraphics;
let anchorGraphics;

function preload() {
    // No assets to preload for now
}

function create() {
    // --- State Reset on Scene Start/Restart ---
    stitchesLeft = 3;
    activeAnchor = null;
    isStitching = false;

    // Grid Overlay
    const grid = this.add.graphics({ lineStyle: { width: 1, color: 0x222222 } });
    for (let i = 0; i < config.width / 40; i++) {
        grid.moveTo(i * 40, 0);
        grid.lineTo(i * 40, config.height);
    }
    for (let j = 0; j < config.height / 40; j++) {
        grid.moveTo(0, j * 40);
        grid.lineTo(config.width, j * 40);
    }
    grid.strokePath();

    // --- Revised Level Design ---
    platforms = this.physics.add.staticGroup();
    platforms.create(150, 580, 'platform').setScale(3, 1).refreshBody(); // Starting platform
    platforms.create(700, 150, 'platform').setScale(2, 1).refreshBody(); // High platform with goal
    platforms.create(500, 400, 'platform').setScale(1.5, 1).refreshBody(); // Mid-air platform to be moved

    // Player
    player = this.physics.add.sprite(100, 500, 'player');
    player.setCollideWorldBounds(true);
    
    // Goal (Core Memory)
    goal = this.physics.add.sprite(700, 100, 'goal');
    goal.body.allowGravity = false;

    // --- Graphics and Textures ---
    let playerGraphics = this.make.graphics({ fillStyle: { color: 0xffffff } });
    playerGraphics.fillRect(0, 0, 20, 20);
    playerGraphics.generateTexture('player', 20, 20);
    player.setTexture('player');

    let platformGraphics = this.make.graphics({ fillStyle: { color: 0x00FFCC } });
    platformGraphics.fillRect(0, 0, 100, 20);
    platformGraphics.generateTexture('platform', 100, 20);
    
    let platformObjects = platforms.getChildren();
    for (const child of platformObjects) {
        child.setTexture('platform');
        const stitchableEdge = this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } });
        stitchableEdge.strokeRect(child.x - child.displayWidth/2, child.y - child.displayHeight/2, child.displayWidth, child.displayHeight);
        child.setData('edge', stitchableEdge);
    }


    let goalGraphics = this.make.graphics({ fillStyle: { color: 0xFF007F } });
    goalGraphics.fillRect(0, 0, 30, 30);
    goalGraphics.generateTexture('goal', 30, 30);
    goal.setTexture('goal');

    // --- Glitch Particle Effect ---
    let glitchParticleGraphics = this.make.graphics();
    glitchParticleGraphics.fillStyle(0xffffff);
    glitchParticleGraphics.fillRect(0, 0, 8, 8);
    glitchParticleGraphics.generateTexture('glitch', 8, 8);

    glitchParticles = this.add.particles('glitch');
    glitchParticles.createEmitter({
        speed: { min: -400, max: 400 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        blendMode: 'SCREEN',
        lifespan: 300,
        gravityY: 0,
        tint: [0x00FFCC, 0xFF007F, 0xFFFFFF],
        on: false
    });

    // --- Physics ---
    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, goal, reachGoal, null, this);

    // --- Controls ---
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    this.input.on('pointerdown', handlePointerDown, this);

    // --- UI ---
    stitchesLeftText = this.add.text(16, 16, 'Stitches Left: ' + stitchesLeft, { fontSize: '24px', fontFamily: 'Courier New', fill: '#FFFFFF' });
    instructionsText = this.add.text(16, 50, 'WASD/Arrows: Move | Space: Jump | R: Reset\nClick two points to stitch them together.', { fontSize: '16px', fontFamily: 'Courier New', fill: '#FFFFFF' });
    resetButton = this.add.text(config.width - 100, 16, 'Reset Level', { fontSize: '18px', fontFamily: 'Courier New', fill: '#FF007F', backgroundColor: '#333333', padding: {x: 5, y: 5} })
        .setInteractive()
        .on('pointerdown', () => this.scene.restart());
    
    threadGraphics = this.add.graphics({ lineStyle: { width: 2, color: 0xFF007F } });
    anchorGraphics = this.add.graphics();
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    } else {
        player.setVelocityX(0);
    }

    if ((cursors.space.isDown || cursors.up.isDown) && player.body.touching.down) {
        player.setVelocityY(-400);
    }
}

function handlePointerDown(pointer) {
    if (stitchesLeft <= 0 || isStitching) return;

    if (!activeAnchor) {
        activeAnchor = { x: pointer.x, y: pointer.y };
        anchorGraphics.fillStyle(0xFF007F, 1);
        anchorGraphics.fillCircle(activeAnchor.x, activeAnchor.y, 5);
    } else {
        isStitching = true;
        const pointB = { x: pointer.x, y: pointer.y };
        
        threadGraphics.lineStyle(2, 0xFF007F);
        threadGraphics.beginPath();
        threadGraphics.moveTo(activeAnchor.x, activeAnchor.y);
        threadGraphics.lineTo(pointB.x, pointB.y);
        threadGraphics.strokePath();

        executeFold.call(this, activeAnchor, pointB);

        activeAnchor = null;
        stitchesLeft--;
        stitchesLeftText.setText('Stitches Left: ' + stitchesLeft);

        this.time.delayedCall(350, () => {
            anchorGraphics.clear();
            isStitching = false;
        });
    }
}

function executeFold(pointA, pointB) {
    const midpoint = { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2 };
    const padding = 10; // Prevents platforms from overlapping

    // --- Trigger Glitch Effect ---
    glitchParticles.emitParticleAt(midpoint.x, midpoint.y, 64);

    const allMovableObjects = [player, goal, ...platforms.getChildren()];

    // --- Disable Player Gravity during Fold ---
    if (player.body.touching.down) {
        player.body.allowGravity = false;
    }
    
    allMovableObjects.forEach(obj => {
        if (obj.body.isStatic) {
             obj.body.isStatic = false;
             obj.body.allowGravity = false;
        }

        let targetX, targetY;
        const distToA = Phaser.Math.Distance.Between(obj.x, obj.y, pointA.x, pointA.y);
        const distToB = Phaser.Math.Distance.Between(obj.x, obj.y, pointB.x, pointB.y);

        // Move the object based on which side of the stitch it's closer to
        if (distToA < distToB) {
            targetX = obj.x + (midpoint.x - pointA.x);
            targetY = obj.y + (midpoint.y - pointA.y);
             if (platforms.getChildren().includes(obj)) targetX -= padding;
        } else {
            targetX = obj.x - (pointB.x - midpoint.x);
            targetY = obj.y - (pointB.y - midpoint.y);
            if (platforms.getChildren().includes(obj)) targetX += padding;
        }
       
        this.tweens.add({
            targets: obj,
            x: targetX,
            y: targetY,
            duration: 300,
            ease: 'Cubic.easeOut',
            onUpdate: () => {
                if(obj.body && !obj.body.isStatic) obj.body.updateFromGameObject();
            },
            onComplete: () => {
                if (obj === player) {
                    player.body.allowGravity = true;
                }

                if (platforms.getChildren().includes(obj)) {
                    obj.body.isStatic = true;
                    obj.refreshBody();
                }
                
                if (obj.data && obj.data.get('edge')) {
                    const edge = obj.data.get('edge');
                    edge.clear();
                    edge.lineStyle(2, 0xffffff);
                    edge.strokeRect(obj.x - obj.displayWidth/2, obj.y - obj.displayHeight/2, obj.displayWidth, obj.displayHeight);
                }
            }
        });
    });
}


function reachGoal(player, goal) {
    if (isStitching) return;
    goal.disableBody(true, true);
    const winText = this.add.text(config.width / 2, config.height / 2, 'RESTORATION COMPLETE', { fontSize: '32px', fill: '#00FFCC' }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
        this.scene.restart();
    });
}
