class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelIndex = (data.level || 1) - 1;
    this.totalScore = data.score || 0;
    this.fromHouse = data.fromHouse || false;
    this.isDaily = data.isDaily || false;
    // If a custom daily level object was passed in, use it directly
    this.customLevel = data.dailyLevel || null;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.W = W;
    this.H = H;

    const levelData = this.customLevel || LEVELS[this.levelIndex];
    this.levelData = levelData;
    this.timeLeft = levelData.timeLimit;
    this.fixedCount = 0;
    this.activeProblem = null;

    this.drawRoom(levelData);
    this.spawnProblems(levelData);
    this.createHUD(levelData);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true
    });
  }

  // ─── Room Drawing ────────────────────────────────────────────────
  drawRoom(level) {
    const { W, H } = this;
    const g = this.add.graphics();

    g.fillStyle(level.floorColor, 1);
    g.fillRect(0, H * 0.72, W, H * 0.28);

    g.fillStyle(level.wallColor, 1);
    g.fillRect(0, H * 0.14, W, H * 0.58);

    g.fillStyle(0x222233, 1);
    g.fillRect(0, H * 0.14, W, 14);

    g.fillStyle(0xffffff, 0.15);
    g.fillRect(0, H * 0.70, W, 10);

    g.fillStyle(0x87ceeb, 0.8);
    g.fillRect(W * 0.6, H * 0.22, 120, 90);
    g.lineStyle(4, 0xffffff, 0.9);
    g.strokeRect(W * 0.6, H * 0.22, 120, 90);
    g.lineBetween(W * 0.6 + 60, H * 0.22, W * 0.6 + 60, H * 0.22 + 90);
    g.lineBetween(W * 0.6, H * 0.22 + 45, W * 0.6 + 120, H * 0.22 + 45);

    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(W * 0.08, H * 0.46, 80, 160);
    g.fillStyle(0xf5c518, 1);
    g.fillCircle(W * 0.08 + 68, H * 0.46 + 85, 8);

    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(W * 0.5 - 110, H * 0.15, 220, 34, 8);
  }

  // ─── Spawn Problems ──────────────────────────────────────────────
  spawnProblems(level) {
    this.problems = [];

    level.problems.forEach((prob) => {
      const px = this.W * prob.x;
      const py = this.H * prob.y;

      const container = this.add.container(px, py);

      const glow = this.add.circle(0, 0, 36, 0xff4444, 0.25);
      container.add(glow);

      const icon = this.add.graphics();
      this.drawProblemIcon(icon, prob.type, 0, 0);
      container.add(icon);

      const tag = this.add.text(0, 44, prob.label, {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#000000cc',
        padding: { x: 6, y: 3 }
      }).setOrigin(0.5);
      container.add(tag);

      const hitZone = this.add.circle(px, py, 40, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });

      hitZone.on('pointerdown', () => this.startFix(prob, container, glow, hitZone));

      this.tweens.add({
        targets: glow,
        scaleX: 1.3, scaleY: 1.3, alpha: 0.5,
        duration: 700, yoyo: true, repeat: -1
      });

      this.problems.push({ data: prob, container, glow, hitZone, fixed: false, tapsLeft: prob.taps });
    });
  }

  drawProblemIcon(g, type, x, y) {
    switch (type) {
      case 'crack':
        g.lineStyle(4, 0xff4444, 1);
        g.lineBetween(x - 10, y - 20, x + 5, y);
        g.lineBetween(x + 5, y, x - 5, y + 10);
        g.lineBetween(x - 5, y + 10, x + 10, y + 22);
        break;
      case 'pipe':
        g.fillStyle(0x4488ff, 1);
        g.fillRect(x - 12, y - 20, 24, 40);
        g.fillStyle(0x88bbff, 0.8);
        for (let i = 0; i < 4; i++) g.fillRect(x - 18, y - 14 + i * 10, 8, 6);
        break;
      case 'outlet':
        g.fillStyle(0xffcc00, 1);
        g.fillRect(x - 16, y - 20, 32, 38);
        g.fillStyle(0x333333, 1);
        g.fillRect(x - 6, y - 12, 5, 10);
        g.fillRect(x + 1, y - 12, 5, 10);
        g.fillCircle(x, y + 8, 4);
        break;
      case 'cabinet':
        g.fillStyle(0x8b5e3c, 1);
        g.fillRect(x - 18, y - 18, 36, 36);
        g.lineStyle(3, 0x000, 0.5);
        g.strokeRect(x - 18, y - 18, 36, 36);
        g.fillStyle(0xffd700, 1);
        g.fillCircle(x + 8, y, 5);
        break;
      case 'mold':
        g.fillStyle(0x2d6a2d, 0.9);
        g.fillCircle(x, y, 18);
        g.fillStyle(0x1a4a1a, 0.7);
        g.fillCircle(x - 8, y + 6, 10);
        g.fillCircle(x + 9, y - 5, 8);
        break;
      case 'paint':
        g.fillStyle(0xdd6633, 0.9);
        g.fillRect(x - 14, y - 20, 28, 38);
        g.lineStyle(3, 0xaa3311, 1);
        g.lineBetween(x - 14, y + 5, x + 14, y + 5);
        break;
    }
  }

  // ─── Fix Interaction ─────────────────────────────────────────────
  startFix(prob, container, glow, hitZone) {
    if (this.activeProblem) return;
    const entry = this.problems.find(p => p.data.id === prob.id);
    if (!entry || entry.fixed) return;
    SoundManager.tap();
    this.activeProblem = entry;
    this.showFixPanel(prob, entry);
  }

  showFixPanel(prob, entry) {
    const { W, H } = this;

    this.overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.55).setOrigin(0).setDepth(10);
    this.panel = this.add.container(W / 2, H * 0.72).setDepth(11);

    const bg = this.add.rectangle(0, 0, W - 40, 310, 0x2a2a3e, 1).setStrokeStyle(2, 0xf5a623);
    this.panel.add(bg);

    this.panel.add(this.add.text(0, -125, prob.label, {
      fontSize: '22px', fontFamily: 'Arial Black, sans-serif', color: '#f5a623'
    }).setOrigin(0.5));

    this.panel.add(this.add.text(0, -88, `💡 ${prob.tip}`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaddff',
      wordWrap: { width: W - 80 }, align: 'center'
    }).setOrigin(0.5));

    const barBg = this.add.rectangle(0, -38, W - 100, 28, 0x111122, 1)
      .setStrokeStyle(1, 0x555577);
    this.panel.add(barBg);

    this.progressBar = this.add.rectangle(-(W - 100) / 2, -38, 0, 22, 0xf5a623, 1).setOrigin(0, 0.5);
    this.panel.add(this.progressBar);

    this.tapCountText = this.add.text(0, -38, `Tap to fix! (${entry.tapsLeft} taps left)`, {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#fff'
    }).setOrigin(0.5).setDepth(12);
    this.panel.add(this.tapCountText);

    const fixBtn = this.add.rectangle(0, 30, 200, 64, 0xf5a623, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xffffff);
    this.panel.add(fixBtn);

    this.panel.add(this.add.text(0, 30, '🔨  FIX IT!', {
      fontSize: '24px', fontFamily: 'Arial Black, sans-serif', color: '#1a1a2e'
    }).setOrigin(0.5).setDepth(12));

    fixBtn.on('pointerdown', () => this.tapFix(entry, prob, W));
    fixBtn.on('pointerover', () => fixBtn.setFillStyle(0xffbb44));
    fixBtn.on('pointerout', () => fixBtn.setFillStyle(0xf5a623));

    const cancelBtn = this.add.text(0, 115, '✕  Cancel', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    cancelBtn.on('pointerdown', () => this.closeFixPanel());
    this.panel.add(cancelBtn);
  }

  tapFix(entry, prob, W) {
    SoundManager.tap();
    entry.tapsLeft--;

    const maxTaps = prob.taps;
    const progress = (maxTaps - entry.tapsLeft) / maxTaps;
    const barWidth = (W - 100) * progress;

    this.tweens.add({ targets: this.progressBar, width: barWidth, duration: 120 });
    this.tapCountText.setText(
      entry.tapsLeft > 0 ? `Keep going! (${entry.tapsLeft} taps left)` : 'Fixed!'
    );

    // Color bar as it fills
    const color = progress < 0.5 ? 0xf5a623 : progress < 0.9 ? 0x88dd44 : 0x44ee88;
    this.progressBar.setFillStyle(color);

    this.cameras.main.shake(60, 0.005);

    if (entry.tapsLeft <= 0) {
      SoundManager.fix();
      this.time.delayedCall(300, () => this.completeFix(entry));
    }
  }

  completeFix(entry) {
    entry.fixed = true;
    this.activeProblem = null;
    this.closeFixPanel();

    entry.container.setAlpha(0.35);
    entry.hitZone.disableInteractive();
    this.tweens.killTweensOf(entry.glow);

    const check = this.add.text(entry.container.x, entry.container.y, '✓', {
      fontSize: '40px', color: '#00ff88', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(5);

    this.tweens.add({
      targets: check, y: check.y - 50, alpha: 0, duration: 1000,
      onComplete: () => check.destroy()
    });

    this.fixedCount++;
    this.scoreValue += 100 + Math.ceil(this.timeLeft * 2);
    this.scoreText.setText(`Score: ${this.scoreValue}`);

    const allFixed = this.problems.every(p => p.fixed);
    if (allFixed) this.endLevel(true);
  }

  closeFixPanel() {
    if (this.overlay) { this.overlay.destroy(); this.overlay = null; }
    if (this.panel) { this.panel.destroy(); this.panel = null; }
    this.activeProblem = null;
  }

  // ─── HUD ─────────────────────────────────────────────────────────
  createHUD(level) {
    const { W } = this;
    this.scoreValue = this.totalScore;

    this.add.rectangle(0, 0, W, 56, 0x111122, 0.9).setOrigin(0, 0).setDepth(8);

    const badge = this.isDaily ? '📅 ' : '';
    this.add.text(12, 10, `${badge}${level.name}`, {
      fontSize: '15px', fontFamily: 'Arial Black, sans-serif', color: '#f5a623'
    }).setDepth(9);

    this.scoreText = this.add.text(W - 12, 10, `Score: ${this.scoreValue}`, {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(1, 0).setDepth(9);

    // Mute button
    const muteBtn = this.add.text(W / 2, 10, '🔊', {
      fontSize: '20px'
    }).setOrigin(0.5, 0).setDepth(9).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const muted = SoundManager.toggleMute();
      muteBtn.setText(muted ? '🔇' : '🔊');
    });

    this.add.rectangle(0, 52, W, 8, 0x333355).setOrigin(0, 0).setDepth(8);
    this.timerBar = this.add.rectangle(0, 52, W, 8, 0xf5a623).setOrigin(0, 0).setDepth(9);

    this.timerText = this.add.text(W / 2, 28, this.formatTime(this.timeLeft), {
      fontSize: '24px', fontFamily: 'Arial Black, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(9);
  }

  tickTimer() {
    if (this.activeProblem) return;
    this.timeLeft--;

    const ratio = this.timeLeft / this.levelData.timeLimit;
    this.tweens.add({ targets: this.timerBar, width: this.W * ratio, duration: 900 });

    const color = ratio > 0.5 ? 0xf5a623 : ratio > 0.25 ? 0xff8800 : 0xff2222;
    this.timerBar.setFillStyle(color);
    this.timerText.setText(this.formatTime(this.timeLeft));

    if (this.timeLeft <= 10) {
      SoundManager.urgentTick();
      this.timerText.setColor(this.timeLeft % 2 === 0 ? '#ff4444' : '#ffffff');
    } else if (this.timeLeft % 10 === 0) {
      SoundManager.tick();
    }

    if (this.timeLeft <= 0) {
      this.timerEvent.remove();
      SoundManager.fail();
      this.endLevel(false);
    }
  }

  formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  endLevel(won) {
    this.timerEvent.remove(false);
    this.closeFixPanel();

    const bonus = won ? this.timeLeft * 5 : 0;
    this.scoreValue += bonus;

    if (won) {
      SoundManager.levelComplete();
      // Save house progress
      if (!this.isDaily) {
        HouseScene.saveRoomComplete(this.levelData.id);
      }
      // Save daily completion
      if (this.isDaily) {
        const streak = DailyChallenge.completeToday(this.scoreValue);
        if (streak > 1) SoundManager.unlock();
      }
    }

    const isLastLevel = !this.isDaily && this.levelIndex >= LEVELS.length - 1;

    this.scene.start('ResultScene', {
      won,
      score: this.scoreValue,
      level: this.levelData.id,
      fixedCount: this.fixedCount,
      totalProblems: this.levelData.problems.length,
      timeBonus: bonus,
      isLastLevel,
      fromHouse: this.fromHouse,
      isDaily: this.isDaily
    });
  }
}
