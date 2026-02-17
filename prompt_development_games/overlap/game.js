const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#0F172A',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
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

let spark;
let allWindows = [];
let goal;
let cursors;
let levelIndex = 0;
let hintText;
let floorGroup;
let jumpParticles;
let textPlatforms;
let voidTimer = null;

class AppWindow extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, title = 'Window', type = 'Terminal', data = {}) {
        super(scene, x, y);
        this.width = width;
        this.height = height;
        this.title = title;
        this.type = type;
        this.data = data;
        this.scene = scene;

        const titleBarHeight = 20;

        this.titleBar = scene.add.rectangle(0, -titleBarHeight, width, titleBarHeight, 0x334155).setOrigin(0);
        this.content = scene.add.rectangle(0, 0, width, height, 0x1E293B).setOrigin(0);
        const titleText = scene.add.text(5, -titleBarHeight + 5, title, { fontSize: '12px', fill: '#FFF' });

        this.add([this.content, this.titleBar, titleText]);
        scene.add.existing(this);

        this.floor = floorGroup.create(x + width / 2, y + height - 5, 'platform').setSize(width, 10).setVisible(false);
        this.floor.setImmovable(true);
        this.floor.body.setAllowGravity(false);


        this.setInteractive(new Phaser.Geom.Rectangle(0, -titleBarHeight, width, titleBarHeight), Phaser.Geom.Rectangle.Contains);
        scene.input.setDraggable(this);
        this.on('drag', (pointer, dragX, dragY) => {
            // Move the main physics body directly. The container will follow in update().
            this.floor.body.reset(dragX + this.width / 2, dragY + this.height - 5);
        });

        this.setupContent();
    }

    setupContent() {
        if (this.type === 'Notepad') {
            this.data.lines.forEach((line, index) => {
                const yPos = 30 + index * 40;
                const text = this.scene.add.text(20, yPos, line, { fontSize: '16px', fill: '#FFF', fontFamily: 'Courier' });
                this.add(text);
                const platform = textPlatforms.create(this.x + text.x + text.width/2, this.y + yPos + 10, 'platform')
                    .setSize(text.width, 2).setVisible(false);
                platform.setImmovable(true);
                platform.body.setAllowGravity(false);
                platform.textRef = text;
                this.floor.textPlatforms = this.floor.textPlatforms || [];
                this.floor.textPlatforms.push(platform);
            });
        } else if (this.type === 'Calculator') {
            this.display = this.scene.add.text(this.width/2, 40, '', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5);
            this.add(this.display);
            this.data.buttons.forEach((btn, i) => {
                const btnX = (i % 3) * 60 + 40;
                const btnY = Math.floor(i / 3) * 60 + 100;
                const button = this.scene.add.rectangle(btnX, btnY, 40, 40, 0x556677).setOrigin(0.5);
                const btnText = this.scene.add.text(btnX, btnY, btn.label, { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5);
                this.add([button, btnText]);

                const zone = this.scene.add.zone(btnX, btnY, 40, 40).setOrigin(0.5);
                this.scene.physics.world.enable(zone);
                zone.body.setAllowGravity(false);
                zone.body.setImmovable(true);
                this.add(zone);
                
                this.scene.physics.add.overlap(spark, zone, () => {
                     if (spark.body.touching.down && !this.data.solved) {
                        this.data.sequence.push(btn.value);
                        this.display.setText(this.data.sequence.join(''));
                        button.setFillStyle(0x778899);
                        this.scene.time.delayedCall(200, () => button.setFillStyle(0x556677));
                        if(this.data.sequence.join('') === this.data.solution) {
                            this.display.setText('OK');
                            goal.setVisible(true);
                            this.data.solved = true;
                        } else if (this.data.sequence.length >= this.data.solution.length) {
                            this.scene.time.delayedCall(300, () => {
                                this.data.sequence = [];
                                this.display.setText('');
                            });
                        }
                    }
                });
            });
        }
    }

    update() {
        // The container's position now follows its main physics body.
        this.x = this.floor.body.x - this.width / 2;
        this.y = this.floor.body.y - (this.height - 5);

        // Sync text platforms to the container's new position.
        if(this.floor.textPlatforms) {
            this.floor.textPlatforms.forEach(p => {
                p.body.reset(this.x + p.textRef.x + p.textRef.width/2, this.y + p.textRef.y + 10);
            })
        }
    }

    getBounds() {
        return new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
    }

    destroy(fromScene) {
        if(this.floor.textPlatforms){
            this.floor.textPlatforms.forEach(p => p.destroy());
        }
        if(this.floor) this.floor.destroy();
        super.destroy(fromScene);
    }
}

function preload() {
    const graphics = this.make.graphics({ add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillGradientStyle(0xffff00, 0xffff00, 0xff0000, 0xff0000, 1);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('spark', 8, 8);

    graphics.fillStyle(0x1E293B, 1);
    graphics.fillRect(0, 0, 1, 1);
    graphics.generateTexture('platform', 1, 1);

    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('goal', 32, 32);

    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 2, 2);
    graphics.generateTexture('particle', 2, 2);

    graphics.destroy();
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addKeys('A,D,SPACE');

    hintText = this.add.text(10, 10, '', { fontSize: '16px', fill: '#FFF', stroke: '#000', strokeThickness: 4, fontStyle: 'italic' });

    // Add new, permanent main instructions
    const instructionStr = "A/D: Move  |  SPACE: Jump  |  MOUSE: Drag Window Title Bars";
    mainInstructions = this.add.text(1024 / 2, 768 - 30, instructionStr, { 
        fontSize: '18px', 
        fill: '#FFF', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    floorGroup = this.physics.add.group();
    textPlatforms = this.physics.add.group();
    
    jumpParticles = this.add.particles('particle').createEmitter({
        speed: 50,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD',
        lifespan: 300
    });
    jumpParticles.stop();

    loadLevel(levelIndex, this);

    this.physics.add.collider(spark, floorGroup);
    this.physics.add.collider(spark, textPlatforms);
}

function update(time, delta) {
    if (!spark || !spark.body) return;

    if (this.input.keyboard.keys[65].isDown) { // A
        spark.setVelocityX(-160);
    } else if (this.input.keyboard.keys[68].isDown) { // D
        spark.setVelocityX(160);
    } else {
        spark.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.keys[32]) && spark.body.touching.down) {
        spark.setVelocityY(-330);
        jumpParticles.emitParticleAt(spark.x, spark.y + 8, 10);
    }

    allWindows.forEach(win => win.update());

    let inAnyWindow = false;
    for (const win of allWindows) {
        if (Phaser.Geom.Rectangle.ContainsPoint(win.getBounds(), {x: spark.x, y: spark.y})) {
            inAnyWindow = true;
            spark.lastWindow = win;
            break;
        }
    }
    
    // --- Void Check with Grace Period ---
    if (inAnyWindow) {
        if (voidTimer) {
            voidTimer.remove();
            voidTimer = null;
        }
    } else {
        if (!voidTimer) {
            voidTimer = this.time.delayedCall(250, () => {
                const lastWindow = spark.lastWindow || allWindows[0];
                if (lastWindow) {
                    spark.setPosition(lastWindow.x + lastWindow.width / 2, lastWindow.y + lastWindow.height / 2);
                    spark.setVelocity(0,0);
                } else {
                    spark.setPosition(1024 / 2, 768 / 2);
                }
                voidTimer = null;
            });
        }
    }
    
    if (goal && goal.visible && this.physics.overlap(spark, goal)) {
        levelIndex++;
        if (levelIndex > 1) {
            hintText.setText('CONNECTION ESTABLISHED!');
            mainInstructions.setVisible(false); // Hide instructions on final win
            this.physics.pause();
            if(spark) spark.destroy();
        } else {
            loadLevel(levelIndex, this);
        }
    }
}

function loadLevel(levelNum, scene) {
    if (spark) spark.destroy();
    if (goal) goal.destroy();
    allWindows.forEach(win => win.destroy());
    allWindows = [];

    floorGroup.clear(true, true);
    textPlatforms.clear(true, true);
    if (voidTimer) {
        voidTimer.remove();
        voidTimer = null;
    }
    
    mainInstructions.setVisible(true); // Ensure main instructions are visible on level start
    
    switch (levelNum) {
        case 0:
            hintText.setText('Hint: You can stand on the text inside the Notepad.');
            allWindows.push(new AppWindow(scene, 100, 300, 400, 250, 'Notepad', 'Notepad', {
                lines: ['To begin,', 'find the connection', 'between the lines.']
            }));
            allWindows.push(new AppWindow(scene, 600, 400, 300, 200, 'Exit'));

            spark = scene.physics.add.sprite(150, 350, 'spark');
            goal = scene.physics.add.sprite(750, 350, 'goal').setVisible(true);
            break;
        case 1:
            hintText.setText('Hint: The "Memo" window holds a clue for the Calculator.');
            const calcData = {
                buttons: [
                    {label: '7', value: 7}, {label: '8', value: 8}, {label: '9', value: 9},
                    {label: '4', value: 4}, {label: '5', value: 5}, {label: '6', value: 6},
                    {label: '1', value: 1}, {label: '2', value: 2}, {label: '3', value: 3}
                ],
                solution: '1337',
                sequence: [],
                solved: false
            };
            allWindows.push(new AppWindow(scene, 50, 450, 250, 200, 'Terminal'));
            allWindows.push(new AppWindow(scene, 350, 150, 300, 180, 'Memo', 'Notepad', {
                 lines: ['"That old password..."', '"the one that felt so"', '"> ELITE <"']
            }));
            allWindows.push(new AppWindow(scene, 350, 400, 250, 300, 'Calculator', 'Calculator', calcData));
            allWindows.push(new AppWindow(scene, 800, 500, 200, 150, 'Exit'));

            spark = scene.physics.add.sprite(150, 500, 'spark');
            goal = scene.physics.add.sprite(900, 450, 'goal').setVisible(false);
            break;
    }

    spark.setCollideWorldBounds(true);
    spark.setGravityY(500);
    spark.lastWindow = allWindows[0];
    
    scene.physics.world.enable(goal);
    goal.body.setAllowGravity(false);
}
