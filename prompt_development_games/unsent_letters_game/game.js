/* Unsent Letters: Palimpsest Desk
   Phaser 3 prototype per design spec.
*/

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const DURATION = 300;
const MAX_ACTIVE = 6;
const PEEK_OPEN_DELAY = 0.12;

const LANE = { x1: 240, x2: 1040, yTop: 140, yBottom: 460 };
const SHREDDER_Y = 460;

const CATEGORIES = ["APOLOGY", "GRATITUDE", "JOY", "ANGER", "FEAR"];
const CATEGORY_KEYS = {
    1: "APOLOGY",
    2: "GRATITUDE",
    3: "JOY",
    4: "ANGER",
    5: "FEAR"
};
const CATEGORY_COLORS = {
    APOLOGY: 0x6d9bb8,
    GRATITUDE: 0x7fa46b,
    JOY: 0xd1a34f,
    ANGER: 0xb24c4c,
    FEAR: 0x6b5b8f
};

const HONEST_OPENINGS = {
    APOLOGY: [
        "I need to say this plainly.",
        "I keep replaying it.",
        "This has been sitting with me.",
        "I owe you an honest note."
    ],
    GRATITUDE: [
        "I wanted you to know.",
        "I meant what I said.",
        "This is a real thank you.",
        "I kept thinking about this."
    ],
    JOY: [
        "I can finally share this.",
        "I had to tell someone.",
        "This made my whole week.",
        "I am smiling as I write."
    ],
    ANGER: [
        "I cannot let this go.",
        "I am writing because it matters.",
        "I need you to hear me.",
        "I am still angry."
    ],
    FEAR: [
        "I am scared to send this.",
        "Please take this seriously.",
        "I do not feel safe.",
        "I need help with something."
    ]
};

const HONEST_KEYLINES = {
    APOLOGY: [
        "I was wrong and I knew it.",
        "I hurt you and I regret it.",
        "I should have handled it differently.",
        "I let my pride lead."
    ],
    GRATITUDE: [
        "Your kindness stayed with me.",
        "You made a hard week easier.",
        "I felt seen because of you.",
        "I will not forget what you did."
    ],
    JOY: [
        "Something good finally happened.",
        "I feel light for the first time.",
        "I am proud of myself.",
        "I want to share this joy."
    ],
    ANGER: [
        "That crossed a line.",
        "I felt small because of it.",
        "I need accountability.",
        "I am setting a boundary."
    ],
    FEAR: [
        "I am worried about what comes next.",
        "I cannot shake this feeling.",
        "I keep looking over my shoulder.",
        "I do not know who else to tell."
    ]
};

const HONEST_CLOSINGS = {
    APOLOGY: ["—I am sorry.", "—I will do better.", "—Please forgive me.", "—I mean this."],
    GRATITUDE: ["—Thank you.", "—With love.", "—Truly.", "—I appreciate you."],
    JOY: ["—Let me have this.", "—I am happy.", "—It is real.", "—Sharing this."],
    ANGER: ["—Hear me.", "—This matters.", "—I need change.", "—No more."],
    FEAR: ["—Please respond.", "—I am scared.", "—Help me.", "—Please."]
};

const MASK_OPENINGS = {
    ANGER: ["Just so we're clear.", "I’m not upset.", "This is fine.", "Whatever."],
    JOY: ["Funny thing.", "No big deal.", "You’ll laugh at this.", "Just a quick note."],
    GRATITUDE: ["Anyway—thanks, I guess.", "Sure, appreciate it.", "Noted.", "Okay, thanks."],
    APOLOGY: ["If that bothered you…", "Sorry you took it that way.", "My bad, maybe.", "I didn’t mean it, technically."],
    FEAR: ["Probably nothing.", "Ignore this.", "I’m overthinking.", "It’s fine, it’s fine."]
};

const MASK_KEYLINES = {
    ANGER: [
        "I’m just being honest.",
        "Don’t make this dramatic.",
        "You always do this.",
        "I’m tired of explaining basics.",
        "I shouldn’t have to ask twice."
    ],
    JOY: [
        "It’s kind of hilarious, actually.",
        "I guess something good happened.",
        "No reason, I’m just in a mood.",
        "I’m not attached to the outcome.",
        "Just sharing, whatever."
    ],
    GRATITUDE: [
        "You did what anyone would do.",
        "I noticed. That’s all.",
        "Consider it acknowledged.",
        "Don’t let it go to your head.",
        "You’re not the worst."
    ],
    APOLOGY: [
        "Let’s just move on.",
        "I don’t want to talk about it.",
        "I said what I said.",
        "I’m not changing my mind.",
        "Anyway, it’s in the past."
    ],
    FEAR: [
        "It’s nothing, probably.",
        "I’m being stupid.",
        "I didn’t sleep much.",
        "I’m sure it’ll sort itself out.",
        "I shouldn’t have written this."
    ]
};

const MASK_CLOSINGS = {
    ANGER: ["—Whatever.", "—Done.", "—Don’t reply.", "—I’m fine."],
    JOY: ["—lol", "—anyway", "—so yeah", "—just saying"],
    GRATITUDE: ["—k", "—noted", "—fine", "—sure"],
    APOLOGY: ["—moving on", "—end of discussion", "—forget it", "—ok"],
    FEAR: ["—ignore me", "—sorry", "—forget this", "—never mind"]
};

const CORE_OPENINGS = {
    APOLOGY: [
        "I can’t keep dodging this.",
        "I need to own it.",
        "I owe you more than a shrug.",
        "I’m scared to write this honestly."
    ],
    GRATITUDE: [
        "I meant it when I said thank you.",
        "I don’t say it enough.",
        "This is me trying to be real.",
        "I’m embarrassed by how much it meant."
    ],
    JOY: [
        "I want to share this without pretending it’s small.",
        "This matters to me.",
        "I’m letting myself be happy.",
        "I needed one good thing."
    ],
    ANGER: [
        "I’m angry because I’m hurt.",
        "I’m not okay with what happened.",
        "I need you to hear me.",
        "I’m done swallowing this."
    ],
    FEAR: [
        "I’m afraid and I don’t know who else to tell.",
        "I think I’m in danger.",
        "Please take this seriously.",
        "I’m trying not to panic."
    ]
};

const CORE_KEYLINES = {
    APOLOGY: [
        "I was wrong and I knew it in the moment.",
        "I’m sorry for the specific thing I did.",
        "I hurt you to protect my pride.",
        "I keep replaying it and hating myself.",
        "If you need space, I’ll respect it."
    ],
    GRATITUDE: [
        "You made me feel safe.",
        "I didn’t deserve your patience, but you gave it.",
        "I carry your kindness with me.",
        "Thank you for choosing me when you didn’t have to.",
        "You changed my week, maybe my life."
    ],
    JOY: [
        "I got what I wanted and I’m shaking.",
        "I’m proud of myself for once.",
        "I want you to be happy for me.",
        "I feel light again.",
        "I think things can improve."
    ],
    ANGER: [
        "You crossed a line and it matters.",
        "I felt small because of you.",
        "I need accountability, not excuses.",
        "I won’t accept this pattern again.",
        "I’m setting a boundary."
    ],
    FEAR: [
        "Something is watching my door at night.",
        "I don’t feel safe going home.",
        "If I vanish, this is why.",
        "Please don’t leave me alone in this.",
        "I need help."
    ]
};

const CORE_CLOSINGS = {
    APOLOGY: ["—I’m sorry.", "—I’ll do better.", "—I mean this.", "—I’m owning it."],
    GRATITUDE: ["—Thank you.", "—Truly.", "—With love.", "—I won’t forget."],
    JOY: ["—Let me have this.", "—I’m smiling.", "—It’s real.", "—Share it with me."],
    ANGER: ["—I need change.", "—This is a boundary.", "—Hear me.", "—No more."],
    FEAR: ["—Please respond.", "—Please.", "—I’m scared.", "—Help me."]
};

const STORY_QUEUE = [
    {
        triggerAtSecond: 12,
        surfaceCategory: "ANGER",
        trueCategory: "FEAR",
        surfaceLines: ["Mira—", "Don’t make this dramatic.", "—J"],
        trueLines: ["Mira—", "I don’t feel safe going home.", "—J"],
        tag: "s1"
    },
    {
        triggerAtSecond: 34,
        surfaceCategory: "JOY",
        trueCategory: "APOLOGY",
        surfaceLines: ["Jonah,", "It’s kind of hilarious, actually.", "—M"],
        trueLines: ["Jonah,", "I was wrong and I knew it in the moment.", "—M"],
        tag: "s2"
    },
    {
        triggerAtSecond: 58,
        surfaceCategory: "GRATITUDE",
        trueCategory: "GRATITUDE",
        surfaceLines: ["To the keeper,", "Consider it acknowledged.", "—M"],
        trueLines: ["To the keeper,", "You made me feel safe.", "—M"],
        tag: "s3"
    },
    {
        triggerAtSecond: 82,
        surfaceCategory: "APOLOGY",
        trueCategory: "ANGER",
        surfaceLines: ["Mira—", "Let’s just move on.", "—J"],
        trueLines: ["Mira—", "You crossed a line and it matters.", "—J"],
        tag: "s4"
    },
    {
        triggerAtSecond: 108,
        surfaceCategory: "FEAR",
        trueCategory: "FEAR",
        surfaceLines: ["Mira,", "I’m overthinking.", "—J"],
        trueLines: ["Mira,", "Something is watching my door at night.", "—J"],
        tag: "s5"
    },
    {
        triggerAtSecond: 136,
        surfaceCategory: "ANGER",
        trueCategory: "APOLOGY",
        surfaceLines: ["Jonah—", "You always do this.", "—M"],
        trueLines: ["Jonah—", "I hurt you to protect my pride.", "—M"],
        tag: "s6"
    },
    {
        triggerAtSecond: 168,
        surfaceCategory: "JOY",
        trueCategory: "JOY",
        surfaceLines: ["Mira!", "No reason, I’m just in a mood.", "—J"],
        trueLines: ["Mira!", "I’m proud of myself for once.", "—J"],
        tag: "s7"
    },
    {
        triggerAtSecond: 202,
        surfaceCategory: "GRATITUDE",
        trueCategory: "FEAR",
        surfaceLines: ["Jonah,", "You did what anyone would do.", "—M"],
        trueLines: ["Jonah,", "Please don’t leave me alone in this.", "—M"],
        tag: "s8"
    },
    {
        triggerAtSecond: 236,
        surfaceCategory: "APOLOGY",
        trueCategory: "GRATITUDE",
        surfaceLines: ["Mira—", "I don’t want to talk about it.", "—J"],
        trueLines: ["Mira—", "Thank you for choosing me when you didn’t have to.", "—J"],
        tag: "s9"
    },
    {
        triggerAtSecond: 272,
        surfaceCategory: "FEAR",
        trueCategory: "JOY",
        surfaceLines: ["(unsent)", "Ignore this.", "—"],
        trueLines: ["(unsent)", "I think things can improve.", "—"],
        tag: "s10"
    }
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const randBetween = (min, max) => Phaser.Math.FloatBetween(min, max);
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.context = null;
        this.master = null;
        this.loops = {};
        this.uvHum = null;
    }

    ensure() {
        if (this.context) {
            if (this.context.state === "suspended") {
                this.context.resume();
            }
            return;
        }
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioCtx();
        this.master = this.context.createGain();
        this.master.gain.value = 0.12;
        this.master.connect(this.context.destination);

        this.loops.cold = this.createLoop(110, 0.0);
        this.loops.neutral = this.createLoop(160, 0.0);
        this.loops.warm = this.createLoop(220, 0.0);

        this.uvHum = this.createLoop(300, 0.0, true);
    }

    createLoop(freq, gainValue, isHum = false) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = isHum ? "sine" : "triangle";
        osc.frequency.value = freq;
        gain.gain.value = gainValue;
        osc.connect(gain);
        gain.connect(this.master);
        osc.start();
        return { osc, gain };
    }

    setHarmonyMix(harmony) {
        if (!this.context) return;
        const warm = clamp((harmony - 40) / 60, 0, 1);
        const cold = clamp((40 - harmony) / 40, 0, 1);
        const neutral = 1 - Math.abs((harmony - 50) / 50);
        this.loops.cold.gain.gain.value = 0.08 * cold;
        this.loops.neutral.gain.gain.value = 0.08 * neutral;
        this.loops.warm.gain.gain.value = 0.08 * warm;
    }

    setUvHum(on) {
        if (!this.context) return;
        this.uvHum.gain.gain.value = on ? 0.2 : 0;
    }

    playBeep(freq, duration = 0.18, gainValue = 0.25) {
        if (!this.context) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.value = gainValue;
        osc.connect(gain);
        gain.connect(this.master);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
        osc.stop(this.context.currentTime + duration + 0.05);
    }
}

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    create() {
        this.scene.start("PreloadScene");
    }
}

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    create() {
        this.scene.start("MenuScene");
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: "MenuScene" });
    }

    create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor(0x1a1410);

        this.add.text(width / 2, height / 3, "UNSENT LETTERS", {
            fontFamily: "Georgia, serif",
            fontSize: "64px",
            color: "#f3e7d4"
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 3 + 60, "PALIMPSEST DESK", {
            fontFamily: "Georgia, serif",
            fontSize: "20px",
            color: "#c4b39c",
            letterSpacing: 4
        }).setOrigin(0.5);

        const instructions = [
            "Letters slide toward the shredder.",
            "Hold mouse or SPACE to peek.",
            "Hold E to shine the UV lamp (battery drains).",
            "Drag into folders or press 1-5.",
            "Sort by true intent when you can.",
            "Watch the thread markers fill in."
        ];

        this.add.text(width / 2, height / 2 + 10, instructions.join("\n"), {
            fontFamily: "Georgia, serif",
            fontSize: "20px",
            color: "#e2d6c2",
            align: "center",
            lineSpacing: 10
        }).setOrigin(0.5);

        const startText = this.add.text(width / 2, height * 0.8, "Click or press ENTER to begin", {
            fontFamily: "Georgia, serif",
            fontSize: "22px",
            color: "#f3e7d4"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            yoyo: true,
            repeat: -1,
            duration: 900
        });

        this.input.keyboard.once("keydown-ENTER", () => this.startGame());
        this.input.once("pointerdown", () => this.startGame());
    }

    startGame() {
        this.scene.start("GameScene");
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: "GameScene" });
        this.letters = [];
        this.storyIndex = 0;
    }

    create() {
        this.elapsed = 0;
        this.timeLeft = DURATION;
        this.spawnAcc = 0;
        this.filedCorrectTrue = 0;
        this.filedCorrectSurfaceOnly = 0;
        this.filedWrong = 0;
        this.missed = 0;
        this.harmony = 20;
        this.static = 10;
        this.uvBattery = 70;
        this.pointerHoldLetter = null;
        this.pointerHoldTime = 0;
        this.lastClickedLetter = null;
        this.gameEnded = false;
        this.storyTrack = [];
        this.storyResolved = new Map();
        this.shakeCooldown = 0;

        this.audioManager = new AudioManager(this);

        this.buildBackground();
        this.buildLane();
        this.buildFolders();
        this.buildHud();
        this.buildStoryTrack();
        this.buildOverlays();
        this.setupInput();
    }

    buildBackground() {
        const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x2c2017);
        bg.setDepth(-10);

        const deskEdge = this.add.rectangle(GAME_WIDTH / 2, 660, GAME_WIDTH, 120, 0x20150f, 0.9);
        deskEdge.setDepth(-9);

        const lampBase = this.add.rectangle(1100, 110, 140, 28, 0x3b2b20, 1);
        lampBase.setDepth(-8);
        const lampNeck = this.add.rectangle(1100, 70, 12, 70, 0x4a3829, 1);
        lampNeck.setDepth(-8);
        const lampHead = this.add.rectangle(1100, 30, 120, 26, 0x5b4634, 1);
        lampHead.setDepth(-8);

        this.uvCone = this.add.triangle(1100, 140, 0, 0, 200, 0, 100, 260, 0x8b5bff, 0.15);
        this.uvCone.setDepth(5);
        this.uvCone.setVisible(false);

        const grain = this.add.graphics();
        grain.fillStyle(0x3b2b1f, 0.2);
        for (let i = 0; i < 120; i += 1) {
            grain.fillRect(randBetween(0, GAME_WIDTH), randBetween(0, GAME_HEIGHT), 6, 2);
        }
        grain.setDepth(-9);

        const coffeeRing = this.add.circle(200, 560, 45, 0x3c2a1f, 0.18);
        coffeeRing.setStrokeStyle(2, 0x3c2a1f, 0.2);
        coffeeRing.setDepth(-8);
    }

    buildLane() {
        const lane = this.add.rectangle(
            (LANE.x1 + LANE.x2) / 2,
            (LANE.yTop + LANE.yBottom) / 2,
            LANE.x2 - LANE.x1,
            LANE.yBottom - LANE.yTop,
            0x3e2d20,
            0.5
        );
        lane.setStrokeStyle(2, 0x6b4f3a, 1);

        const shredder = this.add.rectangle(
            (LANE.x1 + LANE.x2) / 2,
            SHREDDER_Y,
            LANE.x2 - LANE.x1,
            28,
            0x8b2e2e,
            0.8
        );
        shredder.setStrokeStyle(1, 0x581a1a, 1);

        this.add.text((LANE.x1 + LANE.x2) / 2, SHREDDER_Y - 10, "SHREDDER", {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: "#f3d0d0"
        }).setOrigin(0.5);
    }

    buildFolders() {
        this.folderZones = [];
        const labels = ["APOLOGY", "GRATITUDE", "JOY", "ANGER", "FEAR"]; 
        const colors = [0x6d9bb8, 0x7fa46b, 0xd1a34f, 0xb24c4c, 0x6b5b8f];
        const startX = 160;
        const gap = 220;
        for (let i = 0; i < 5; i += 1) {
            const x = startX + gap * i;
            const y = 610;
            const bin = this.add.rectangle(x, y, 180, 90, colors[i], 0.9);
            bin.setStrokeStyle(2, 0x2a1c14, 1);
            const tab = this.add.rectangle(x - 60, y - 52, 56, 14, 0xf2e9dc, 1);
            tab.setStrokeStyle(1, 0x2a1c14, 1);
            this.add.text(x, y - 18, labels[i], {
                fontFamily: "Georgia, serif",
                fontSize: "16px",
                color: "#1a120c"
            }).setOrigin(0.5);
            this.add.text(x, y + 18, `Key ${i + 1}`, {
                fontFamily: "Georgia, serif",
                fontSize: "14px",
                color: "#1a120c"
            }).setOrigin(0.5);

            const rect = new Phaser.Geom.Rectangle(x - 90, y - 45, 180, 90);
            this.folderZones.push({ category: labels[i], rect });
        }
    }

    buildHud() {
        this.timerText = this.add.text(30, 20, "05:00", {
            fontFamily: "Georgia, serif",
            fontSize: "28px",
            color: "#f3e7d4"
        });

        this.countText = this.add.text(30, 58, "", {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: "#eadbc4"
        });

        this.meterText = this.add.text(30, 96, "", {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: "#eadbc4"
        });

        this.instructionsText = this.add.text(920, 20, "Hold mouse/SPACE to peek\nHold E for UV\nDrag or press 1-5", {
            fontFamily: "Georgia, serif",
            fontSize: "14px",
            color: "#d9c8af",
            align: "right"
        });

        this.uvBarOutline = this.add.rectangle(920, 94, 300, 18, 0x000000, 0);
        this.uvBarOutline.setStrokeStyle(1, 0xcbb9a3, 1);
        this.uvBarFill = this.add.rectangle(770, 94, 0, 14, 0xb072d4, 0.8).setOrigin(0, 0.5);
        this.uvBarLabel = this.add.text(920, 116, "UV LAMP", {
            fontFamily: "Georgia, serif",
            fontSize: "12px",
            color: "#cbb9a3"
        }).setOrigin(0.5, 0);
    }

    buildStoryTrack() {
        const startX = 940;
        const startY = 160;
        this.add.text(startX - 40, startY - 18, "THREAD", {
            fontFamily: "Georgia, serif",
            fontSize: "12px",
            color: "#cbb9a3"
        });
        for (let i = 0; i < STORY_QUEUE.length; i += 1) {
            const x = startX + (i % 5) * 60;
            const y = startY + Math.floor(i / 5) * 34;
            const node = this.add.circle(x, y, 10, 0x5a4a3b, 0.6);
            node.setStrokeStyle(1, 0xd7c6ad, 0.6);
            this.storyTrack.push(node);
        }
    }

    buildOverlays() {
        this.noiseOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xb9b2ad, 0);
        this.noiseOverlay.setDepth(20);
        this.warmOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffb86b, 0);
        this.warmOverlay.setDepth(19);
        this.focusGlow = this.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 120, 0xf3e7d4, 0);
        this.focusGlow.setDepth(6);
    }

    setupInput() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.uvKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.input.on("pointerdown", (pointer, objects) => {
            this.audioManager.ensure();
            if (!objects.length) {
                return;
            }
            const target = objects[0];
            const letter = target.getData("letter");
            if (!letter) return;
            this.lastClickedLetter = letter;
            this.pointerHoldLetter = letter;
            this.pointerHoldTime = 0;
        });

        this.input.on("pointerup", () => {
            if (this.pointerHoldLetter) {
                this.pointerHoldLetter.openByPointer = false;
            }
            this.pointerHoldLetter = null;
            this.pointerHoldTime = 0;
        });

        this.input.on("dragstart", (pointer, gameObject) => {
            const letter = gameObject.getData("letter");
            if (!letter) return;
            letter.isDragging = true;
            letter.openByPointer = false;
            letter.openByKey = false;
            letter.updateOpen(false);
        });

        this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
            const letter = gameObject.getData("letter");
            if (!letter) return;
            letter.container.x = dragX;
            letter.container.y = dragY;
            letter.container.setDepth(dragY);
        });

        this.input.on("dragend", (pointer, gameObject) => {
            const letter = gameObject.getData("letter");
            if (!letter) return;
            letter.isDragging = false;
            const dropCategory = this.getDropCategory(pointer.x, pointer.y);
            if (dropCategory) {
                this.fileLetter(letter, dropCategory);
            }
        });

        this.input.keyboard.on("keydown", (event) => {
            this.audioManager.ensure();
            const key = parseInt(event.key, 10);
            if (key >= 1 && key <= 5) {
                const category = CATEGORY_KEYS[key];
                const letter = this.getSelectedLetter();
                if (letter && !letter.isDragging) {
                    this.fileLetter(letter, category);
                }
            }
        });
    }

    getSelectedLetter() {
        if (this.lastClickedLetter && this.letters.includes(this.lastClickedLetter)) {
            if (!this.lastClickedLetter.isDragging) {
                return this.lastClickedLetter;
            }
        }
        let best = null;
        for (const letter of this.letters) {
            if (letter.isDragging) continue;
            if (!best || letter.container.y > best.container.y) {
                best = letter;
            }
        }
        return best;
    }

    getDropCategory(x, y) {
        for (const zone of this.folderZones) {
            if (Phaser.Geom.Rectangle.Contains(zone.rect, x, y)) {
                return zone.category;
            }
        }
        return null;
    }

    update(time, deltaMs) {
        if (this.gameEnded) return;
        const delta = deltaMs / 1000;
        this.elapsed += delta;
        this.timeLeft = Math.max(0, DURATION - this.elapsed);

        this.handlePeek(delta);
        this.handleUv(delta);
        this.handleSpawn(delta);
        this.handleMovement(delta);
        this.updateHud();
        this.updateOverlays(delta);

        if (this.timeLeft === 0) {
            this.endGame();
        }
    }

    handlePeek(delta) {
        if (this.pointerHoldLetter && this.pointerHoldLetter.isDragging) {
            this.pointerHoldLetter = null;
            this.pointerHoldTime = 0;
        }
        if (this.pointerHoldLetter && this.input.activePointer.isDown) {
            this.pointerHoldTime += delta;
            if (this.pointerHoldTime >= PEEK_OPEN_DELAY) {
                this.pointerHoldLetter.openByPointer = true;
            }
        }

        const selected = this.getSelectedLetter();
        for (const letter of this.letters) {
            if (letter === selected && this.spaceKey.isDown && !letter.isDragging) {
                letter.openByKey = true;
            } else {
                letter.openByKey = false;
            }
            const shouldOpen = letter.openByKey || letter.openByPointer;
            letter.updateOpen(shouldOpen);
        }
    }

    handleUv(delta) {
        const anyOpen = this.letters.some((letter) => letter.isOpen);
        let uvShouldBeOn = this.uvKey.isDown && anyOpen && this.uvBattery > 0;

        if (uvShouldBeOn) {
            this.uvBattery -= 22 * delta;
            if (this.uvBattery <= 0) {
                this.uvBattery = 0;
                uvShouldBeOn = false;
            }
        } else {
            this.uvBattery += 10 * delta;
            this.uvBattery = clamp(this.uvBattery, 0, 100);
        }

        for (const letter of this.letters) {
            if (!letter.isOpen) {
                continue;
            }
            if (uvShouldBeOn) {
                letter.showTrueLayer();
            } else {
                letter.showSurfaceLayer();
            }
        }

        this.audioManager.setUvHum(uvShouldBeOn);
        this.uvCone.setVisible(uvShouldBeOn);
        this.uvCone.setAlpha(uvShouldBeOn ? 0.15 + Math.sin(this.elapsed * 6) * 0.03 : 0);
    }

    handleSpawn(delta) {
        this.spawnAcc += delta;
        const interval = clamp(4.6 - (this.elapsed / 300) * 1.6, 2.8, 4.6);
        if (this.timeLeft > 0 && this.letters.length < MAX_ACTIVE && this.spawnAcc >= interval) {
            this.spawnAcc = 0;
            this.spawnLetter();
        }
    }

    handleMovement(delta) {
        for (const letter of [...this.letters]) {
            if (letter.isDragging) continue;
            letter.container.y += letter.speed * delta;
            const sway = Math.sin((this.elapsed + letter.swayPhase) * letter.swaySpeed) * letter.swayAmount;
            letter.container.x = clamp(letter.container.x + sway * delta, LANE.x1 + 120, LANE.x2 - 120);
            letter.container.setDepth(letter.container.y);
            if (letter.container.y >= SHREDDER_Y) {
                this.handleMissed(letter);
            }
        }
    }

    updateHud() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60).toString().padStart(2, "0");
        this.timerText.setText(`${minutes}:${seconds}`);

        this.countText.setText(
            `True: ${this.filedCorrectTrue}  Surface: ${this.filedCorrectSurfaceOnly}  Wrong: ${this.filedWrong}  Missed: ${this.missed}`
        );
        this.meterText.setText(`Harmony: ${Math.round(this.harmony)}   Static: ${Math.round(this.static)}`);

        const barWidth = 300 * (this.uvBattery / 100);
        this.uvBarFill.width = barWidth;
    }

    updateOverlays(delta) {
        const noiseAlpha = lerp(0, 0.35, clamp((this.static - 35) / 65, 0, 1));
        const warmAlpha = clamp((this.harmony - 40) / 60, 0, 1) * 0.25;
        this.noiseOverlay.setAlpha(noiseAlpha);
        this.warmOverlay.setAlpha(warmAlpha);
        const selected = this.getSelectedLetter();
        if (selected && selected.isOpen) {
            this.focusGlow.setPosition(selected.container.x, selected.container.y);
            const glowAlpha = selected.showingTrue ? 0.18 : 0.12;
            this.focusGlow.setAlpha(glowAlpha);
        } else {
            this.focusGlow.setAlpha(0);
        }
        if (this.static > 70 && this.shakeCooldown <= 0) {
            this.cameras.main.shake(200, 0.002 + (this.static - 70) * 0.00005);
            this.shakeCooldown = 1.2;
        }
        this.shakeCooldown = Math.max(0, this.shakeCooldown - delta);
        this.audioManager.setHarmonyMix(this.harmony);
    }

    spawnLetter() {
        let data = null;
        if (this.storyIndex < STORY_QUEUE.length && this.elapsed >= STORY_QUEUE[this.storyIndex].triggerAtSecond) {
            const d = STORY_QUEUE[this.storyIndex];
            const storySlot = this.storyIndex;
            this.storyIndex += 1;
            data = {
                id: `story_${d.tag}`,
                isStory: true,
                isDoubleLayer: true,
                storySlot,
                surfaceCategory: d.surfaceCategory,
                trueCategory: d.trueCategory,
                surfaceLines: d.surfaceLines,
                trueLines: d.trueLines,
                speed: randBetween(55, 75)
            };
        } else {
            const chance = clamp(0.15 + this.static / 120, 0.15, 0.75);
            const roll = Math.random();
            if (roll < chance) {
                const trueCat = randPick(CATEGORIES);
                const surfaceCat = randPick(CATEGORIES.filter((c) => c !== trueCat));
                data = {
                    id: `gen_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
                    isStory: false,
                    isDoubleLayer: true,
                    storySlot: null,
                    surfaceCategory: surfaceCat,
                    trueCategory: trueCat,
                    surfaceLines: this.generateMaskLines(surfaceCat),
                    trueLines: this.generateCoreLines(trueCat),
                    speed: randBetween(60, 90)
                };
            } else {
                const cat = randPick(CATEGORIES);
                const lines = this.generateHonestLines(cat);
                data = {
                    id: `gen_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
                    isStory: false,
                    isDoubleLayer: false,
                    storySlot: null,
                    surfaceCategory: cat,
                    trueCategory: cat,
                    surfaceLines: lines,
                    trueLines: lines,
                    speed: randBetween(60, 90)
                };
            }
        }

        const x = randBetween(520, 760);
        const y = 110;
        const letter = this.createLetter(x, y, data);
        this.letters.push(letter);
    }

    generateHonestLines(cat) {
        return [
            randPick(HONEST_OPENINGS[cat]),
            randPick(HONEST_KEYLINES[cat]),
            randPick(HONEST_CLOSINGS[cat])
        ];
    }

    generateMaskLines(cat) {
        return [
            randPick(MASK_OPENINGS[cat]),
            randPick(MASK_KEYLINES[cat]),
            randPick(MASK_CLOSINGS[cat])
        ];
    }

    generateCoreLines(cat) {
        return [
            randPick(CORE_OPENINGS[cat]),
            randPick(CORE_KEYLINES[cat]),
            randPick(CORE_CLOSINGS[cat])
        ];
    }

    createLetter(x, y, data) {
        const container = this.add.container(x, y);
        container.setSize(240, 160);
        container.setInteractive(new Phaser.Geom.Rectangle(-120, -80, 240, 160), Phaser.Geom.Rectangle.Contains);

        const glow = this.add.rectangle(0, 0, 252, 172, 0x8b5bff, 0.25).setVisible(false);
        const truePanel = this.add.rectangle(0, 0, 220, 140, 0xd9c6f0, 0.96).setVisible(false);
        truePanel.setStrokeStyle(2, 0x7650b8, 1);
        const surfacePanel = this.add.rectangle(0, 0, 220, 140, 0xfaf4e6, 0.98).setVisible(false);
        surfacePanel.setStrokeStyle(2, 0xb8a389, 1);
        const stamp = this.add.rectangle(78, -52, 36, 20, CATEGORY_COLORS[data.surfaceCategory], 0.9).setVisible(false);
        stamp.setStrokeStyle(1, 0x3a2b1f, 0.8);

        const surfaceText = this.add.text(-95, -50, data.surfaceLines.join("\n"), {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: "#2a1f18",
            lineSpacing: 6,
            wordWrap: { width: 190 }
        }).setVisible(false);

        const trueText = this.add.text(-95, -50, data.trueLines.join("\n"), {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: "#24143a",
            lineSpacing: 6,
            wordWrap: { width: 190 }
        }).setVisible(false);

        const envelope = this.add.rectangle(0, 0, 140, 80, 0xf1e6d2, 1);
        envelope.setStrokeStyle(2, 0xc0b099, 1);
        const seal = this.add.circle(0, 0, 8, 0xb36f47, 1);
        const envelopeStamp = this.add.rectangle(40, -18, 26, 18, CATEGORY_COLORS[data.surfaceCategory], 0.9);
        envelopeStamp.setStrokeStyle(1, 0x3a2b1f, 0.8);

        container.add([glow, truePanel, surfacePanel, stamp, surfaceText, trueText, envelope, envelopeStamp, seal]);

        const letter = {
            id: data.id,
            isStory: data.isStory,
            isDoubleLayer: data.isDoubleLayer,
            storySlot: data.storySlot,
            surfaceCategory: data.surfaceCategory,
            trueCategory: data.trueCategory,
            surfaceLines: data.surfaceLines,
            trueLines: data.trueLines,
            speed: data.speed,
            container,
            envelope,
            seal,
            surfacePanel,
            truePanel,
            surfaceText,
            trueText,
            glow,
            stamp,
            isOpen: false,
            isDragging: false,
            openByPointer: false,
            openByKey: false,
            showingTrue: false,
            swayAmount: randBetween(10, 18),
            swaySpeed: randBetween(0.8, 1.4),
            swayPhase: randBetween(0, 3.14),
            updateOpen: (open) => {
                if (letter.isOpen === open) return;
                letter.isOpen = open;
                if (open) {
                    envelope.setVisible(false);
                    seal.setVisible(false);
                    surfacePanel.setVisible(true);
                    stamp.setVisible(true);
                    surfaceText.setVisible(true);
                } else {
                    envelope.setVisible(true);
                    seal.setVisible(true);
                    surfacePanel.setVisible(false);
                    truePanel.setVisible(false);
                    surfaceText.setVisible(false);
                    trueText.setVisible(false);
                    glow.setVisible(false);
                    stamp.setVisible(false);
                    letter.showingTrue = false;
                }
            },
            showTrueLayer: () => {
                if (!letter.isOpen) return;
                surfacePanel.setVisible(false);
                surfaceText.setVisible(false);
                truePanel.setVisible(true);
                trueText.setVisible(true);
                glow.setVisible(true);
                stamp.setFillStyle(CATEGORY_COLORS[letter.trueCategory], 0.9);
                letter.showingTrue = true;
            },
            showSurfaceLayer: () => {
                if (!letter.isOpen) return;
                surfacePanel.setVisible(true);
                surfaceText.setVisible(true);
                truePanel.setVisible(false);
                trueText.setVisible(false);
                glow.setVisible(false);
                stamp.setFillStyle(CATEGORY_COLORS[letter.surfaceCategory], 0.9);
                letter.showingTrue = false;
            }
        };

        container.setData("letter", letter);
        this.input.setDraggable(container);
        return letter;
    }

    fileLetter(letter, chosenCat) {
        if (!this.letters.includes(letter)) return;
        if (chosenCat === letter.trueCategory) {
            this.filedCorrectTrue += 1;
            this.harmony = clamp(this.harmony + 5, 0, 100);
            this.static = clamp(this.static - 2, 0, 100);
            this.audioManager.playBeep(520);
            this.spawnFragment(letter.container.x, letter.container.y, "truth");
            this.resolveStoryNode(letter, "true");
        } else if (chosenCat === letter.surfaceCategory) {
            this.filedCorrectSurfaceOnly += 1;
            this.harmony = clamp(this.harmony + 1, 0, 100);
            this.static = clamp(this.static + 4, 0, 100);
            this.audioManager.playBeep(380);
            this.spawnFragment(letter.container.x, letter.container.y, "mask");
            this.resolveStoryNode(letter, "surface");
        } else {
            this.filedWrong += 1;
            this.harmony = clamp(this.harmony - 4, 0, 100);
            this.static = clamp(this.static + 7, 0, 100);
            this.audioManager.playBeep(220);
            this.spawnFragment(letter.container.x, letter.container.y, "wrong");
            this.resolveStoryNode(letter, "wrong");
        }
        this.destroyLetter(letter);
    }

    handleMissed(letter) {
        this.missed += 1;
        this.harmony = clamp(this.harmony - 6, 0, 100);
        this.static = clamp(this.static + 11, 0, 100);
        this.audioManager.playBeep(140, 0.25, 0.3);
        this.resolveStoryNode(letter, "missed");
        this.destroyLetter(letter);
    }

    resolveStoryNode(letter, outcome) {
        if (!letter.isStory || letter.storySlot === null || this.storyResolved.has(letter.storySlot)) return;
        const node = this.storyTrack[letter.storySlot];
        if (!node) return;
        let color = 0xb15a4f;
        if (outcome === "true") color = 0x7fa46b;
        if (outcome === "surface") color = 0xd1a34f;
        if (outcome === "wrong" || outcome === "missed") color = 0xb24c4c;
        node.setFillStyle(color, 0.95);
        node.setStrokeStyle(1, 0xf3e7d4, 0.9);
        this.storyResolved.set(letter.storySlot, outcome);
    }

    spawnFragment(x, y, type) {
        const wordMap = {
            truth: ["truth", "listen", "stay", "real"],
            mask: ["mask", "safe", "quiet", "fine"],
            wrong: ["static", "blur", "miss", "noise"]
        };
        const colorMap = {
            truth: "#c9f0c2",
            mask: "#f1d29b",
            wrong: "#f1a5a5"
        };
        const text = this.add.text(x, y, randPick(wordMap[type]), {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: colorMap[type]
        }).setOrigin(0.5);
        text.setDepth(30);
        this.tweens.add({
            targets: text,
            y: y - 60,
            alpha: 0,
            duration: 900,
            ease: "Sine.easeOut",
            onComplete: () => text.destroy()
        });
    }

    destroyLetter(letter) {
        const index = this.letters.indexOf(letter);
        if (index >= 0) {
            this.letters.splice(index, 1);
        }
        if (this.lastClickedLetter === letter) {
            this.lastClickedLetter = null;
        }
        letter.container.destroy(true);
    }

    endGame() {
        this.gameEnded = true;
        const totalFiled = this.filedCorrectTrue + this.filedCorrectSurfaceOnly + this.filedWrong;
        const truthRate = this.filedCorrectTrue / Math.max(1, totalFiled);
        let tier = "BAD";
        let msg = "The desk kept the safe versions. The true ones burned away under static.";
        if (truthRate >= 0.65 && this.static <= 45) {
            tier = "GOOD";
            msg = "Some drafts were masks. You looked anyway. The real words survived.";
        } else if (truthRate >= 0.4 && truthRate <= 0.64) {
            tier = "MIXED";
            msg = "You saved some truth, filed some masks. The story is readable, but bruised.";
        }

        this.scene.start("EndScene", {
            filedCorrectTrue: this.filedCorrectTrue,
            filedCorrectSurfaceOnly: this.filedCorrectSurfaceOnly,
            filedWrong: this.filedWrong,
            missed: this.missed,
            truthRate,
            harmony: this.harmony,
            static: this.static,
            tier,
            msg
        });
    }
}

class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: "EndScene" });
    }

    create(data) {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor(0x1a1410);

        this.add.text(width / 2, height / 5, `PALIMPSEST DESK — ${data.tier}`, {
            fontFamily: "Georgia, serif",
            fontSize: "34px",
            color: "#f3e7d4"
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 5 + 36, "DELIVERY REPORT", {
            fontFamily: "Georgia, serif",
            fontSize: "16px",
            color: "#c4b39c",
            letterSpacing: 2
        }).setOrigin(0.5);

        const truthPercent = Math.round(data.truthRate * 100);
        const stats = [
            `True-sorted: ${data.filedCorrectTrue}`,
            `Surface-only: ${data.filedCorrectSurfaceOnly}`,
            `Wrong: ${data.filedWrong}`,
            `Missed: ${data.missed}`,
            `Truth Rate: ${truthPercent}%`,
            `Harmony: ${Math.round(data.harmony)}  Static: ${Math.round(data.static)}`
        ];

        this.add.text(width / 2, height / 2 - 40, stats.join("\n"), {
            fontFamily: "Georgia, serif",
            fontSize: "20px",
            color: "#e6d7c2",
            align: "center",
            lineSpacing: 8
        }).setOrigin(0.5);

        this.add.text(width / 2, height * 0.72, data.msg, {
            fontFamily: "Georgia, serif",
            fontSize: "20px",
            color: "#f3e7d4",
            align: "center",
            wordWrap: { width: 900 }
        }).setOrigin(0.5);

        const prompt = this.add.text(width / 2, height * 0.86, "Press ENTER to return to menu", {
            fontFamily: "Georgia, serif",
            fontSize: "18px",
            color: "#d0bfa6"
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            yoyo: true,
            repeat: -1,
            duration: 900
        });

        this.input.keyboard.once("keydown-ENTER", () => {
            this.scene.start("MenuScene");
        });
        this.input.once("pointerdown", () => {
            this.scene.start("MenuScene");
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: "game-container",
    backgroundColor: "#1a1410",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, EndScene]
};

new Phaser.Game(config);
