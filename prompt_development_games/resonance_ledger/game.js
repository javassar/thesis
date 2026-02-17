const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

const GAME_DURATION_MS = 300000;

const MARK_MAX = 3;
const MARK_LIFETIME_MS = 4000;
const REVEAL_DURATION_MS = 1100;
const PULSE_MAX_RADIUS = 280;
const PULSE_EXPAND_MS = 220;
const PULSE_SEGMENT_MIN = 6;
const PULSE_SEGMENT_MAX = 9;
const PULSE_SEGMENT_ARC_MIN = 0.18;
const PULSE_SEGMENT_ARC_MAX = 0.48;

const PLAYER_SPEED = 135;

const ENEMY_SPEED_WANDER = 95;
const ENEMY_SPEED_HUNT = 120;
const ENEMY_SPEED_LOCKON = 135;
const ENEMY_KILL_DIST = 18;
const ENEMY_FORGET_MS = 2600;
const ENEMY_PROXIMITY_REVEAL_DIST = 120;
const ENEMY_PROXIMITY_ALPHA_MIN = 0.15;
const ENEMY_PROXIMITY_ALPHA_MAX = 0.5;

const NOISE_MAX = 100;
const NOISE_DECAY_PER_SEC = 10;
const NOISE_MOVE_GAIN_PER_SEC = 18;
const NOISE_STEP_EVENT_INTERVAL_MS = 320;
const NOISE_STEP_EVENT_STRENGTH = 12;
const NOISE_MARK_EVENT_STRENGTH = 22;
const NOISE_CHIME_SPIKE = 35;

const PATTERN_WINDOW = 4;
const PATTERN_TOLERANCE_MS = 90;
const PATTERN_LOCKON_MS = 2200;
const PATTERN_PREDICT_AHEAD_PX = 85;
const PATTERN_WARNING_MS = 1200;

const MAX_SOUND_EVENTS = 12;

const STEP_REVEAL_RADIUS = 60;
const STEP_REVEAL_DURATION_MS = 350;
const STEP_PULSE_EXPAND_MS = 180;

class ResonanceLedger extends Phaser.Scene {
    constructor() {
        super({ key: 'ResonanceLedger' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#05060A');
        this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

        this.gameOver = false;
        this.win = false;
        this.timeLeftMs = GAME_DURATION_MS;

        this.revealables = [];
        this.marks = [];
        this.markTimes = [];
        this.activePulses = [];
        this.soundEvents = [];
        this.noise = 0;
        this.nextStepEventTime = 0;
        this.patternDetectedUntil = 0;
        this.lockOnUntil = 0;
        this.playerStunUntil = 0;

        this.walls = this.physics.add.staticGroup();
        this.chimes = this.physics.add.staticGroup();

        this.addWalls();
        this.addChimes();

        this.exit = this.add.rectangle(900, 270, 38, 38, 0xFFE66D);
        this.exit.setOrigin(0.5);
        this.exit.alpha = 0;
        this.exit.revealUntil = 0;
        this.physics.add.existing(this.exit, true);
        this.revealables.push(this.exit);

        this.player = this.add.circle(80, 270, 10, 0xBFD7FF);
        this.physics.add.existing(this.player);
        this.player.body.setCircle(10);
        this.player.body.setAllowGravity(false);
        this.player.body.setCollideWorldBounds(true);

        this.enemy = this.add.circle(860, 90, 13, 0xFF4D6D);
        this.physics.add.existing(this.enemy);
        this.enemy.body.setCircle(13);
        this.enemy.body.setAllowGravity(false);
        this.enemy.body.setCollideWorldBounds(true);
        this.enemy.alpha = 0;
        this.enemy.revealUntil = 0;
        this.enemyMode = 'wander';
        this.wanderTarget = this.pickWanderTarget();
        this.revealables.push(this.enemy);

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.enemy, this.walls);
        this.physics.add.overlap(this.player, this.exit, () => this.triggerWin(), null, this);
        this.physics.add.overlap(this.player, this.chimes, (player, chime) => this.onTouchChime(chime), null, this);

        this.cursors = this.input.keyboard.addKeys({
            up: 'W',
            left: 'A',
            down: 'S',
            right: 'D'
        });

        this.input.on('pointerdown', (pointer) => {
            if (pointer.button !== 0) {
                return;
            }
            this.placeMark(pointer.worldX, pointer.worldY);
        });

        this.pulseGfx = this.add.graphics();

        this.createUi();
    }

    addWalls() {
        this.addWall(480, 10, 960, 20);
        this.addWall(480, 530, 960, 20);
        this.addWall(10, 270, 20, 540);
        this.addWall(950, 270, 20, 540);

        this.addWall(210, 140, 340, 20);
        this.addWall(210, 400, 340, 20);
        this.addWall(370, 270, 20, 320);
        this.addWall(540, 115, 20, 230);
        this.addWall(540, 425, 20, 230);
        this.addWall(700, 270, 300, 20);
        this.addWall(785, 165, 20, 210);
        this.addWall(785, 375, 20, 210);
    }

    addWall(x, y, width, height) {
        const wall = this.add.rectangle(x, y, width, height, 0x000000, 0);
        wall.setStrokeStyle(2, 0x8AA0B8, 1);
        wall.alpha = 0;
        wall.revealUntil = 0;
        this.physics.add.existing(wall, true);
        this.walls.add(wall);
        this.revealables.push(wall);
    }

    addChimes() {
        this.addChime(255, 270);
        this.addChime(335, 210);
        this.addChime(335, 330);
        this.addChime(620, 230);
        this.addChime(620, 310);
        this.addChime(825, 270);
    }

    addChime(x, y) {
        const chime = this.add.circle(x, y, 12, 0x6CFFB2);
        chime.alpha = 0;
        chime.revealUntil = 0;
        this.physics.add.existing(chime, true);
        chime.body.setCircle(12);
        this.chimes.add(chime);
        this.revealables.push(chime);
    }

    createUi() {
        this.timerText = this.add.text(16, 12, 'TIME: 05:00', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#E8F1FF'
        });

        this.marksText = this.add.text(16, 36, 'MARKS: ', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#FFD166'
        });

        this.patternText = this.add.text(480, 12, 'PATTERN DETECTED', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#FF4D6D'
        });
        this.patternText.setOrigin(0.5, 0);
        this.patternText.setAlpha(0);

        this.cueText = this.add.text(480, 34, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#9FB3C8'
        });
        this.cueText.setOrigin(0.5, 0);
        this.cueText.setAlpha(0);
        this.cueUntil = 0;

        this.noiseLabel = this.add.text(700, 12, 'NOISE', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#E8F1FF'
        });

        this.noiseBg = this.add.rectangle(780, 18, 160, 14, 0x1A2233);
        this.noiseBg.setOrigin(0, 0.5);

        this.noiseFill = this.add.rectangle(780, 18, 160, 14, 0xFF4D6D);
        this.noiseFill.setOrigin(0, 0.5);

        this.helpText = this.add.text(480, 520,
            'WASD move   CLICK place echo mark (reveals)   Repeating rhythms gets you hunted',
            {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#9FB3C8'
            }
        );
        this.helpText.setOrigin(0.5, 0.5);

        const uiDepth = 10;
        this.timerText.setDepth(uiDepth);
        this.marksText.setDepth(uiDepth);
        this.patternText.setDepth(uiDepth);
        this.cueText.setDepth(uiDepth);
        this.noiseLabel.setDepth(uiDepth);
        this.noiseBg.setDepth(uiDepth);
        this.noiseFill.setDepth(uiDepth);
        this.helpText.setDepth(uiDepth);
    }

    update(time, delta) {
        if (this.gameOver) {
            this.player.body.setVelocity(0, 0);
            this.enemy.body.setVelocity(0, 0);
            return;
        }

        this.timeLeftMs -= delta;
        if (this.timeLeftMs <= 0) {
            this.triggerLose('time');
            return;
        }

        this.updateMarks(time);

        let vx = 0;
        let vy = 0;
        if (this.cursors.left.isDown) {
            vx -= 1;
        }
        if (this.cursors.right.isDown) {
            vx += 1;
        }
        if (this.cursors.up.isDown) {
            vy -= 1;
        }
        if (this.cursors.down.isDown) {
            vy += 1;
        }

        let moving = false;
        if (vx !== 0 || vy !== 0) {
            const len = Math.hypot(vx, vy);
            vx /= len;
            vy /= len;
            moving = true;
        }

        if (time < this.playerStunUntil) {
            vx = 0;
            vy = 0;
            moving = false;
        }

        this.player.body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);

        if (moving) {
            this.noise += NOISE_MOVE_GAIN_PER_SEC * (delta / 1000);
            if (time >= this.nextStepEventTime) {
                this.pushSoundEvent(this.player.x, this.player.y, time, NOISE_STEP_EVENT_STRENGTH, 'step');
                this.applyRevealAt(this.player.x, this.player.y, STEP_REVEAL_RADIUS, time, STEP_REVEAL_DURATION_MS);
                this.createPulse(this.player.x, this.player.y, time, {
                    maxRadius: STEP_REVEAL_RADIUS,
                    expandMs: STEP_PULSE_EXPAND_MS,
                    baseAlpha: 0.35,
                    lineWidth: 1,
                    segments: false
                });
                this.nextStepEventTime = time + NOISE_STEP_EVENT_INTERVAL_MS;
            }
        } else {
            this.noise -= NOISE_DECAY_PER_SEC * (delta / 1000);
        }
        this.noise = Phaser.Math.Clamp(this.noise, 0, NOISE_MAX);

        this.pruneSoundEvents(time);

        let enemySpeed = ENEMY_SPEED_WANDER;
        if (time < this.lockOnUntil) {
            this.enemyMode = 'lockon';
            this.enemyTarget = this.predictPlayerPosition(PATTERN_PREDICT_AHEAD_PX);
            enemySpeed = ENEMY_SPEED_LOCKON;
        } else if (this.soundEvents.length > 0) {
            this.enemyMode = 'hunt';
            const targetEvent = this.selectSoundEvent(time);
            if (targetEvent) {
                this.enemyTarget = { x: targetEvent.x, y: targetEvent.y };
            }
            enemySpeed = ENEMY_SPEED_HUNT;
        } else {
            this.enemyMode = 'wander';
            if (!this.wanderTarget || Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, this.wanderTarget.x, this.wanderTarget.y) < 10) {
                this.wanderTarget = this.pickWanderTarget();
            }
            this.enemyTarget = this.wanderTarget;
            enemySpeed = ENEMY_SPEED_WANDER;
        }

        if (this.enemyTarget) {
            const dx = this.enemyTarget.x - this.enemy.x;
            const dy = this.enemyTarget.y - this.enemy.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 0) {
                this.enemy.body.setVelocity((dx / dist) * enemySpeed, (dy / dist) * enemySpeed);
            } else {
                this.enemy.body.setVelocity(0, 0);
            }
        }

        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y) <= ENEMY_KILL_DIST) {
            this.triggerLose('enemy');
            return;
        }

        this.updatePulses(time);
        this.updateRevealables(time);
        this.applyEnemyProximityReveal();

        this.timerText.setText(`TIME: ${this.formatTime(this.timeLeftMs)}`);
        this.marksText.setText(`MARKS: ${this.renderMarks()}`);
        const noiseRatio = Phaser.Math.Clamp(this.noise / NOISE_MAX, 0, 1);
        this.noiseFill.setScale(noiseRatio, 1);

        if (time < this.patternDetectedUntil) {
            const pulse = 0.6 + 0.4 * Math.sin(time * 0.015);
            this.patternText.setAlpha(pulse);
        } else {
            this.patternText.setAlpha(0);
        }

        if (time < this.cueUntil) {
            const remaining = this.cueUntil - time;
            this.cueText.setAlpha(Phaser.Math.Clamp(remaining / 200, 0, 1));
        } else if (this.cueText.alpha !== 0) {
            this.cueText.setAlpha(0);
        }
    }

    updateMarks(time) {
        if (this.marks.length === 0) {
            return;
        }

        this.marks = this.marks.filter((mark) => {
            if (time >= mark.expiresAt) {
                mark.destroy();
                return false;
            }
            return true;
        });
    }

    createPulse(x, y, startTime, options) {
        const {
            maxRadius = PULSE_MAX_RADIUS,
            expandMs = PULSE_EXPAND_MS,
            baseAlpha = 0.8,
            lineWidth = 2,
            color = 0xFFD166,
            segments = true
        } = options || {};

        let segmentData = null;
        if (segments) {
            segmentData = [];
            const count = Phaser.Math.Between(PULSE_SEGMENT_MIN, PULSE_SEGMENT_MAX);
            for (let i = 0; i < count; i += 1) {
                segmentData.push({
                    start: Phaser.Math.FloatBetween(0, Math.PI * 2),
                    arc: Phaser.Math.FloatBetween(PULSE_SEGMENT_ARC_MIN, PULSE_SEGMENT_ARC_MAX),
                    drift: Phaser.Math.FloatBetween(-0.35, 0.35),
                    alpha: Phaser.Math.FloatBetween(0.35, 0.85),
                    width: Phaser.Math.FloatBetween(0.6, 1.6)
                });
            }
        }

        this.activePulses.push({
            x,
            y,
            startTime,
            maxRadius,
            expandMs,
            baseAlpha,
            lineWidth,
            color,
            segments: segmentData
        });
    }

    updatePulses(time) {
        this.pulseGfx.clear();
        const remaining = [];

        for (const pulse of this.activePulses) {
            const t = (time - pulse.startTime) / pulse.expandMs;
            if (t >= 1) {
                continue;
            }
            const radius = t * pulse.maxRadius;
            const alpha = pulse.baseAlpha * (1 - t);
            this.pulseGfx.lineStyle(pulse.lineWidth, pulse.color, alpha);
            this.pulseGfx.strokeCircle(pulse.x, pulse.y, radius);

            if (pulse.segments) {
                for (const seg of pulse.segments) {
                    const start = seg.start + seg.drift * t;
                    const end = start + seg.arc;
                    this.pulseGfx.lineStyle(seg.width, pulse.color, alpha * seg.alpha);
                    this.pulseGfx.beginPath();
                    this.pulseGfx.arc(pulse.x, pulse.y, radius, start, end, false);
                    this.pulseGfx.strokePath();
                }
            }

            remaining.push(pulse);
        }

        this.activePulses = remaining;
    }

    updateRevealables(time) {
        for (const obj of this.revealables) {
            if (time < obj.revealUntil) {
                const remaining = obj.revealUntil - time;
                const fade = Phaser.Math.Clamp(remaining / REVEAL_DURATION_MS, 0, 1);
                obj.alpha = 0.12 + 0.88 * fade;
            } else {
                obj.alpha = 0;
            }
        }
        this.player.alpha = 1;
    }

    applyEnemyProximityReveal() {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
        if (dist < ENEMY_PROXIMITY_REVEAL_DIST) {
            const t = 1 - (dist / ENEMY_PROXIMITY_REVEAL_DIST);
            const alpha = ENEMY_PROXIMITY_ALPHA_MIN + (ENEMY_PROXIMITY_ALPHA_MAX - ENEMY_PROXIMITY_ALPHA_MIN) * t;
            this.enemy.alpha = Math.max(this.enemy.alpha, alpha);
        }
    }

    placeMark(mx, my) {
        if (this.gameOver) {
            return;
        }

        const timeNow = this.time.now;
        const clampedX = Phaser.Math.Clamp(mx, 0, GAME_WIDTH);
        const clampedY = Phaser.Math.Clamp(my, 0, GAME_HEIGHT);

        const ring = this.add.circle(0, 0, 7);
        ring.setStrokeStyle(2, 0xFFD166, 1);
        ring.setFillStyle(0x000000, 0);
        const dot = this.add.circle(0, 0, 2, 0xFFD166);
        const mark = this.add.container(clampedX, clampedY, [ring, dot]);
        mark.createdAt = timeNow;
        mark.expiresAt = timeNow + MARK_LIFETIME_MS;
        this.marks.push(mark);

        if (this.marks.length > MARK_MAX) {
            const oldest = this.marks.shift();
            if (oldest) {
                oldest.destroy();
            }
        }

        this.createPulse(clampedX, clampedY, timeNow, {
            maxRadius: PULSE_MAX_RADIUS,
            expandMs: PULSE_EXPAND_MS,
            baseAlpha: 0.85,
            lineWidth: 2,
            segments: true
        });
        this.applyRevealAt(clampedX, clampedY, PULSE_MAX_RADIUS, timeNow, REVEAL_DURATION_MS);

        this.pushSoundEvent(clampedX, clampedY, timeNow, NOISE_MARK_EVENT_STRENGTH, 'mark', MARK_LIFETIME_MS);
        this.showCue('PING');

        this.markTimes.push(timeNow);
        if (this.markTimes.length > PATTERN_WINDOW + 1) {
            this.markTimes.shift();
        }

        if (this.detectCadence(this.markTimes, PATTERN_TOLERANCE_MS)) {
            this.patternDetectedUntil = Math.max(this.patternDetectedUntil, timeNow + PATTERN_WARNING_MS);
            this.lockOnUntil = Math.max(this.lockOnUntil, timeNow + PATTERN_LOCKON_MS);
        }
    }

    detectCadence(times, toleranceMs) {
        if (times.length < PATTERN_WINDOW + 1) {
            return false;
        }

        const intervals = [];
        for (let i = 1; i < times.length; i += 1) {
            intervals.push(times[i] - times[i - 1]);
        }

        const avg = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
        for (const dt of intervals) {
            if (Math.abs(dt - avg) > toleranceMs) {
                return false;
            }
        }

        return true;
    }

    predictPlayerPosition(aheadPx) {
        const velocity = this.player.body.velocity;
        const speed = Math.hypot(velocity.x, velocity.y);
        if (speed < 1) {
            return { x: this.player.x, y: this.player.y };
        }

        const dirX = velocity.x / speed;
        const dirY = velocity.y / speed;
        const targetX = this.player.x + dirX * aheadPx;
        const targetY = this.player.y + dirY * aheadPx;

        return {
            x: Phaser.Math.Clamp(targetX, 0, GAME_WIDTH),
            y: Phaser.Math.Clamp(targetY, 0, GAME_HEIGHT)
        };
    }

    pushSoundEvent(x, y, time, strength, type, forgetMs = ENEMY_FORGET_MS) {
        this.soundEvents.push({ x, y, time, strength, type, forgetMs });
        if (this.soundEvents.length > MAX_SOUND_EVENTS) {
            this.soundEvents.shift();
        }
    }

    pruneSoundEvents(time) {
        this.soundEvents = this.soundEvents.filter(event => time - event.time <= event.forgetMs);
    }

    selectSoundEvent(time) {
        let bestEvent = null;
        let bestScore = -Infinity;

        for (const event of this.soundEvents) {
            const age = time - event.time;
            const recency = Phaser.Math.Clamp(1 - (age / event.forgetMs), 0, 1);
            const score = event.strength * recency;
            if (score > bestScore) {
                bestScore = score;
                bestEvent = event;
            }
        }

        return bestEvent;
    }

    applyRevealAt(x, y, radius, time, durationMs) {
        const revealUntil = time + durationMs;
        for (const obj of this.revealables) {
            const bounds = obj.getBounds();
            const closestX = Phaser.Math.Clamp(x, bounds.left, bounds.right);
            const closestY = Phaser.Math.Clamp(y, bounds.top, bounds.bottom);
            const dx = x - closestX;
            const dy = y - closestY;
            if ((dx * dx + dy * dy) <= radius * radius) {
                obj.revealUntil = Math.max(obj.revealUntil || 0, revealUntil);
            }
        }
    }

    onTouchChime(chime) {
        const timeNow = this.time.now;
        if (chime.disabledUntil && timeNow < chime.disabledUntil) {
            return;
        }

        chime.disabledUntil = timeNow + 900;
        this.noise = Math.min(NOISE_MAX, this.noise + NOISE_CHIME_SPIKE);
        this.pushSoundEvent(chime.x, chime.y, timeNow, 45, 'chime');
        this.playerStunUntil = timeNow + 250;
        this.showCue('CHIME');
    }

    pickWanderTarget() {
        for (let i = 0; i < 12; i += 1) {
            const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
            const y = Phaser.Math.Between(40, GAME_HEIGHT - 40);
            if (!this.pointInsideWall(x, y)) {
                return { x, y };
            }
        }

        return { x: Phaser.Math.Between(40, GAME_WIDTH - 40), y: Phaser.Math.Between(40, GAME_HEIGHT - 40) };
    }

    pointInsideWall(x, y) {
        for (const wall of this.walls.getChildren()) {
            const bounds = wall.getBounds();
            if (bounds.contains(x, y)) {
                return true;
            }
        }
        return false;
    }

    triggerWin() {
        if (this.gameOver) {
            return;
        }
        this.gameOver = true;
        this.win = true;
        this.player.body.setVelocity(0, 0);
        this.enemy.body.setVelocity(0, 0);
        this.showOverlay('BALANCED THE LEDGER');
    }

    triggerLose(reason) {
        if (this.gameOver) {
            return;
        }
        this.gameOver = true;
        this.win = false;
        this.player.body.setVelocity(0, 0);
        this.enemy.body.setVelocity(0, 0);
        this.showOverlay('AUDITED IN THE DARK');
    }

    showOverlay(text) {
        const overlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.7);
        overlay.setDepth(20);

        const mainText = this.add.text(480, 250, text, {
            fontFamily: 'monospace',
            fontSize: '48px',
            color: '#E8F1FF'
        });
        mainText.setOrigin(0.5, 0.5);
        mainText.setDepth(21);

        const subText = this.add.text(480, 310, 'Refresh to play again', {
            fontFamily: 'monospace',
            fontSize: '18px',
            color: '#E8F1FF'
        });
        subText.setOrigin(0.5, 0.5);
        subText.setDepth(21);
    }

    formatTime(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const minText = minutes.toString().padStart(2, '0');
        const secText = seconds.toString().padStart(2, '0');
        return `${minText}:${secText}`;
    }

    renderMarks() {
        const filled = '\u25CF';
        const empty = '\u25CB';
        const remaining = Math.max(0, MARK_MAX - this.marks.length);
        let text = '';
        for (let i = 0; i < remaining; i += 1) {
            text += filled;
        }
        for (let i = 0; i < MARK_MAX - remaining; i += 1) {
            text += empty;
        }
        return text;
    }

    showCue(text) {
        this.cueText.setText(text);
        this.cueText.setAlpha(1);
        this.cueUntil = this.time.now + 450;
    }
}

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#05060A',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [ResonanceLedger]
};

new Phaser.Game(config);
