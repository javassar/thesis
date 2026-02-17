// ============================================================
// UMBRA - You are what the light makes of you
// ============================================================

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    width: 1024,
    height: 768,
    backgroundColor: 0x1a1a2e,

    shadow: {
        color: 0x000000,
        edgeFade: 5
    },

    light: {
        radius: 20,
        glowRadius: 80,
        coreColor: 0xfff9e6,
        pulseRate: 0.3,
        pulseAmount: 0.03
    },

    movement: {
        baseSpeed: 150,
        minSpeedMultiplier: 0.3,
        maxSpeedMultiplier: 2.0
    },

    timing: {
        titleFadeIn: 1000,
        titleHold: 2000,
        titleFadeOut: 1000,
        transitionToWhite: 800,
        transitionHold: 300,
        transitionFromWhite: 800,
        hintDelay: 30000,
        hintFadeIn: 2000
    }
};

// ============================================================
// ROOM DATA
// ============================================================

const ROOMS = [
    // ROOM 1: "Awakening"
    {
        caster: {x: 200, y: 400, w: 40, h: 60},
        lights: [
            {x: 400, y: 400, draggable: true, bounds: {x: 100, y: 100, w: 824, h: 568}}
        ],
        walls: [
            {x: 0, y: 0, w: 1024, h: 50},
            {x: 0, y: 718, w: 1024, h: 50},
            {x: 0, y: 0, w: 50, h: 768},
            {x: 974, y: 0, w: 50, h: 768}
        ],
        shadowPlatforms: [],
        exits: [{x: 900, y: 300, w: 15, h: 80}],
        title: "Awakening",
        hint: "Drag the light. Watch yourself change."
    },

    // ROOM 2: "Reach"
    {
        caster: {x: 150, y: 500, w: 40, h: 60},
        lights: [
            {x: 300, y: 500, draggable: true, bounds: {x: 100, y: 200, w: 400, h: 400}}
        ],
        walls: [
            {x: 0, y: 0, w: 1024, h: 50},
            {x: 0, y: 718, w: 1024, h: 50},
            {x: 0, y: 0, w: 50, h: 768},
            {x: 974, y: 0, w: 50, h: 768},
            {x: 350, y: 550, w: 300, h: 218}
        ],
        shadowPlatforms: [
            {x: 500, y: 480, w: 200, h: 20}
        ],
        exits: [{x: 900, y: 400, w: 15, h: 100}],
        title: "Reach",
        hint: "Shadows touch shadows. Stretch across."
    },

    // ROOM 3: "Compression"
    {
        caster: {x: 150, y: 400, w: 40, h: 60},
        lights: [
            {x: 800, y: 400, draggable: true, bounds: {x: 100, y: 100, w: 824, h: 568}}
        ],
        walls: [
            {x: 0, y: 0, w: 1024, h: 50},
            {x: 0, y: 718, w: 1024, h: 50},
            {x: 0, y: 0, w: 50, h: 768},
            {x: 974, y: 0, w: 50, h: 768},
            {x: 700, y: 50, w: 40, h: 310},
            {x: 700, y: 420, w: 40, h: 298}
        ],
        shadowPlatforms: [],
        exits: [{x: 900, y: 370, w: 15, h: 50}],
        title: "Compression",
        hint: "Closer light, smaller shadow."
    },

    // ROOM 4: "Two Lights"
    {
        caster: {x: 200, y: 400, w: 40, h: 60},
        lights: [
            {x: 150, y: 200, draggable: true, bounds: {x: 50, y: 50, w: 400, h: 300}},
            {x: 150, y: 600, draggable: true, bounds: {x: 50, y: 400, w: 400, h: 300}}
        ],
        walls: [
            {x: 0, y: 0, w: 1024, h: 50},
            {x: 0, y: 718, w: 1024, h: 50},
            {x: 0, y: 0, w: 50, h: 768},
            {x: 974, y: 0, w: 50, h: 768},
            {x: 600, y: 50, w: 50, h: 280},
            {x: 600, y: 440, w: 50, h: 280}
        ],
        shadowPlatforms: [],
        exits: [{x: 900, y: 350, w: 15, h: 70}],
        title: "Two Lights",
        hint: "Two lights, one shadow. Shape it."
    },

    // ROOM 5: "The Wall That Isn't"
    {
        caster: {x: 200, y: 400, w: 40, h: 60},
        lights: [
            {x: 400, y: 400, draggable: true, bounds: {x: 50, y: 100, w: 500, h: 568}}
        ],
        walls: [
            {x: 0, y: 0, w: 1024, h: 50},
            {x: 0, y: 718, w: 1024, h: 50},
            {x: 0, y: 0, w: 50, h: 768},
            {x: 974, y: 0, w: 50, h: 768},
            {x: 500, y: 50, w: 40, h: 668, isSolid: true, blocksLight: false}
        ],
        shadowPlatforms: [],
        exits: [{x: 900, y: 350, w: 15, h: 70}],
        title: "The Wall That Isn't",
        hint: "Walls stop bodies. You have no body."
    },

    // ROOM 6: "Lighthouse"
    {
        caster: {x: 512, y: 600, w: 40, h: 60},
        lights: [
            {x: 512, y: 300, draggable: false, rotating: true, orbitRadius: 200, orbitSpeed: 0.5}
        ],
        walls: [
            {x: 0, y: 0, w: 1024, h: 50},
            {x: 0, y: 718, w: 1024, h: 50},
            {x: 0, y: 0, w: 50, h: 768},
            {x: 974, y: 0, w: 50, h: 768}
        ],
        shadowPlatforms: [
            {x: 200, y: 200, w: 100, h: 20},
            {x: 724, y: 200, w: 100, h: 20}
        ],
        exits: [{x: 900, y: 180, w: 15, h: 40}],
        title: "Lighthouse",
        hint: "The light moves. Wait for your moment."
    },

    // ROOM 7: "Separation"
    {
        caster: {x: 512, y: 450, w: 40, h: 60},
        lights: [
            {x: 512, y: 200, draggable: false}
        ],
        walls: [
            {x: 0, y: 0, w: 1024, h: 50},
            {x: 0, y: 718, w: 1024, h: 50},
            {x: 0, y: 0, w: 50, h: 768},
            {x: 974, y: 0, w: 50, h: 768}
        ],
        shadowPlatforms: [
            {x: 200, y: 600, w: 150, h: 20},
            {x: 674, y: 600, w: 150, h: 20}
        ],
        exits: [
            {x: 100, y: 550, w: 15, h: 70, label: "DARK", ending: "dark"},
            {x: 909, y: 550, w: 15, h: 70, label: "LIGHT", ending: "light"}
        ],
        title: "Separation",
        hint: null
    }
];

// ============================================================
// NARRATIVE FRAGMENTS - brief moments of interiority
// ============================================================

const NARRATIVE = {
    room_enter: [
        null, // Room 1 - no text, just awakening
        "You remember having weight.",
        "Distances meant something once.",
        "Two sources. One self. Which is true?",
        "The body stops. You do not.",
        "The light never rests. Neither can you.",
        null  // Room 7 - silence before choice
    ],
    room_exit: [
        "You moved. You are.",
        null,
        null,
        null,
        "You passed through. What else can you leave behind?",
        null,
        null
    ],
    wall_pass: "You have no body."
};

// ============================================================
// GAME STATE
// ============================================================

let gameState = {
    currentRoom: 0,
    phase: 'playing',
    elapsedTime: 0,
    roomStartTime: 0,
    isPaused: false,
    hintShown: false,
    wallPassed: false,  // Track if player passed through non-solid wall
    eyeBlinkTimer: 0,
    eyeState: 'open'  // 'open', 'closing', 'closed', 'opening'
};

let playerState = {
    position: {x: 0, y: 0},
    shadowPolygon: [],
    shadowLength: 0,
    breathPhase: 0,  // For organic shadow breathing
    particles: []    // Shadow particles
};

let roomState = {
    caster: null,
    lights: [],
    walls: [],
    shadowPlatforms: [],
    exits: []
};

// ============================================================
// MAIN GAME SCENE
// ============================================================

class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'GameScene'});
    }

    create() {
        // Graphics layers (in render order)
        this.bgGraphics = this.add.graphics();
        this.gridGraphics = this.add.graphics();
        this.platformGraphics = this.add.graphics();
        this.shadowGraphics = this.add.graphics();
        this.casterGraphics = this.add.graphics();  // The body that casts you
        this.wallGraphics = this.add.graphics();
        this.lightGraphics = this.add.graphics();
        this.exitGraphics = this.add.graphics();
        this.narrativeGraphics = this.add.graphics();

        // Draw floor grid
        this.drawFloorGrid();

        // UI elements
        this.titleText = this.add.text(
            CONFIG.width / 2, 40, '',
            {fontFamily: 'Courier New', fontSize: '24px', color: '#4a4a6a'}
        ).setOrigin(0.5, 0).setAlpha(0);

        this.hintText = this.add.text(
            CONFIG.width / 2, CONFIG.height - 40, '',
            {fontFamily: 'Courier New', fontSize: '14px', color: '#3a3a5a'}
        ).setOrigin(0.5, 1).setAlpha(0);

        // Narrative text (centered, larger, more atmospheric)
        this.narrativeText = this.add.text(
            CONFIG.width / 2, CONFIG.height / 2 - 100, '',
            {fontFamily: 'Georgia, serif', fontSize: '20px', color: '#6a6a8a', fontStyle: 'italic'}
        ).setOrigin(0.5).setAlpha(0).setDepth(80);

        // Instructions text
        this.instructionsText = this.add.text(
            CONFIG.width / 2, CONFIG.height - 15,
            'WASD/Arrows: Move | Drag lights to reshape shadow | P: Pause | R: Restart',
            {fontFamily: 'Courier New', fontSize: '12px', color: '#3a3a5a'}
        ).setOrigin(0.5, 1).setAlpha(0.7);

        // Input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.input.keyboard.on('keydown-P', () => this.togglePause());
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard.on('keydown-R', () => this.restartRoom());

        // Pause overlay
        this.pauseOverlay = this.add.rectangle(
            CONFIG.width / 2, CONFIG.height / 2,
            CONFIG.width, CONFIG.height,
            0x1a1a2e, 0.85
        ).setVisible(false).setDepth(100);

        this.pauseText = this.add.text(
            CONFIG.width / 2, CONFIG.height / 2 - 20,
            'PAUSED',
            {fontFamily: 'Courier New', fontSize: '36px', color: '#6a6a8a'}
        ).setOrigin(0.5).setVisible(false).setDepth(101);

        this.pauseSubtext = this.add.text(
            CONFIG.width / 2, CONFIG.height / 2 + 30,
            'Press ESC to continue',
            {fontFamily: 'Courier New', fontSize: '16px', color: '#4a4a6a'}
        ).setOrigin(0.5).setVisible(false).setDepth(101);

        // Light dragging
        this.draggedLight = null;
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);

        // Exit label texts array
        this.exitLabels = [];

        // Initialize audio
        this.initAudio();

        // Load first room
        this.loadRoom(0);
    }

    // --------------------------------------------------------
    // FLOOR GRID
    // --------------------------------------------------------

    drawFloorGrid() {
        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1, 0x252540, 0.1);

        for (let x = 0; x <= CONFIG.width; x += 32) {
            this.gridGraphics.lineBetween(x, 0, x, CONFIG.height);
        }
        for (let y = 0; y <= CONFIG.height; y += 32) {
            this.gridGraphics.lineBetween(0, y, CONFIG.width, y);
        }
    }

    // --------------------------------------------------------
    // ROOM LOADING
    // --------------------------------------------------------

    loadRoom(index) {
        const room = ROOMS[index];
        gameState.currentRoom = index;
        gameState.roomStartTime = gameState.elapsedTime;
        gameState.hintShown = false;
        gameState.wallPassed = false;

        // Reset particles
        playerState.particles = [];

        // Clear exit labels
        this.exitLabels.forEach(label => label.destroy());
        this.exitLabels = [];

        // Set up caster
        roomState.caster = {...room.caster};

        // Set up lights
        roomState.lights = room.lights.map(l => ({
            x: l.x,
            y: l.y,
            initialX: l.x,
            initialY: l.y,
            draggable: l.draggable !== false,
            bounds: l.bounds || null,
            rotating: l.rotating || false,
            orbitRadius: l.orbitRadius || 0,
            orbitSpeed: l.orbitSpeed || 0,
            orbitAngle: 0,
            orbitCenterX: 512,
            orbitCenterY: 384
        }));

        // Set up geometry
        roomState.walls = [...room.walls];
        roomState.shadowPlatforms = room.shadowPlatforms || [];
        roomState.exits = room.exits || [];

        // Initialize player position at shadow center
        playerState.position = {
            x: roomState.caster.x + roomState.caster.w / 2,
            y: roomState.caster.y + roomState.caster.h
        };

        // Show title
        this.titleText.setText(room.title);
        this.titleText.setAlpha(0);
        this.tweens.add({
            targets: this.titleText,
            alpha: 1,
            duration: CONFIG.timing.titleFadeIn,
            hold: CONFIG.timing.titleHold,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });

        // Show narrative fragment after title fades
        const narrative = NARRATIVE.room_enter[index];
        if (narrative) {
            this.time.delayedCall(CONFIG.timing.titleFadeIn + 500, () => {
                this.showNarrative(narrative);
            });
        }

        // Set hint text (hidden)
        this.hintText.setText(room.hint || '');
        this.hintText.setAlpha(0);

        // Draw static elements
        this.drawWalls();
        this.drawShadowPlatforms();
        this.drawExits();
    }

    // --------------------------------------------------------
    // MAIN UPDATE LOOP
    // --------------------------------------------------------

    update(time, delta) {
        if (gameState.isPaused) return;
        if (gameState.phase !== 'playing') return;

        const dt = delta / 1000;
        gameState.elapsedTime += dt;

        // Update rotating lights
        this.updateRotatingLights(dt);

        // Calculate shadow
        this.calculateShadow();

        // Handle player movement
        this.handleMovement(dt);

        // Check exit collisions
        this.checkExits();

        // Check if shadow passed through non-solid wall (Room 5 revelation)
        this.checkWallPass();

        // Show hint after delay
        const roomTime = gameState.elapsedTime - gameState.roomStartTime;
        if (!gameState.hintShown && roomTime > CONFIG.timing.hintDelay / 1000) {
            this.showHint();
        }

        // Update breathing and particles
        this.updateShadowEffects(dt);

        // Update eye blink
        this.updateEyeBlink(dt);

        // Update audio based on shadow state
        this.updateShadowAudio();

        // Render
        this.render();
        this.drawCaster();
        this.renderExits();
    }

    // --------------------------------------------------------
    // SHADOW CALCULATION
    // --------------------------------------------------------

    calculateShadow() {
        const caster = roomState.caster;
        const lights = roomState.lights;

        if (lights.length === 0) {
            playerState.shadowPolygon = [];
            return;
        }

        // Get caster corners
        const corners = [
            {x: caster.x, y: caster.y},
            {x: caster.x + caster.w, y: caster.y},
            {x: caster.x + caster.w, y: caster.y + caster.h},
            {x: caster.x, y: caster.y + caster.h}
        ];

        let allShadowPolys = [];

        for (const light of lights) {
            // Find the two "edge" corners visible from the light
            // These are the corners that form the silhouette of the caster
            let rayPoints = [];

            for (const corner of corners) {
                // Direction from light to corner
                const dx = corner.x - light.x;
                const dy = corner.y - light.y;
                const len = Math.sqrt(dx * dx + dy * dy);

                if (len === 0) continue;

                const dirX = dx / len;
                const dirY = dy / len;

                // Extend ray to room boundary
                const extended = this.extendRay(corner, dirX, dirY);

                rayPoints.push({
                    corner: {...corner},
                    extended: extended,
                    angle: Math.atan2(dy, dx)
                });
            }

            // Sort by angle from light
            rayPoints.sort((a, b) => a.angle - b.angle);

            // Build shadow polygon properly:
            // Start from first corner, go around the shadow silhouette
            // The shadow is a quadrilateral (or more complex shape) formed by:
            // - The two "edge" corners of the caster (those creating the shadow boundary)
            // - The extended points from those corners

            // Find the two corners that create the shadow edges (outermost angles)
            // These are the first and last after sorting by angle
            if (rayPoints.length >= 2) {
                const first = rayPoints[0];
                const last = rayPoints[rayPoints.length - 1];

                // The shadow polygon goes: first.corner -> first.extended -> last.extended -> last.corner
                // But we need to handle the case where the shadow wraps around

                // Build a proper closed shadow polygon
                let shadowPoly = [];

                // Add corners in sorted order
                for (let i = 0; i < rayPoints.length; i++) {
                    shadowPoly.push(rayPoints[i].corner);
                }

                // Add extended points in reverse order
                for (let i = rayPoints.length - 1; i >= 0; i--) {
                    shadowPoly.push(rayPoints[i].extended);
                }

                allShadowPolys.push(shadowPoly);
            }
        }

        // Combine shadow polygons
        if (allShadowPolys.length > 0) {
            if (allShadowPolys.length === 1) {
                playerState.shadowPolygon = allShadowPolys[0];
            } else {
                // For multiple lights, combine shadows using convex hull
                let allPoints = [];
                for (const poly of allShadowPolys) {
                    allPoints = allPoints.concat(poly);
                }
                playerState.shadowPolygon = this.convexHull(allPoints);
            }
        }

        // Calculate shadow length (distance from caster to furthest point)
        let maxDist = 0;
        const casterCenter = {
            x: caster.x + caster.w / 2,
            y: caster.y + caster.h / 2
        };
        for (const point of playerState.shadowPolygon) {
            const dist = Math.sqrt(
                Math.pow(point.x - casterCenter.x, 2) +
                Math.pow(point.y - casterCenter.y, 2)
            );
            maxDist = Math.max(maxDist, dist);
        }
        playerState.shadowLength = Math.max(maxDist, 20);

        // Update player position to stay within shadow if it exists
        if (playerState.shadowPolygon.length > 2) {
            if (!this.isPointInPolygon(playerState.position, playerState.shadowPolygon)) {
                // Move player to centroid of shadow
                let cx = 0, cy = 0;
                for (const p of playerState.shadowPolygon) {
                    cx += p.x;
                    cy += p.y;
                }
                cx /= playerState.shadowPolygon.length;
                cy /= playerState.shadowPolygon.length;
                playerState.position.x = cx;
                playerState.position.y = cy;
            }
        }
    }

    convexHull(points) {
        if (points.length < 3) return points;

        // Find leftmost point
        let start = 0;
        for (let i = 1; i < points.length; i++) {
            if (points[i].x < points[start].x) start = i;
        }

        let hull = [];
        let current = start;

        do {
            hull.push(points[current]);
            let next = 0;

            for (let i = 0; i < points.length; i++) {
                if (next === current) {
                    next = i;
                    continue;
                }

                const cross = this.cross(points[current], points[next], points[i]);
                if (cross < 0 || (cross === 0 &&
                    this.dist(points[current], points[i]) > this.dist(points[current], points[next]))) {
                    next = i;
                }
            }

            current = next;
        } while (current !== start && hull.length < points.length);

        return hull;
    }

    cross(o, a, b) {
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }

    dist(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    extendRay(start, dirX, dirY) {
        const maxDist = 2000;
        let t = maxDist;

        // Clip to room bounds (walls at edges)
        const minX = 50;
        const maxX = 974;
        const minY = 50;
        const maxY = 718;

        // Calculate intersection with each boundary
        if (dirX > 0) {
            const tRight = (maxX - start.x) / dirX;
            if (tRight > 0 && tRight < t) t = tRight;
        } else if (dirX < 0) {
            const tLeft = (minX - start.x) / dirX;
            if (tLeft > 0 && tLeft < t) t = tLeft;
        }

        if (dirY > 0) {
            const tBottom = (maxY - start.y) / dirY;
            if (tBottom > 0 && tBottom < t) t = tBottom;
        } else if (dirY < 0) {
            const tTop = (minY - start.y) / dirY;
            if (tTop > 0 && tTop < t) t = tTop;
        }

        return {
            x: start.x + dirX * t,
            y: start.y + dirY * t
        };
    }

    // --------------------------------------------------------
    // PLAYER MOVEMENT
    // --------------------------------------------------------

    handleMovement(dt) {
        let dx = 0, dy = 0;

        if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
        if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
        if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
        if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

        if (dx === 0 && dy === 0) return;

        // Normalize
        const len = Math.sqrt(dx * dx + dy * dy);
        dx /= len;
        dy /= len;

        // Speed based on shadow length
        const speedMult = Phaser.Math.Clamp(
            60 / playerState.shadowLength,
            CONFIG.movement.minSpeedMultiplier,
            CONFIG.movement.maxSpeedMultiplier
        );
        const speed = CONFIG.movement.baseSpeed * speedMult;

        // Calculate new position
        let newX = playerState.position.x + dx * speed * dt;
        let newY = playerState.position.y + dy * speed * dt;

        // Check if new position is within shadow or on shadow platforms
        const inShadow = this.isPointInPolygon({x: newX, y: newY}, playerState.shadowPolygon);
        const onPlatform = this.isOnShadowPlatform(newX, newY);

        if (inShadow || onPlatform) {
            playerState.position.x = newX;
            playerState.position.y = newY;
        } else {
            // Try to find nearest valid position
            const nearest = this.nearestPointInShadow({x: newX, y: newY});
            if (nearest) {
                playerState.position.x = nearest.x;
                playerState.position.y = nearest.y;
            }
        }
    }

    isOnShadowPlatform(x, y) {
        for (const platform of roomState.shadowPlatforms) {
            if (x >= platform.x && x <= platform.x + platform.w &&
                y >= platform.y && y <= platform.y + platform.h) {
                return true;
            }
        }
        return false;
    }

    nearestPointInShadow(point) {
        if (playerState.shadowPolygon.length < 3) return null;

        let nearest = null;
        let minDist = Infinity;

        // Check polygon edges
        for (let i = 0; i < playerState.shadowPolygon.length; i++) {
            const a = playerState.shadowPolygon[i];
            const b = playerState.shadowPolygon[(i + 1) % playerState.shadowPolygon.length];

            const closest = this.closestPointOnSegment(point, a, b);
            const d = this.dist(point, closest);

            if (d < minDist) {
                minDist = d;
                nearest = closest;
            }
        }

        return nearest;
    }

    closestPointOnSegment(p, a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lenSq = dx * dx + dy * dy;

        if (lenSq === 0) return {x: a.x, y: a.y};

        let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));

        return {
            x: a.x + t * dx,
            y: a.y + t * dy
        };
    }

    isPointInPolygon(point, polygon) {
        if (polygon.length < 3) return false;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            if (((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }

    // --------------------------------------------------------
    // LIGHT INTERACTION
    // --------------------------------------------------------

    onPointerDown(pointer) {
        if (gameState.isPaused || gameState.phase !== 'playing') return;

        for (const light of roomState.lights) {
            if (!light.draggable) continue;

            const dist = Phaser.Math.Distance.Between(
                pointer.x, pointer.y, light.x, light.y
            );

            if (dist < 30) {
                this.draggedLight = light;
                this.input.setDefaultCursor('grabbing');
                this.startDragSound();
                break;
            }
        }
    }

    onPointerMove(pointer) {
        // Update cursor based on hover
        if (!this.draggedLight) {
            let overDraggable = false;
            let overLocked = false;

            for (const light of roomState.lights) {
                const dist = Phaser.Math.Distance.Between(
                    pointer.x, pointer.y, light.x, light.y
                );
                if (dist < 30) {
                    if (light.draggable) {
                        overDraggable = true;
                    } else {
                        overLocked = true;
                    }
                    break;
                }
            }

            if (overDraggable) {
                this.input.setDefaultCursor('grab');
            } else if (overLocked) {
                this.input.setDefaultCursor('not-allowed');
            } else {
                this.input.setDefaultCursor('default');
            }
        }

        if (!this.draggedLight) return;

        let newX = pointer.x;
        let newY = pointer.y;

        // Constrain to bounds if defined
        if (this.draggedLight.bounds) {
            const b = this.draggedLight.bounds;
            newX = Phaser.Math.Clamp(newX, b.x, b.x + b.w);
            newY = Phaser.Math.Clamp(newY, b.y, b.y + b.h);
        }

        this.draggedLight.x = newX;
        this.draggedLight.y = newY;

        this.updateDragSound(newY);
    }

    onPointerUp() {
        if (this.draggedLight) {
            this.stopDragSound();
            this.draggedLight = null;
            this.input.setDefaultCursor('default');
        }
    }

    // --------------------------------------------------------
    // ROTATING LIGHTS
    // --------------------------------------------------------

    updateRotatingLights(dt) {
        for (const light of roomState.lights) {
            if (!light.rotating) continue;

            light.orbitAngle += light.orbitSpeed * dt;

            // Calculate position on orbit
            light.x = light.orbitCenterX + Math.cos(light.orbitAngle) * light.orbitRadius;
            light.y = light.orbitCenterY + Math.sin(light.orbitAngle) * light.orbitRadius;
        }
    }

    // --------------------------------------------------------
    // EXIT DETECTION
    // --------------------------------------------------------

    checkWallPass() {
        if (gameState.wallPassed) return;

        // Check if player (shadow) is inside a wall that doesn't block shadows
        for (const wall of roomState.walls) {
            if (wall.isSolid && wall.blocksLight === false) {
                // This is a wall bodies can't pass, but shadow can
                if (playerState.position.x >= wall.x &&
                    playerState.position.x <= wall.x + wall.w &&
                    playerState.position.y >= wall.y &&
                    playerState.position.y <= wall.y + wall.h) {

                    gameState.wallPassed = true;

                    // Revelation moment
                    this.showNarrative(NARRATIVE.wall_pass, 2500);

                    // Brief visual pulse
                    this.cameras.main.flash(300, 30, 30, 50, true);

                    // Sound effect - ethereal whoosh
                    this.playWallPassSound();
                    break;
                }
            }
        }
    }

    checkExits() {
        for (const exit of roomState.exits) {
            // Check if player position (the shadow entity) is inside the exit
            const px = playerState.position.x;
            const py = playerState.position.y;

            if (px >= exit.x && px <= exit.x + exit.w &&
                py >= exit.y && py <= exit.y + exit.h) {

                if (exit.ending) {
                    this.triggerEnding(exit.ending);
                } else {
                    this.nextRoom();
                }
                return;
            }
        }
    }

    nextRoom() {
        if (gameState.currentRoom >= ROOMS.length - 1) return;

        gameState.phase = 'transitioning';
        this.playRoomCompleteSound();

        // Fade to white
        const flash = this.add.rectangle(
            CONFIG.width / 2, CONFIG.height / 2,
            CONFIG.width, CONFIG.height,
            0xffffff, 0
        ).setDepth(200);

        this.tweens.add({
            targets: flash,
            alpha: 1,
            duration: CONFIG.timing.transitionToWhite,
            onComplete: () => {
                this.loadRoom(gameState.currentRoom + 1);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    delay: CONFIG.timing.transitionHold,
                    duration: CONFIG.timing.transitionFromWhite,
                    onComplete: () => {
                        flash.destroy();
                        gameState.phase = 'playing';
                    }
                });
            }
        });
    }

    triggerEnding(type) {
        gameState.phase = 'ending';

        this.playEndingSound(type);

        if (type === 'dark') {
            // DARK ending: You chose to remain in shadow
            // The screen stays dark, text emerges from darkness
            // You found peace in what you are

            const overlay = this.add.rectangle(
                CONFIG.width / 2, CONFIG.height / 2,
                CONFIG.width, CONFIG.height,
                0x000000, 0
            ).setDepth(200);

            // Fade to deeper black
            this.tweens.add({
                targets: overlay,
                alpha: 0.9,
                duration: 3000
            });

            // Fade out game elements
            this.tweens.add({
                targets: [this.shadowGraphics, this.lightGraphics,
                         this.wallGraphics, this.platformGraphics,
                         this.exitGraphics, this.casterGraphics, this.instructionsText],
                alpha: 0,
                duration: 2500,
                onComplete: () => {
                    // Show ending text - emerges from darkness
                    const endText = this.add.text(
                        CONFIG.width / 2, CONFIG.height / 2 - 30,
                        'You remained in shadow.',
                        {fontFamily: 'Georgia, serif', fontSize: '28px', color: '#4a4a6a', fontStyle: 'italic'}
                    ).setOrigin(0.5).setAlpha(0).setDepth(301);

                    const subText = this.add.text(
                        CONFIG.width / 2, CONFIG.height / 2 + 20,
                        'And found it was enough.',
                        {fontFamily: 'Georgia, serif', fontSize: '18px', color: '#3a3a5a', fontStyle: 'italic'}
                    ).setOrigin(0.5).setAlpha(0).setDepth(301);

                    this.tweens.add({
                        targets: endText,
                        alpha: 1,
                        duration: 2500
                    });

                    this.time.delayedCall(1500, () => {
                        this.tweens.add({
                            targets: subText,
                            alpha: 1,
                            duration: 2000
                        });
                    });

                    this.showReplayPrompt(4000);
                }
            });
        } else {
            // LIGHT ending: You chose to enter the light
            // You gave up your shadow-self to return to the body
            // Bittersweet - wholeness regained, but something lost

            const overlay = this.add.rectangle(
                CONFIG.width / 2, CONFIG.height / 2,
                CONFIG.width, CONFIG.height,
                0xffffff, 0
            ).setDepth(200);

            // Fade to white
            this.tweens.add({
                targets: overlay,
                alpha: 1,
                duration: 3000
            });

            // Fade out game elements
            this.tweens.add({
                targets: [this.shadowGraphics, this.lightGraphics,
                         this.wallGraphics, this.platformGraphics,
                         this.exitGraphics, this.casterGraphics, this.instructionsText],
                alpha: 0,
                duration: 2500,
                onComplete: () => {
                    // Show ending text - dark on white
                    const endText = this.add.text(
                        CONFIG.width / 2, CONFIG.height / 2 - 30,
                        'You became the light.',
                        {fontFamily: 'Georgia, serif', fontSize: '28px', color: '#2a2a4a', fontStyle: 'italic'}
                    ).setOrigin(0.5).setAlpha(0).setDepth(301);

                    const subText = this.add.text(
                        CONFIG.width / 2, CONFIG.height / 2 + 20,
                        'And forgot what you were.',
                        {fontFamily: 'Georgia, serif', fontSize: '18px', color: '#4a4a6a', fontStyle: 'italic'}
                    ).setOrigin(0.5).setAlpha(0).setDepth(301);

                    this.tweens.add({
                        targets: endText,
                        alpha: 1,
                        duration: 2500
                    });

                    this.time.delayedCall(1500, () => {
                        this.tweens.add({
                            targets: subText,
                            alpha: 1,
                            duration: 2000
                        });
                    });

                    this.showReplayPrompt(4000);
                }
            });
        }
    }

    showReplayPrompt(delay) {
        this.time.delayedCall(delay, () => {
            const replayText = this.add.text(
                CONFIG.width / 2, CONFIG.height / 2 + 80,
                'Click to play again',
                {fontFamily: 'Courier New', fontSize: '14px', color: '#5a5a7a'}
            ).setOrigin(0.5).setAlpha(0).setDepth(302);

            this.tweens.add({
                targets: replayText,
                alpha: 0.7,
                duration: 1500
            });

            this.input.once('pointerdown', () => {
                this.resetGameState();
                this.scene.restart();
            });
        });
    }

    // --------------------------------------------------------
    // RENDERING
    // --------------------------------------------------------

    render() {
        this.shadowGraphics.clear();
        this.lightGraphics.clear();

        // Draw shadow with organic breathing distortion
        if (playerState.shadowPolygon.length > 2) {
            this.shadowGraphics.fillStyle(0x000000, 0.95);
            this.shadowGraphics.beginPath();

            // Add breathing distortion to shadow edges
            const breathOffset = Math.sin(playerState.breathPhase) * 2;
            const breathOffset2 = Math.cos(playerState.breathPhase * 1.3) * 1.5;

            const firstPoint = playerState.shadowPolygon[0];
            this.shadowGraphics.moveTo(
                firstPoint.x + breathOffset * Math.sin(firstPoint.y * 0.02),
                firstPoint.y + breathOffset2 * Math.cos(firstPoint.x * 0.02)
            );

            for (let i = 1; i < playerState.shadowPolygon.length; i++) {
                const p = playerState.shadowPolygon[i];
                // Subtle organic wavering at the edges
                const distFromPlayer = Math.sqrt(
                    Math.pow(p.x - playerState.position.x, 2) +
                    Math.pow(p.y - playerState.position.y, 2)
                );
                const edgeFactor = Math.min(distFromPlayer / 100, 1);
                const wobble = breathOffset * edgeFactor * Math.sin(p.y * 0.03 + playerState.breathPhase);
                const wobble2 = breathOffset2 * edgeFactor * Math.cos(p.x * 0.03 + playerState.breathPhase);

                this.shadowGraphics.lineTo(p.x + wobble, p.y + wobble2);
            }
            this.shadowGraphics.closePath();
            this.shadowGraphics.fillPath();

            // Draw particles within shadow
            this.drawShadowParticles();

            // Draw eyes peering from the shadow
            this.drawShadowEyes();
        }

        // Draw lights
        for (const light of roomState.lights) {
            // Glow effect
            const glowSteps = 12;
            for (let i = glowSteps; i >= 0; i--) {
                const radius = CONFIG.light.glowRadius * (i / glowSteps);
                const alpha = 0.5 * Math.pow(1 - (i / glowSteps), 2);
                this.lightGraphics.fillStyle(CONFIG.light.coreColor, alpha);
                this.lightGraphics.fillCircle(light.x, light.y, radius);
            }

            // Core with pulse
            const pulse = Math.sin(gameState.elapsedTime * Math.PI * 2 * CONFIG.light.pulseRate);
            const coreRadius = CONFIG.light.radius * (1 + pulse * CONFIG.light.pulseAmount);
            this.lightGraphics.fillStyle(CONFIG.light.coreColor, 1);
            this.lightGraphics.fillCircle(light.x, light.y, coreRadius);

            // Lock icon if not draggable
            if (!light.draggable && !light.rotating) {
                this.lightGraphics.fillStyle(0x666666, 0.7);
                // Draw small lock shape
                this.lightGraphics.fillRect(light.x + 6, light.y + 10, 12, 8);
                this.lightGraphics.strokeCircle(light.x + 12, light.y + 8, 4);
            }
        }

        // Draw player position indicator
        if (gameState.phase === 'playing') {
            this.lightGraphics.fillStyle(0xffffff, 0.7);
            this.lightGraphics.fillCircle(
                playerState.position.x,
                playerState.position.y,
                5
            );
            // Add a subtle glow
            this.lightGraphics.fillStyle(0xffffff, 0.2);
            this.lightGraphics.fillCircle(
                playerState.position.x,
                playerState.position.y,
                10
            );
        }
    }

    drawWalls() {
        this.wallGraphics.clear();

        for (const wall of roomState.walls) {
            this.wallGraphics.fillStyle(0x0d0d1a, 1);
            this.wallGraphics.fillRect(wall.x, wall.y, wall.w, wall.h);
            this.wallGraphics.lineStyle(2, 0x2d2d4a, 1);
            this.wallGraphics.strokeRect(wall.x, wall.y, wall.w, wall.h);
        }
    }

    drawShadowPlatforms() {
        this.platformGraphics.clear();

        for (const platform of roomState.shadowPlatforms) {
            this.platformGraphics.fillStyle(0x000000, 1);
            this.platformGraphics.fillRect(
                platform.x, platform.y, platform.w, platform.h
            );
        }
    }

    // --------------------------------------------------------
    // CASTER RENDERING - The body that casts your shadow
    // --------------------------------------------------------

    drawCaster() {
        this.casterGraphics.clear();
        const c = roomState.caster;
        if (!c) return;

        // Draw the caster body - a ghostly figure trapped in place
        // Outer glow (ethereal presence)
        this.casterGraphics.fillStyle(0x2a2a4a, 0.3);
        this.casterGraphics.fillRoundedRect(c.x - 4, c.y - 4, c.w + 8, c.h + 8, 4);

        // Body silhouette
        this.casterGraphics.fillStyle(0x1a1a3a, 0.9);
        this.casterGraphics.fillRoundedRect(c.x, c.y, c.w, c.h, 3);

        // Inner details - subtle human form
        const centerX = c.x + c.w / 2;

        // Head (circle at top)
        const headRadius = c.w * 0.35;
        const headY = c.y + headRadius + 4;
        this.casterGraphics.fillStyle(0x252545, 0.8);
        this.casterGraphics.fillCircle(centerX, headY, headRadius);

        // Shoulders curve
        const shoulderY = headY + headRadius + 2;
        this.casterGraphics.fillStyle(0x252545, 0.7);
        this.casterGraphics.fillEllipse(centerX, shoulderY + 5, c.w * 0.9, c.h * 0.2);

        // Subtle breathing animation on the caster (chest expansion)
        const breathAmount = Math.sin(gameState.elapsedTime * 1.5) * 2;
        this.casterGraphics.fillStyle(0x2a2a4a, 0.4);
        this.casterGraphics.fillEllipse(centerX, c.y + c.h * 0.5, c.w * 0.4 + breathAmount, c.h * 0.15);
    }

    // --------------------------------------------------------
    // SHADOW LIFE - breathing, particles, eyes
    // --------------------------------------------------------

    updateShadowEffects(dt) {
        // Breathing phase
        playerState.breathPhase += dt * 0.8;

        // Update particles
        this.updateShadowParticles(dt);
    }

    updateShadowParticles(dt) {
        // Spawn new particles occasionally
        if (Math.random() < 0.15 && playerState.shadowPolygon.length > 2) {
            // Spawn within shadow near player
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 40;
            playerState.particles.push({
                x: playerState.position.x + Math.cos(angle) * dist,
                y: playerState.position.y + Math.sin(angle) * dist,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20 - 10, // slight upward drift
                life: 1.0,
                size: 2 + Math.random() * 3
            });
        }

        // Update existing particles
        for (let i = playerState.particles.length - 1; i >= 0; i--) {
            const p = playerState.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 0.5;

            // Particles drift toward player position
            const dx = playerState.position.x - p.x;
            const dy = playerState.position.y - p.y;
            p.vx += dx * 0.5 * dt;
            p.vy += dy * 0.5 * dt;

            if (p.life <= 0) {
                playerState.particles.splice(i, 1);
            }
        }

        // Limit particle count
        while (playerState.particles.length > 30) {
            playerState.particles.shift();
        }
    }

    updateEyeBlink(dt) {
        gameState.eyeBlinkTimer -= dt;

        if (gameState.eyeState === 'open' && gameState.eyeBlinkTimer <= 0) {
            // Start blink
            gameState.eyeState = 'closing';
            gameState.eyeBlinkTimer = 0.08;
        } else if (gameState.eyeState === 'closing' && gameState.eyeBlinkTimer <= 0) {
            gameState.eyeState = 'closed';
            gameState.eyeBlinkTimer = 0.1;
        } else if (gameState.eyeState === 'closed' && gameState.eyeBlinkTimer <= 0) {
            gameState.eyeState = 'opening';
            gameState.eyeBlinkTimer = 0.08;
        } else if (gameState.eyeState === 'opening' && gameState.eyeBlinkTimer <= 0) {
            gameState.eyeState = 'open';
            // Random time until next blink (2-6 seconds)
            gameState.eyeBlinkTimer = 2 + Math.random() * 4;
        }
    }

    drawShadowEyes() {
        // Draw eyes peering from the shadow
        const px = playerState.position.x;
        const py = playerState.position.y;

        // Eye openness based on blink state
        let eyeOpen = 1.0;
        if (gameState.eyeState === 'closing') {
            eyeOpen = gameState.eyeBlinkTimer / 0.08;
        } else if (gameState.eyeState === 'closed') {
            eyeOpen = 0;
        } else if (gameState.eyeState === 'opening') {
            eyeOpen = 1 - (gameState.eyeBlinkTimer / 0.08);
        }

        if (eyeOpen > 0.1) {
            const eyeSpacing = 8;
            const eyeY = py - 3;
            const eyeHeight = 4 * eyeOpen;

            // Left eye
            this.shadowGraphics.fillStyle(0x1a1a2e, 0.9);  // Background color peering through
            this.shadowGraphics.fillEllipse(px - eyeSpacing, eyeY, 5, eyeHeight);

            // Right eye
            this.shadowGraphics.fillEllipse(px + eyeSpacing, eyeY, 5, eyeHeight);

            // Subtle pupil/highlight (very faint)
            if (eyeOpen > 0.5) {
                this.shadowGraphics.fillStyle(0x3a3a5a, 0.6);
                this.shadowGraphics.fillCircle(px - eyeSpacing, eyeY, 1.5);
                this.shadowGraphics.fillCircle(px + eyeSpacing, eyeY, 1.5);
            }
        }
    }

    drawShadowParticles() {
        for (const p of playerState.particles) {
            // Particles are slightly lighter than pure black - wisps of self
            const alpha = p.life * 0.6;
            this.shadowGraphics.fillStyle(0x1a1a2e, alpha);
            this.shadowGraphics.fillCircle(p.x, p.y, p.size * p.life);
        }
    }

    drawExits() {
        // Clear old labels (only called on room load)
        this.exitLabels.forEach(label => label.destroy());
        this.exitLabels = [];

        // Create labels for exits
        for (const exit of roomState.exits) {
            if (exit.label) {
                const label = this.add.text(
                    exit.x + exit.w / 2,
                    exit.y - 25,
                    exit.label,
                    {fontFamily: 'Courier New', fontSize: '16px', color: '#5a5a7c'}
                ).setOrigin(0.5).setDepth(50);
                this.exitLabels.push(label);
            }
        }
    }

    renderExits() {
        this.exitGraphics.clear();

        for (const exit of roomState.exits) {
            // Different styling for ending exits
            if (exit.ending === 'dark') {
                // DARK exit - deeper black, subtle purple glow
                this.exitGraphics.fillStyle(0x000000, 1);
                this.exitGraphics.fillRect(exit.x, exit.y, exit.w, exit.h);

                // Pulsing purple border
                const pulse = 0.5 + Math.sin(gameState.elapsedTime * 2) * 0.3;
                this.exitGraphics.lineStyle(3, 0x2a1a4a, pulse);
                this.exitGraphics.strokeRect(exit.x - 1, exit.y - 1, exit.w + 2, exit.h + 2);

                // Dark motes sinking downward
                for (let i = 0; i < 4; i++) {
                    const moteX = exit.x + exit.w / 2 + Math.sin(gameState.elapsedTime * 0.3 + i * 1.5) * 4;
                    const moteY = exit.y + exit.h * 0.9 - (exit.h * 0.8) * ((gameState.elapsedTime * 0.1 + i * 0.25) % 1);
                    this.exitGraphics.fillStyle(0x1a1a2e, 0.8);
                    this.exitGraphics.fillCircle(moteX, moteY, 2);
                }
            } else if (exit.ending === 'light') {
                // LIGHT exit - bright, warm glow
                // Outer glow
                this.exitGraphics.fillStyle(0xfff9e6, 0.2);
                this.exitGraphics.fillRect(exit.x - 8, exit.y - 8, exit.w + 16, exit.h + 16);

                this.exitGraphics.fillStyle(0xfff9e6, 0.4);
                this.exitGraphics.fillRect(exit.x - 4, exit.y - 4, exit.w + 8, exit.h + 8);

                this.exitGraphics.fillStyle(0xfff9e6, 0.8);
                this.exitGraphics.fillRect(exit.x, exit.y, exit.w, exit.h);

                // Pulsing white border
                const pulse = 0.6 + Math.sin(gameState.elapsedTime * 2.5) * 0.4;
                this.exitGraphics.lineStyle(2, 0xffffff, pulse);
                this.exitGraphics.strokeRect(exit.x, exit.y, exit.w, exit.h);

                // Bright motes rising upward
                for (let i = 0; i < 4; i++) {
                    const moteX = exit.x + exit.w / 2 + Math.sin(gameState.elapsedTime * 0.6 + i * 1.5) * 4;
                    const moteY = exit.y + exit.h * 0.9 - (exit.h * 0.8) * ((gameState.elapsedTime * 0.2 + i * 0.25) % 1);
                    this.exitGraphics.fillStyle(0xffffff, 0.9);
                    this.exitGraphics.fillCircle(moteX, moteY, 2);
                }
            } else {
                // Regular exit
                this.exitGraphics.fillStyle(0x3a3a5c, 1);
                this.exitGraphics.fillRect(exit.x, exit.y, exit.w, exit.h);

                // Glowing border
                this.exitGraphics.lineStyle(2, 0x5a5a7c, 0.8);
                this.exitGraphics.strokeRect(exit.x, exit.y, exit.w, exit.h);

                // Draw floating motes inside exit (animated)
                for (let i = 0; i < 4; i++) {
                    const moteX = exit.x + exit.w / 2 + Math.sin(gameState.elapsedTime * 0.5 + i * 2) * 3;
                    const moteY = exit.y + exit.h * 0.1 + (exit.h * 0.8) * ((gameState.elapsedTime * 0.15 + i * 0.25) % 1);
                    this.exitGraphics.fillStyle(0x8a8aac, 0.6);
                    this.exitGraphics.fillCircle(moteX, moteY, 2);
                }
            }
        }
    }

    showHint() {
        if (gameState.hintShown || !this.hintText.text) return;
        gameState.hintShown = true;

        this.tweens.add({
            targets: this.hintText,
            alpha: 1,
            duration: CONFIG.timing.hintFadeIn
        });
    }

    showNarrative(text, duration = 4000) {
        if (!text) return;

        this.narrativeText.setText(text);
        this.narrativeText.setAlpha(0);

        this.tweens.add({
            targets: this.narrativeText,
            alpha: 1,
            duration: 1500,
            hold: duration,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    // --------------------------------------------------------
    // PAUSE
    // --------------------------------------------------------

    togglePause() {
        if (gameState.phase !== 'playing') return;

        gameState.isPaused = !gameState.isPaused;
        this.pauseOverlay.setVisible(gameState.isPaused);
        this.pauseText.setVisible(gameState.isPaused);
        this.pauseSubtext.setVisible(gameState.isPaused);
    }

    restartRoom() {
        if (gameState.phase !== 'playing') return;

        // Brief flash
        const flash = this.add.rectangle(
            CONFIG.width / 2, CONFIG.height / 2,
            CONFIG.width, CONFIG.height,
            0xffffff, 0
        ).setDepth(200);

        this.tweens.add({
            targets: flash,
            alpha: 1,
            duration: 200,
            yoyo: true,
            onComplete: () => {
                flash.destroy();
            }
        });

        this.loadRoom(gameState.currentRoom);
    }

    resetGameState() {
        gameState = {
            currentRoom: 0,
            phase: 'playing',
            elapsedTime: 0,
            roomStartTime: 0,
            isPaused: false,
            hintShown: false
        };
    }

    // --------------------------------------------------------
    // AUDIO
    // --------------------------------------------------------

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Resume audio context on user interaction
            this.input.once('pointerdown', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                this.startAmbient();
            });
        } catch (e) {
            console.log('Web Audio not available');
        }
    }

    startAmbient() {
        if (!this.audioContext) return;
        const ctx = this.audioContext;

        // Deep chord: C2, G2, C3
        const frequencies = [65.4, 98, 130.8];
        this.ambientOscs = [];

        for (const freq of frequencies) {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            gain.gain.value = 0.04;

            osc.connect(gain).connect(ctx.destination);
            osc.start();
            this.ambientOscs.push({osc, gain});
        }
    }

    startDragSound() {
        if (!this.audioContext || this.audioContext.state === 'suspended') return;
        const ctx = this.audioContext;

        this.dragOsc = ctx.createOscillator();
        this.dragOsc.type = 'sine';
        this.dragOsc.frequency.value = 330;

        this.dragGain = ctx.createGain();
        this.dragGain.gain.setValueAtTime(0, ctx.currentTime);
        this.dragGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);

        this.dragOsc.connect(this.dragGain).connect(ctx.destination);
        this.dragOsc.start();
    }

    updateDragSound(y) {
        if (!this.dragOsc) return;
        const freq = 220 + (1 - y / CONFIG.height) * 220;
        this.dragOsc.frequency.value = freq;
    }

    stopDragSound() {
        if (!this.dragGain || !this.dragOsc || !this.audioContext) return;
        const ctx = this.audioContext;

        this.dragGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        const osc = this.dragOsc;
        setTimeout(() => {
            try {
                osc.stop();
            } catch (e) {}
        }, 200);
        this.dragOsc = null;
        this.dragGain = null;
    }

    playRoomCompleteSound() {
        if (!this.audioContext || this.audioContext.state === 'suspended') return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const notes = [261.6, 329.6, 392, 523.2];

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.35);

            osc.connect(gain).connect(ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.4);
        });
    }

    playEndingSound(type) {
        if (!this.audioContext || this.audioContext.state === 'suspended') return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Stop ambient
        if (this.ambientOscs) {
            this.ambientOscs.forEach(({osc, gain}) => {
                gain.gain.linearRampToValueAtTime(0, now + 2);
                setTimeout(() => { try { osc.stop(); } catch(e) {} }, 2000);
            });
            this.ambientOscs = [];
        }

        if (type === 'dark') {
            // Warm, enveloping minor chord - settling into darkness
            // C2, Eb3, G3, Bb3 (C minor 7)
            const notes = [65.4, 155.6, 196, 233.1];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = i < 2 ? 'triangle' : 'sine';
                osc.frequency.value = freq;

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.06 - i * 0.01, now + 1.5);
                gain.gain.linearRampToValueAtTime(0.04 - i * 0.008, now + 4);
                gain.gain.linearRampToValueAtTime(0, now + 7);

                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.3);
                osc.stop(now + 7);
            });
        } else {
            // Bright, ascending major chord - dissolving into light
            // C4, E4, G4, C5 (rising)
            const notes = [261.6, 329.6, 392, 523.2];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                // Slight upward pitch drift
                osc.frequency.linearRampToValueAtTime(freq * 1.02, now + 6);

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0, now + i * 0.4);
                gain.gain.linearRampToValueAtTime(0.1 - i * 0.015, now + i * 0.4 + 1);
                gain.gain.linearRampToValueAtTime(0, now + 6);

                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.4);
                osc.stop(now + 7);
            });

            // Add shimmer
            for (let i = 0; i < 3; i++) {
                const shimmer = ctx.createOscillator();
                shimmer.type = 'sine';
                shimmer.frequency.value = 800 + i * 200;

                const shimmerGain = ctx.createGain();
                shimmerGain.gain.setValueAtTime(0, now + 2);
                shimmerGain.gain.linearRampToValueAtTime(0.02, now + 3);
                shimmerGain.gain.linearRampToValueAtTime(0, now + 5);

                shimmer.connect(shimmerGain).connect(ctx.destination);
                shimmer.start(now + 2);
                shimmer.stop(now + 5);
            }
        }
    }

    playWallPassSound() {
        if (!this.audioContext || this.audioContext.state === 'suspended') return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Ethereal whoosh - frequency sweep
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.8);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1);

        // Add shimmer
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(600, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.05, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.5);
    }

    updateShadowAudio() {
        if (!this.ambientOscs || this.ambientOscs.length === 0) return;
        if (!this.audioContext || this.audioContext.state === 'suspended') return;

        // Modulate ambient based on shadow length
        // Longer shadow = deeper, more resonant
        // Shorter shadow = higher, tighter
        const shadowNorm = Math.min(playerState.shadowLength / 400, 1);
        const pitchMod = 1 - shadowNorm * 0.3; // 0.7 to 1.0

        const baseFreqs = [65.4, 98, 130.8];
        for (let i = 0; i < this.ambientOscs.length; i++) {
            const target = baseFreqs[i] * pitchMod;
            this.ambientOscs[i].osc.frequency.setTargetAtTime(
                target,
                this.audioContext.currentTime,
                0.5
            );
        }
    }
}

// ============================================================
// PHASER INITIALIZATION
// ============================================================

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: CONFIG.width,
    height: CONFIG.height,
    backgroundColor: CONFIG.backgroundColor,
    parent: 'game-container',
    scene: [GameScene]
});
