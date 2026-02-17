const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

const COLORS = {
  background: 0x151826,
  chute: 0x202641,
  chuteBorder: 0x3a456d,
  intake: 0xffcc66,
  topBar: 0x1e2340,
  chaosBg: 0x0f1220,
  divider: 0x0f1220,
  text: "#d7e0ff",
  banner: 0x2a2f44,
  labelText: "#0f1220",
  labelBacking: 0xffffff,
  filed: "#66ff99",
  misfile: "#ff5c7a",
  missed: "#ffcc66"
};

const SECTORS = [
  { type: "FIRE", color: 0xff5c7a, name: "FURNACE", codePrefix: "F" },
  { type: "WATER", color: 0x4dabff, name: "AQUATICS", codePrefix: "W" },
  { type: "ILLUSION", color: 0xb388ff, name: "PR / ILLUSION", codePrefix: "I" },
  { type: "NECRO", color: 0x66ff99, name: "ARCHIVES", codePrefix: "N" }
];

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);

    this.SHIFT_DURATION_MS = 300000;
    this.spawnIntervalMsStart = 900;
    this.spawnIntervalMsMin = 520;
    this.spawnIntervalDecayPerMinute = 80;
    this.fallSpeedStart = 130;
    this.fallSpeedPerMinute = 18;
    this.fallSpeedMax = 220;

    this.WHEEL_X = 480;
    this.WHEEL_Y = 390;
    this.R_OUT = 150;
    this.R_IN = 92;
    this.INTAKE_Y_MIN = 232;
    this.INTAKE_Y_MAX = 268;
    this.GATE_ANGLE = -Math.PI / 2;
    this.baseAngularSpeed = 3.4;

    this.timeStartMs = this.time.now;
    this.timeLeftMs = this.SHIFT_DURATION_MS;
    this.elapsedMs = 0;
    this.filedCount = 0;
    this.misfileCount = 0;
    this.missedCount = 0;
    this.chaos = 0;
    this.paused = false;
    this.gameEnded = false;
    this.didWin = false;
    this.awaitingStart = true;
    this.wheelRotation = 0;
    this.spawnIntervalMs = this.spawnIntervalMsStart;
    this.fallSpeed = this.fallSpeedStart;
    this.forms = [];
    this.malfunction = null;
    this.nextMinuteMarkMs = 60000;
    this.minuteCount = 0;

    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.drawTopBar();
    this.createTexts();
    this.createChaosBar();

    this.eventLogText = this.add.text(20, 60, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: COLORS.text
    }).setAlpha(0).setDepth(7);

    this.createMalfunctionBanner();
    this.drawChute();
    this.drawIntakeLabel();
    this.createWheelGraphics();
    this.createInstructions();
    this.createPauseOverlay();
    this.createStartOverlay();

    this.spawnEvent = this.time.addEvent({
      delay: this.spawnIntervalMs,
      loop: true,
      callback: () => {
        if (this.canSpawn()) {
          this.spawnForm();
        }
      }
    });
    this.spawnEvent.paused = true;

    this.redrawWheel();
    this.updateUI();
  }

  canSpawn() {
    return !this.paused && !this.gameEnded && !this.awaitingStart;
  }

  drawTopBar() {
    this.add.rectangle(0, 0, GAME_WIDTH, 44, COLORS.topBar).setOrigin(0, 0).setDepth(4);
  }

  createTexts() {
    this.timerText = this.add.text(20, 12, "", {
      fontFamily: "Courier New",
      fontSize: "20px",
      color: COLORS.text
    }).setDepth(5);

    this.filedText = this.add.text(260, 14, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: COLORS.text
    }).setDepth(5);

    this.misfileText = this.add.text(380, 14, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: COLORS.text
    }).setDepth(5);

    this.missedText = this.add.text(520, 14, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: COLORS.text
    }).setDepth(5);

    this.chaosLabelText = this.add.text(660, 14, "CHAOS", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: COLORS.text
    }).setDepth(5);
  }

  createChaosBar() {
    this.add.rectangle(720, 16, 220, 14, COLORS.chaosBg).setOrigin(0, 0).setDepth(4);
    this.chaosFillGfx = this.add.graphics().setDepth(4);
  }

  createMalfunctionBanner() {
    this.malfunctionBanner = this.add.container(0, 0).setDepth(6).setVisible(false);
    const rect = this.add.rectangle(0, 44, GAME_WIDTH, 26, COLORS.banner).setOrigin(0, 0);
    this.malfunctionBannerText = this.add.text(20, 50, "", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: COLORS.missed
    });
    this.malfunctionBanner.add([rect, this.malfunctionBannerText]);
  }

  drawChute() {
    this.chuteGfx = this.add.graphics().setDepth(1);
    this.chuteGfx.fillStyle(COLORS.chute, 1);
    this.chuteGfx.fillRect(430, 0, 100, 320);

    this.chuteGfx.lineStyle(2, COLORS.chuteBorder, 1);
    this.chuteGfx.lineBetween(430, 0, 430, 320);
    this.chuteGfx.lineBetween(530, 0, 530, 320);

    this.chuteGfx.lineStyle(3, COLORS.intake, 1);
    this.chuteGfx.lineBetween(430, this.INTAKE_Y_MIN, 530, this.INTAKE_Y_MIN);
    this.chuteGfx.lineBetween(430, this.INTAKE_Y_MAX, 530, this.INTAKE_Y_MAX);
  }

  drawIntakeLabel() {
    this.add.text(20, 228, "INTAKE", {
      fontFamily: "Courier New",
      fontSize: "16px",
      color: COLORS.missed
    }).setDepth(5);
  }

  createWheelGraphics() {
    this.wheelGfx = this.add.graphics().setDepth(1);
    this.wheelLabelsContainer = this.add.container(0, 0).setDepth(3);
    this.wheelLabelObjects = [];

    for (let i = 0; i < 4; i += 1) {
      const backing = this.add.graphics();
      const text = this.add.text(0, 0, "", {
        fontFamily: "Courier New",
        fontSize: "16px",
        color: COLORS.labelText
      }).setOrigin(0.5);
      this.wheelLabelsContainer.add([backing, text]);
      this.wheelLabelObjects.push({ backing, text });
    }
  }

  createInstructions() {
    this.add.text(20, 492, "LEFT/RIGHT: rotate    SPACE: stamp    ESC: pause", {
      fontFamily: "Courier New",
      fontSize: "14px",
      color: COLORS.text
    }).setDepth(5);
    this.add.text(20, 510, "Match form COLOR to the sector at the top gate.", {
      fontFamily: "Courier New",
      fontSize: "14px",
      color: COLORS.text
    }).setDepth(5);
  }

  createPauseOverlay() {
    this.pauseOverlay = this.add.container(0, 0).setDepth(10).setVisible(false);
    const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0, 0);
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "PAUSED\nPress ESC to Resume", {
      fontFamily: "Courier New",
      fontSize: "24px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);
    this.pauseOverlay.add([dim, text]);
  }

  createStartOverlay() {
    this.startOverlay = this.add.container(0, 0).setDepth(12);
    const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75).setOrigin(0, 0);
    const title = this.add.text(GAME_WIDTH / 2, 150, "CLOCKWORK FILING WHEEL", {
      fontFamily: "Courier New",
      fontSize: "28px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);
    const body = this.add.text(GAME_WIDTH / 2, 230,
      "Forms fall down the chute. Rotate the wheel so the\n" +
      "correct department is at the top gate. Press SPACE\n" +
      "when a form is inside the intake window to file it.\n" +
      "Color tells the truth; labels may lie during malfunctions.",
      {
        fontFamily: "Courier New",
        fontSize: "16px",
        color: COLORS.text,
        align: "center",
        lineSpacing: 6
      }
    ).setOrigin(0.5);
    const prompt = this.add.text(GAME_WIDTH / 2, 360, "Press SPACE to Begin", {
      fontFamily: "Courier New",
      fontSize: "18px",
      color: COLORS.missed,
      align: "center"
    }).setOrigin(0.5);
    this.startOverlay.add([dim, title, body, prompt]);
  }

  startGame() {
    this.awaitingStart = false;
    this.startOverlay.setVisible(false);
    if (this.spawnEvent) {
      this.spawnEvent.paused = false;
    }
  }

  spawnForm() {
    const idx = Phaser.Math.Between(0, 3);
    const sector = SECTORS[idx];
    const idNum = Phaser.Math.Between(1, 99);
    const code = `${sector.codePrefix}-${pad2(idNum)}`;

    const container = this.add.container(480, 70).setDepth(2);
    const bg = this.add.graphics();
    bg.fillStyle(sector.color, 1);
    bg.fillRoundedRect(-35, -22, 70, 44, 8);
    bg.lineStyle(2, COLORS.divider, 1);
    bg.strokeRoundedRect(-35, -22, 70, 44, 8);

    const label = this.add.text(0, 0, code, {
      fontFamily: "Courier New",
      fontSize: "18px",
      fontStyle: "bold",
      color: COLORS.labelText
    }).setOrigin(0.5);

    container.add([bg, label]);
    this.forms.push({ container, type: sector.type });
  }

  getEffectiveAngularSpeed() {
    if (this.malfunction && this.malfunction.type === "GEAR_DRAG") {
      return this.baseAngularSpeed * 0.65;
    }
    return this.baseAngularSpeed;
  }

  isTorqueReversed() {
    return this.malfunction && this.malfunction.type === "TORQUE_REVERSAL";
  }

  handleStamp() {
    if (this.forms.length === 0) {
      return;
    }

    let targetIndex = -1;
    let bestY = -Infinity;
    for (let i = 0; i < this.forms.length; i += 1) {
      const y = this.forms[i].container.y;
      if (y > bestY) {
        bestY = y;
        targetIndex = i;
      }
    }

    if (targetIndex === -1) {
      return;
    }

    const target = this.forms[targetIndex];
    const y = target.container.y;
    if (y < this.INTAKE_Y_MIN || y > this.INTAKE_Y_MAX) {
      return;
    }

    this.forms.splice(targetIndex, 1);
    target.container.destroy(true);

    const activeIndex = this.computeActiveSectorIndexAtGate();
    const activeType = SECTORS[activeIndex].type;

    if (target.type === activeType) {
      this.filedCount += 1;
      this.chaos = Math.max(0, this.chaos - 2);
      this.logEvent("FILED ✓", COLORS.filed);
    } else {
      this.misfileCount += 1;
      this.chaos += 9;
      this.logEvent("MISFILE ✗", COLORS.misfile);
      if (!this.malfunction && Math.random() < 0.5) {
        this.triggerMalfunction();
      }
    }

    this.chaos = Phaser.Math.Clamp(this.chaos, 0, 100);
  }

  computeActiveSectorIndexAtGate() {
    let bestIndex = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < 4; i += 1) {
      const localCenter = i * (Math.PI / 2);
      const worldAngle = normalizeAngle(localCenter + this.wheelRotation);
      const dist = angleDistance(worldAngle, this.GATE_ANGLE);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  redrawWheel() {
    this.wheelGfx.clear();

    for (let i = 0; i < 4; i += 1) {
      const centerAngle = this.wheelRotation + i * (Math.PI / 2);
      const startAngle = centerAngle - Math.PI / 4;
      const endAngle = centerAngle + Math.PI / 4;
      this.wheelGfx.fillStyle(SECTORS[i].color, 1);
      this.wheelGfx.beginPath();
      this.wheelGfx.slice(this.WHEEL_X, this.WHEEL_Y, this.R_OUT, startAngle, endAngle, false);
      this.wheelGfx.fillPath();
    }

    this.wheelGfx.fillStyle(COLORS.background, 1);
    this.wheelGfx.beginPath();
    this.wheelGfx.arc(this.WHEEL_X, this.WHEEL_Y, this.R_IN, 0, Math.PI * 2);
    this.wheelGfx.fillPath();

    for (let k = 0; k < 4; k += 1) {
      const ang = this.wheelRotation + k * (Math.PI / 2);
      const x1 = this.WHEEL_X + this.R_IN * Math.cos(ang);
      const y1 = this.WHEEL_Y + this.R_IN * Math.sin(ang);
      const x2 = this.WHEEL_X + this.R_OUT * Math.cos(ang);
      const y2 = this.WHEEL_Y + this.R_OUT * Math.sin(ang);
      this.wheelGfx.lineStyle(2, COLORS.divider, 1);
      this.wheelGfx.beginPath();
      this.wheelGfx.moveTo(x1, y1);
      this.wheelGfx.lineTo(x2, y2);
      this.wheelGfx.strokePath();
    }

    const gateX = this.WHEEL_X;
    const gateY = this.WHEEL_Y - this.R_OUT - 10;
    this.wheelGfx.fillStyle(COLORS.intake, 1);
    this.wheelGfx.beginPath();
    this.wheelGfx.moveTo(gateX, gateY);
    this.wheelGfx.lineTo(gateX - 8, gateY - 12);
    this.wheelGfx.lineTo(gateX + 8, gateY - 12);
    this.wheelGfx.closePath();
    this.wheelGfx.fillPath();

    for (let i = 0; i < 4; i += 1) {
      let nameIndex = i;
      if (this.malfunction && this.malfunction.type === "LABEL_SLIP") {
        nameIndex = (i + 1) % 4;
      }
      const name = SECTORS[nameIndex].name;
      const labelAngle = this.wheelRotation + i * (Math.PI / 2);
      const lx = this.WHEEL_X + 122 * Math.cos(labelAngle);
      const ly = this.WHEEL_Y + 122 * Math.sin(labelAngle);

      const labelObj = this.wheelLabelObjects[i];
      labelObj.backing.clear();
      labelObj.backing.fillStyle(COLORS.labelBacking, 0.75);
      labelObj.backing.fillRoundedRect(-46, -11, 92, 22, 6);
      labelObj.backing.setPosition(lx, ly);

      labelObj.text.setText(name);
      labelObj.text.setPosition(lx, ly);
    }
  }

  triggerMalfunction() {
    const options = [
      { type: "LABEL_SLIP", weight: 3, durationMs: 10000, chaosAdd: 4, label: "LABEL SLIP" },
      { type: "TORQUE_REVERSAL", weight: 2, durationMs: 6000, chaosAdd: 5, label: "TORQUE REVERSAL" },
      { type: "GEAR_DRAG", weight: 1, durationMs: 8000, chaosAdd: 3, label: "GEAR DRAG" }
    ];

    const pick = weightedPick(options);
    this.malfunction = {
      type: pick.type,
      timeLeftMs: pick.durationMs,
      durationMs: pick.durationMs,
      label: pick.label
    };

    this.chaos += pick.chaosAdd;
    this.chaos = Phaser.Math.Clamp(this.chaos, 0, 100);

    this.showMalfunctionBanner();
  }

  updateMalfunction(deltaMs) {
    if (!this.malfunction) {
      return;
    }
    this.malfunction.timeLeftMs -= deltaMs;
    if (this.malfunction.timeLeftMs < 0) {
      this.malfunction.timeLeftMs = 0;
    }
    this.updateMalfunctionBanner();

    if (this.malfunction.timeLeftMs <= 0) {
      if (this.malfunction.type === "LABEL_SLIP") {
        this.chaos = Math.max(0, this.chaos - 2);
      }
      this.malfunction = null;
      this.hideMalfunctionBanner();
      this.chaos = Phaser.Math.Clamp(this.chaos, 0, 100);
    }
  }

  showMalfunctionBanner() {
    this.malfunctionBanner.setVisible(true);
    this.updateMalfunctionBanner();
  }

  updateMalfunctionBanner() {
    if (!this.malfunction) {
      return;
    }
    const secondsLeft = Math.ceil(this.malfunction.timeLeftMs / 1000);
    this.malfunctionBannerText.setText(`MALFUNCTION: ${this.malfunction.label} (${secondsLeft}s)`);
  }

  hideMalfunctionBanner() {
    this.malfunctionBanner.setVisible(false);
  }

  updateDifficulty(elapsedMs) {
    while (elapsedMs >= this.nextMinuteMarkMs) {
      this.minuteCount += 1;
      this.nextMinuteMarkMs += 60000;

      this.spawnIntervalMs = Math.max(
        this.spawnIntervalMsMin,
        this.spawnIntervalMs - this.spawnIntervalDecayPerMinute
      );
      if (this.spawnEvent) {
        this.spawnEvent.reset({
          delay: this.spawnIntervalMs,
          loop: true,
          callback: () => {
            if (this.canSpawn()) {
              this.spawnForm();
            }
          },
          callbackScope: this
        });
      }

      this.fallSpeed = Math.min(
        this.fallSpeedMax,
        this.fallSpeedStart + this.minuteCount * this.fallSpeedPerMinute
      );

      if ((this.minuteCount === 2 || this.minuteCount === 4) && !this.malfunction) {
        this.triggerMalfunction();
      }
    }
  }

  updateForms(deltaMs) {
    const deltaSec = deltaMs / 1000;
    for (let i = 0; i < this.forms.length; i += 1) {
      this.forms[i].container.y += this.fallSpeed * deltaSec;
    }

    const missY = this.WHEEL_Y + this.R_OUT;
    for (let i = this.forms.length - 1; i >= 0; i -= 1) {
      if (this.forms[i].container.y > missY) {
        this.forms[i].container.destroy(true);
        this.forms.splice(i, 1);
        this.missedCount += 1;
        this.chaos += 7;
        this.chaos = Phaser.Math.Clamp(this.chaos, 0, 100);
        this.logEvent("MISSED!", COLORS.missed);
      }
    }
  }

  rotateWheel(deltaMs) {
    let dir = 0;
    if (this.keyLeft.isDown) {
      dir -= 1;
    }
    if (this.keyRight.isDown) {
      dir += 1;
    }
    if (dir === 0) {
      return;
    }

    if (this.isTorqueReversed()) {
      dir = -dir;
    }

    const speed = this.getEffectiveAngularSpeed();
    this.wheelRotation += dir * speed * (deltaMs / 1000);
    this.wheelRotation = normalizeAngle(this.wheelRotation);
  }

  updateUI() {
    this.timerText.setText(`SHIFT: ${formatTime(this.timeLeftMs)}`);
    this.filedText.setText(`FILED: ${this.filedCount}`);
    this.misfileText.setText(`MISFILE: ${this.misfileCount}`);
    this.missedText.setText(`MISSED: ${this.missedCount}`);

    const fillWidth = Math.round(220 * (this.chaos / 100));
    let fillColor = 0x66ff99;
    if (this.chaos >= 70) {
      fillColor = 0xff5c7a;
    } else if (this.chaos >= 40) {
      fillColor = 0xffcc66;
    }
    this.chaosFillGfx.clear();
    if (fillWidth > 0) {
      this.chaosFillGfx.fillStyle(fillColor, 1);
      this.chaosFillGfx.fillRect(720, 16, fillWidth, 14);
    }
  }

  checkEndConditions() {
    const lose = this.chaos >= 100 || this.missedCount >= 10;
    const win = this.timeLeftMs <= 0 && this.chaos < 100;

    if (lose) {
      this.endGame(false);
    } else if (win) {
      this.endGame(true);
    }
  }

  endGame(winFlag) {
    this.gameEnded = true;
    this.didWin = winFlag;
    this.paused = false;

    if (this.spawnEvent) {
      this.spawnEvent.remove(false);
    }

    for (let i = 0; i < this.forms.length; i += 1) {
      this.forms[i].container.destroy(true);
    }
    this.forms = [];

    this.malfunction = null;
    this.hideMalfunctionBanner();
    this.pauseOverlay.setVisible(false);

    const overlay = this.add.container(0, 0).setDepth(10);
    const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0, 0);
    overlay.add(dim);

    let title = "MECHANISM FAILURE";
    let subtitle = "THE WHEEL DESYNCHRONIZED";
    if (winFlag) {
      const grade = computeGrade(this.filedCount);
      title = "SHIFT COMPLETE";
      subtitle = `GRADE: ${grade}`;
    }

    const titleText = this.add.text(GAME_WIDTH / 2, 180, title, {
      fontFamily: "Courier New",
      fontSize: "32px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);

    const subtitleText = this.add.text(GAME_WIDTH / 2, 230, subtitle, {
      fontFamily: "Courier New",
      fontSize: "22px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);

    const statsText = this.add.text(GAME_WIDTH / 2, 290,
      `FILED: ${this.filedCount}\nMISFILE: ${this.misfileCount}\nMISSED: ${this.missedCount}\nCHAOS: ${this.chaos}`,
      {
        fontFamily: "Courier New",
        fontSize: "18px",
        color: COLORS.text,
        align: "center"
      }
    ).setOrigin(0.5);

    const promptText = this.add.text(GAME_WIDTH / 2, 420, "Press R to Restart", {
      fontFamily: "Courier New",
      fontSize: "18px",
      color: COLORS.text,
      align: "center"
    }).setOrigin(0.5);

    overlay.add([titleText, subtitleText, statsText, promptText]);
  }

  togglePause() {
    if (this.gameEnded) {
      return;
    }
    this.paused = !this.paused;
    this.pauseOverlay.setVisible(this.paused);
  }

  logEvent(text, color) {
    if (this.eventLogTween) {
      this.eventLogTween.stop();
    }
    this.eventLogText.setText(text);
    this.eventLogText.setColor(color);
    this.eventLogText.setAlpha(1);
    this.eventLogTween = this.tweens.add({
      targets: this.eventLogText,
      alpha: 0,
      duration: 1200,
      ease: "Linear"
    });
  }

  update(time, delta) {
    if (this.awaitingStart) {
      if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
        this.startGame();
      }
      return;
    }
    if (this.gameEnded) {
      if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
        this.scene.restart();
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.togglePause();
    }

    if (this.paused) {
      return;
    }

    this.elapsedMs += delta;
    this.timeLeftMs = Math.max(0, this.SHIFT_DURATION_MS - this.elapsedMs);

    this.updateDifficulty(this.elapsedMs);
    this.updateMalfunction(delta);
    this.rotateWheel(delta);

    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.handleStamp();
    }

    this.updateForms(delta);
    this.redrawWheel();
    this.updateUI();
    this.checkEndConditions();
  }
}

function normalizeAngle(angle) {
  let a = angle;
  while (a <= -Math.PI) {
    a += Math.PI * 2;
  }
  while (a > Math.PI) {
    a -= Math.PI * 2;
  }
  return a;
}

function angleDistance(a, b) {
  return Math.abs(normalizeAngle(a - b));
}

function formatTime(ms) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function pad2(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function weightedPick(options) {
  let total = 0;
  for (let i = 0; i < options.length; i += 1) {
    total += options[i].weight;
  }
  let roll = Math.random() * total;
  for (let i = 0; i < options.length; i += 1) {
    roll -= options[i].weight;
    if (roll <= 0) {
      return options[i];
    }
  }
  return options[options.length - 1];
}

function computeGrade(filedCount) {
  if (filedCount >= 78) {
    return "A";
  }
  if (filedCount >= 60) {
    return "B";
  }
  if (filedCount >= 45) {
    return "C";
  }
  return "D";
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#151826",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: GameScene
};

new Phaser.Game(config);
