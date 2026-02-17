const WIDTH = 960;
const HEIGHT = 540;

const GAME_DURATION_MS = 300000;

const MARK_MAX = 3;
const MARK_LIFETIME_MS = 4000;
const REVEAL_DURATION_MS = 1100;
const PULSE_MAX_RADIUS = 280;
const PULSE_EXPAND_MS = 220;

const PLAYER_SPEED = 135;

const ENEMY_SPEED_WANDER = 95;
const ENEMY_SPEED_HUNT = 120;
const ENEMY_SPEED_LOCKON = 135;
const ENEMY_KILL_DIST = 18;
const ENEMY_FORGET_MS = 2600;

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

const MAX_SOUND_EVENTS = 12;
const CHIME_EVENT_STRENGTH = 45;

const STEP_PULSE_MAX_RADIUS = 70;
const STEP_PULSE_EXPAND_MS = 160;

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#05060A');
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);

    this.revealables = [];
    this.wallRects = [];

    this.walls = this.physics.add.staticGroup();
    this.chimes = this.physics.add.staticGroup();

    this.player = this.add.circle(80, 270, 10, 0xBFD7FF, 1);
    this.physics.add.existing(this.player);
    this.player.body.setCircle(10);
    this.player.body.setCollideWorldBounds(true);

    this.enemy = this.add.circle(860, 90, 13, 0xFF4D6D, 1);
    this.physics.add.existing(this.enemy);
    this.enemy.body.setCircle(13);
    this.enemy.body.setCollideWorldBounds(true);
    this.enemy.revealUntil = 0;
    this.enemy.setAlpha(0);
    this.revealables.push(this.enemy);

    this.exit = this.add.rectangle(900, 270, 38, 38, 0xFFE66D, 1);
    this.physics.add.existing(this.exit, true);
    this.exit.revealUntil = 0;
    this.exit.setAlpha(0);
    this.revealables.push(this.exit);

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

    this.addChime(255, 270);
    this.addChime(335, 210);
    this.addChime(335, 330);
    this.addChime(620, 230);
    this.addChime(620, 310);
    this.addChime(825, 270);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemy, this.walls);
    this.physics.add.overlap(this.player, this.exit, this.onReachExit, null, this);
    this.physics.add.overlap(this.player, this.chimes, this.onTouchChime, null, this);

    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.input.on('pointerdown', (pointer) => {
      this.placeMark(pointer.worldX, pointer.worldY);
    });

    this.marks = [];
    this.markTimes = [];
    this.patternDetectedUntil = 0;
    this.lockOnUntil = 0;

    this.soundEvents = [];
    this.nextStepEventTime = 0;
    this.noise = 0;

    this.activePulses = [];
    this.pulseGfx = this.add.graphics();

    this.timeLeftMs = GAME_DURATION_MS;
    this.gameOver = false;
    this.win = false;
    this.playerStunUntil = 0;

    this.enemyMode = 'wander';
    this.wanderTarget = this.randomPointAvoidingWalls();
    this.enemyTarget = { x: this.wanderTarget.x, y: this.wanderTarget.y };

    this.timerText = this.add.text(16, 12, 'TIME: 05:00', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#E8F1FF'
    });

    this.marksText = this.add.text(16, 36, 'MARKS: OOO', {
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

    this.noiseLabel = this.add.text(700, 12, 'NOISE', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#E8F1FF'
    });
    this.noiseLabel.setOrigin(0, 0);

    this.noiseBg = this.add.rectangle(780, 18, 160, 14, 0x1A2233, 1);
    this.noiseBg.setOrigin(0, 0.5);

    this.noiseFill = this.add.rectangle(780, 18, 0, 14, 0xFF4D6D, 1);
    this.noiseFill.setOrigin(0, 0.5);

    this.helpText = this.add.text(
      480,
      520,
      'WASD move   CLICK place echo mark (reveals)   Repeating rhythms gets you hunted',
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9FB3C8'
      }
    );
    this.helpText.setOrigin(0.5, 0.5);

    this.overlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.7);
    this.overlay.setVisible(false);
    this.overlay.setDepth(2000);

    this.overlayText = this.add.text(480, 260, '', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#E8F1FF'
    });
    this.overlayText.setOrigin(0.5);
    this.overlayText.setVisible(false);
    this.overlayText.setDepth(2001);

    this.overlaySubText = this.add.text(480, 320, 'Refresh to play again', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#E8F1FF'
    });
    this.overlaySubText.setOrigin(0.5);
    this.overlaySubText.setVisible(false);
    this.overlaySubText.setDepth(2001);
  }

  addWall(x, y, w, h) {
    const wall = this.add.rectangle(x, y, w, h, 0x000000, 0);
    wall.setStrokeStyle(2, 0x8AA0B8, 1);
    this.physics.add.existing(wall, true);
    wall.revealUntil = 0;
    wall.setAlpha(0);
    this.walls.add(wall);
    this.revealables.push(wall);
    this.wallRects.push({ x, y, w, h });
  }

  addChime(x, y) {
    const chime = this.add.circle(x, y, 12, 0x6CFFB2, 1);
    this.physics.add.existing(chime, true);
    chime.body.setCircle(12);
    chime.revealUntil = 0;
    chime.setAlpha(0);
    chime.disabledUntil = 0;
    this.chimes.add(chime);
    this.revealables.push(chime);
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

    const deltaSec = delta / 1000;
    const now = time;

    const canMove = now >= this.playerStunUntil;
    let vx = 0;
    let vy = 0;

    if (canMove) {
      if (this.keys.a.isDown) vx -= 1;
      if (this.keys.d.isDown) vx += 1;
      if (this.keys.w.isDown) vy -= 1;
      if (this.keys.s.isDown) vy += 1;
    }

    const moving = (vx !== 0 || vy !== 0) && canMove;
    if (moving) {
      const vec = new Phaser.Math.Vector2(vx, vy).normalize();
      this.player.body.setVelocity(vec.x * PLAYER_SPEED, vec.y * PLAYER_SPEED);
    } else {
      this.player.body.setVelocity(0, 0);
    }

    if (moving) {
      this.noise += NOISE_MOVE_GAIN_PER_SEC * deltaSec;
      if (now >= this.nextStepEventTime) {
        this.pushSoundEvent(this.player.x, this.player.y, now, NOISE_STEP_EVENT_STRENGTH, 'step');
        this.spawnPulse(this.player.x, this.player.y, STEP_PULSE_MAX_RADIUS, STEP_PULSE_EXPAND_MS, 0x9FB3C8, 0.5);
        this.applyReveal(this.player.x, this.player.y, STEP_PULSE_MAX_RADIUS, REVEAL_DURATION_MS, now);
        this.nextStepEventTime = now + NOISE_STEP_EVENT_INTERVAL_MS;
      }
    } else {
      this.noise -= NOISE_DECAY_PER_SEC * deltaSec;
    }
    this.noise = Phaser.Math.Clamp(this.noise, 0, NOISE_MAX);

    this.pruneSoundEvents(now);

    if (now < this.lockOnUntil) {
      this.enemyMode = 'lockon';
      this.enemyTarget = this.predictPlayerPosition(PATTERN_PREDICT_AHEAD_PX);
      this.setEnemyVelocity(this.enemyTarget, ENEMY_SPEED_LOCKON);
    } else if (this.soundEvents.length > 0) {
      this.enemyMode = 'hunt';
      const e = this.selectSoundEvent(now);
      this.enemyTarget = { x: e.x, y: e.y };
      this.setEnemyVelocity(this.enemyTarget, ENEMY_SPEED_HUNT);
    } else {
      this.enemyMode = 'wander';
      if (Phaser.Math.Distance.Between(this.enemy.x, this.enemy.y, this.wanderTarget.x, this.wanderTarget.y) < 10) {
        this.wanderTarget = this.randomPointAvoidingWalls();
      }
      this.enemyTarget = { x: this.wanderTarget.x, y: this.wanderTarget.y };
      this.setEnemyVelocity(this.enemyTarget, ENEMY_SPEED_WANDER);
    }

    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y) <= ENEMY_KILL_DIST) {
      this.triggerLose('enemy');
      return;
    }

    this.cleanupExpiredMarks(now);
    this.updatePulses(now);
    this.updateReveals(now);
    this.player.setAlpha(1);

    this.timerText.setText('TIME: ' + this.formatTime(this.timeLeftMs));
    this.marksText.setText('MARKS: ' + this.renderMarks());
    this.noiseFill.width = 160 * (this.noise / NOISE_MAX);

    if (now < this.patternDetectedUntil) {
      const pulse = 0.6 + 0.4 * Math.sin(now * 0.01);
      this.patternText.setAlpha(pulse);
    } else {
      this.patternText.setAlpha(0);
    }

  }

  updatePulses(now) {
    this.pulseGfx.clear();
    const alive = [];
    for (const p of this.activePulses) {
      const t = (now - p.startTime) / p.expandMs;
      if (t >= 1) {
        continue;
      }
      const r = p.maxRadius * t;
      const alpha = p.alpha * (1 - t);
      this.pulseGfx.lineStyle(2, p.color, alpha);
      this.pulseGfx.strokeCircle(p.x, p.y, r);
      alive.push(p);
    }
    this.activePulses = alive;
  }

  updateReveals(now) {
    for (const obj of this.revealables) {
      if (now < obj.revealUntil) {
        const remaining = obj.revealUntil - now;
        const fade = Phaser.Math.Clamp(remaining / REVEAL_DURATION_MS, 0, 1);
        obj.setAlpha(0.12 + 0.88 * fade);
      } else {
        obj.setAlpha(0);
      }
    }
  }

  placeMark(mx, my) {
    if (this.gameOver) return;

    const now = this.time.now;

    const ring = this.add.circle(0, 0, 7, 0x000000, 0);
    ring.setStrokeStyle(2, 0xFFD166, 1);
    const dot = this.add.circle(0, 0, 2, 0xFFD166, 1);
    const mark = this.add.container(mx, my, [ring, dot]);

    const markData = {
      container: mark,
      createdAt: now,
      expiresAt: now + MARK_LIFETIME_MS
    };

    this.marks.push(markData);
    if (this.marks.length > MARK_MAX) {
      const oldest = this.marks.shift();
      oldest.container.destroy();
    }

    this.spawnPulse(mx, my, PULSE_MAX_RADIUS, PULSE_EXPAND_MS, 0xFFD166, 0.8);
    this.applyReveal(mx, my, PULSE_MAX_RADIUS, REVEAL_DURATION_MS, now);

    this.pushSoundEvent(mx, my, now, NOISE_MARK_EVENT_STRENGTH, 'mark');

    this.markTimes.push(now);
    if (this.markTimes.length > PATTERN_WINDOW + 1) {
      this.markTimes.shift();
    }

    if (this.detectCadence(this.markTimes, PATTERN_TOLERANCE_MS)) {
      this.patternDetectedUntil = now + 1200;
      this.lockOnUntil = now + PATTERN_LOCKON_MS;
    }
  }

  detectCadence(times, tol) {
    if (times.length < PATTERN_WINDOW + 1) return false;
    const intervals = [];
    for (let i = 1; i < times.length; i += 1) {
      intervals.push(times[i] - times[i - 1]);
    }
    const avg = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
    for (const dt of intervals) {
      if (Math.abs(dt - avg) > tol) return false;
    }
    return true;
  }

  predictPlayerPosition(aheadPx) {
    const v = this.player.body.velocity;
    const speed = Math.sqrt(v.x * v.x + v.y * v.y);
    if (speed < 1) {
      return { x: this.player.x, y: this.player.y };
    }
    const dir = new Phaser.Math.Vector2(v.x, v.y).normalize();
    const x = Phaser.Math.Clamp(this.player.x + dir.x * aheadPx, 0, WIDTH);
    const y = Phaser.Math.Clamp(this.player.y + dir.y * aheadPx, 0, HEIGHT);
    return { x, y };
  }

  pushSoundEvent(x, y, time, strength, type) {
    this.soundEvents.push({ x, y, time, strength, type });
    if (this.soundEvents.length > MAX_SOUND_EVENTS) {
      this.soundEvents.shift();
    }
  }

  pruneSoundEvents(now) {
    this.soundEvents = this.soundEvents.filter((e) => now - e.time <= ENEMY_FORGET_MS);
  }

  selectSoundEvent(now) {
    let best = this.soundEvents[0];
    let bestScore = -Infinity;
    for (const e of this.soundEvents) {
      const age = now - e.time;
      const recency = Phaser.Math.Clamp(1 - age / ENEMY_FORGET_MS, 0, 1);
      const score = e.strength * recency;
      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    }
    return best;
  }

  setEnemyVelocity(target, speed) {
    const dir = new Phaser.Math.Vector2(target.x - this.enemy.x, target.y - this.enemy.y);
    if (dir.length() < 1) {
      this.enemy.body.setVelocity(0, 0);
      return;
    }
    dir.normalize();
    this.enemy.body.setVelocity(dir.x * speed, dir.y * speed);
  }

  randomPointAvoidingWalls() {
    for (let i = 0; i < 30; i += 1) {
      const x = Phaser.Math.Between(40, WIDTH - 40);
      const y = Phaser.Math.Between(40, HEIGHT - 40);
      if (!this.pointInsideWall(x, y)) {
        return { x, y };
      }
    }
    return { x: WIDTH / 2, y: HEIGHT / 2 };
  }

  pointInsideWall(x, y) {
    for (const rect of this.wallRects) {
      const left = rect.x - rect.w / 2;
      const right = rect.x + rect.w / 2;
      const top = rect.y - rect.h / 2;
      const bottom = rect.y + rect.h / 2;
      if (x >= left && x <= right && y >= top && y <= bottom) {
        return true;
      }
    }
    return false;
  }

  applyReveal(x, y, radius, durationMs, now) {
    for (const obj of this.revealables) {
      const dist = Phaser.Math.Distance.Between(x, y, obj.x, obj.y);
      if (dist <= radius) {
        obj.revealUntil = Math.max(obj.revealUntil, now + durationMs);
      }
    }
  }

  spawnPulse(x, y, maxRadius, expandMs, color, alpha) {
    this.activePulses.push({
      x,
      y,
      maxRadius,
      expandMs,
      color,
      alpha,
      startTime: this.time.now
    });
  }

  cleanupExpiredMarks(now) {
    if (this.marks.length === 0) return;
    const alive = [];
    for (const mark of this.marks) {
      if (mark.expiresAt <= now) {
        mark.container.destroy();
      } else {
        alive.push(mark);
      }
    }
    this.marks = alive;
  }

  renderMarks() {
    const available = Phaser.Math.Clamp(MARK_MAX - this.marks.length, 0, MARK_MAX);
    let out = '';
    for (let i = 0; i < MARK_MAX; i += 1) {
      out += i < available ? 'O' : 'o';
    }
    return out;
  }

  formatTime(ms) {
    const clamped = Math.max(0, ms);
    const totalSeconds = Math.ceil(clamped / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  onTouchChime(player, chime) {
    const now = this.time.now;
    if (now < chime.disabledUntil) return;

    chime.disabledUntil = now + 900;
    this.noise = Math.min(NOISE_MAX, this.noise + NOISE_CHIME_SPIKE);
    this.pushSoundEvent(chime.x, chime.y, now, CHIME_EVENT_STRENGTH, 'chime');
    chime.revealUntil = Math.max(chime.revealUntil, now + REVEAL_DURATION_MS);
    this.playerStunUntil = now + 250;
  }

  onReachExit() {
    this.triggerWin();
  }

  triggerWin() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.win = true;
    this.showOverlay('BALANCED THE LEDGER');
  }

  triggerLose() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.win = false;
    this.showOverlay('AUDITED IN THE DARK');
  }

  showOverlay(text) {
    this.overlay.setVisible(true);
    this.overlayText.setText(text);
    this.overlayText.setVisible(true);
    this.overlaySubText.setVisible(true);
  }
}

const config = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  parent: 'game-container',
  backgroundColor: '#05060A',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
