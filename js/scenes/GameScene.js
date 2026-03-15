class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelIndex = (data.level || 1) - 1;
    this.totalScore = data.score || 0;
    this.fromHouse = data.fromHouse || false;
    this.isDaily = data.isDaily || false;
    this.customLevel = data.dailyLevel || null;
  }

  // Maps problem type → mini-game mechanic
  getMechanic(type) {
    return { crack: 'hold', mold: 'hold', paint: 'hold', pipe: 'rapidtap', outlet: 'sequence', cabinet: 'timing' }[type] || 'rapidtap';
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
    this.miniGame = null;
    this.mgRefs = {};
    this.panelOpen = false;
    this.showingIntro = true;

    this.drawRoom(levelData);
    this.spawnProblems(levelData);
    this.createHUD(levelData);
    this.showLevelIntro(levelData);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true
    });
  }

  // ─── Level Intro ─────────────────────────────────────────────────
  showLevelIntro(level) {
    const { W, H } = this;
    const cont = this.add.container(W / 2, H / 2).setDepth(20);
    this.introContainer = cont;

    cont.add(this.add.rectangle(0, 0, W, H, 0x000000, 0.78));
    cont.add(this.add.text(0, -110, level.icon, { fontSize: '68px' }).setOrigin(0.5));
    cont.add(this.add.text(0, -32, level.name, {
      fontSize: '32px', fontFamily: 'Arial Black, sans-serif',
      color: '#f5a623', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5));
    cont.add(this.add.text(0, 18, `${level.problems.length} problems  •  ${level.timeLimit}s`, {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaa'
    }).setOrigin(0.5));

    const cdText = this.add.text(0, 80, '3', {
      fontSize: '56px', fontFamily: 'Arial Black, sans-serif', color: '#ffffff'
    }).setOrigin(0.5);
    cont.add(cdText);

    let count = 3;
    this.time.addEvent({
      delay: 700,
      repeat: 3,
      callback: () => {
        count--;
        if (count > 0) {
          cdText.setText(String(count));
          SoundManager.tick();
        } else {
          cdText.setText('GO!');
          cdText.setColor('#f5a623');
          SoundManager.tap();
          this.time.delayedCall(500, () => {
            cont.destroy();
            this.showingIntro = false;
          });
        }
      }
    });
  }

  // ─── Room Drawing ─────────────────────────────────────────────────
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

    // Window
    g.fillStyle(0x87ceeb, 0.8);
    g.fillRect(W * 0.6, H * 0.22, 120, 90);
    g.lineStyle(4, 0xffffff, 0.9);
    g.strokeRect(W * 0.6, H * 0.22, 120, 90);
    g.lineBetween(W * 0.6 + 60, H * 0.22, W * 0.6 + 60, H * 0.22 + 90);
    g.lineBetween(W * 0.6, H * 0.22 + 45, W * 0.6 + 120, H * 0.22 + 45);

    // Door
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(W * 0.08, H * 0.46, 80, 160);
    g.fillStyle(0xf5c518, 1);
    g.fillCircle(W * 0.08 + 68, H * 0.46 + 85, 8);

    // Room name banner
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(W * 0.5 - 110, H * 0.15, 220, 34, 8);
  }

  // ─── Spawn Problems ───────────────────────────────────────────────
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

      this.problems.push({ data: prob, container, glow, hitZone, fixed: false });
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

  // ─── Fix Interaction ──────────────────────────────────────────────
  startFix(prob, container, glow, hitZone) {
    if (this.activeProblem || this.showingIntro) return;
    const entry = this.problems.find(p => p.data.id === prob.id);
    if (!entry || entry.fixed) return;
    SoundManager.tap();
    this.activeProblem = entry;
    this.showMiniGamePanel(prob, entry);
  }

  // ─── Mini-game Panel ──────────────────────────────────────────────
  showMiniGamePanel(prob) {
    const { W, H } = this;
    const mechanic = this.getMechanic(prob.type);
    this.miniGame = this.createMiniGameState(mechanic, prob);
    this.panelOpen = true;

    const panelW = W - 40;
    const panelH = 340;
    const panelX = W / 2;
    const panelY = H * 0.5;
    const contentStartY = -panelH / 2 + 92;
    const btnY = panelH / 2 - 70;

    this.overlay = this.add.rectangle(0, 0, W, H, 0x000000, 0.62).setOrigin(0).setDepth(10);
    this.panel = this.add.container(panelX, panelY).setDepth(11);
    this.mgRefs = {};

    const borderColors = { crack: 0xff6644, pipe: 0x4499ff, outlet: 0xffcc00, cabinet: 0xcc8844, mold: 0x44aa44, paint: 0xff8844 };
    const headerHex   = { crack: '#ff6644', pipe: '#4499ff', outlet: '#ffcc00', cabinet: '#cc8844', mold: '#44aa44', paint: '#ff8844' };
    const typeEmojis  = { crack: '💥', pipe: '💧', outlet: '⚡', cabinet: '🔩', mold: '🧫', paint: '🖌️' };

    const borderColor = borderColors[prob.type] || 0xf5a623;
    const headerColor = headerHex[prob.type] || '#f5a623';

    const bg = this.add.graphics();
    bg.fillStyle(0x1e1e30, 1);
    bg.lineStyle(3, borderColor, 1);
    bg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 16);
    bg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 16);
    this.panel.add(bg);

    this.panel.add(this.add.text(0, -panelH / 2 + 30, `${typeEmojis[prob.type] || '🔧'}  ${prob.label}`, {
      fontSize: '21px', fontFamily: 'Arial Black, sans-serif', color: headerColor
    }).setOrigin(0.5));

    this.panel.add(this.add.text(0, -panelH / 2 + 60, `💡 ${prob.tip}`, {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#aaddff',
      wordWrap: { width: panelW - 32 }, align: 'center'
    }).setOrigin(0.5));

    switch (mechanic) {
      case 'hold':     this.buildHoldUI(panelW, contentStartY, btnY);    break;
      case 'rapidtap': this.buildRapidTapUI(panelW, contentStartY, btnY); break;
      case 'sequence': this.buildSequenceUI(panelW, contentStartY, btnY); break;
      case 'timing':   this.buildTimingUI(panelW, contentStartY, btnY);   break;
    }

    const cancelBtn = this.add.text(0, panelH / 2 - 20, '✕  Cancel', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    cancelBtn.on('pointerdown', () => this.closeFixPanel());
    this.panel.add(cancelBtn);
  }

  createMiniGameState(mechanic, prob) {
    switch (mechanic) {
      case 'hold':
        return { type: 'hold', progress: 0, isHolding: false,
          fillRate: 0.48 + Math.random() * 0.12,
          drainRate: 0.24 + Math.random() * 0.1 };
      case 'rapidtap':
        return { type: 'rapidtap', progress: 0,
          tapAmount: 1 / prob.taps,
          drainRate: 0.07 + (prob.taps > 5 ? 0.04 : 0) };
      case 'sequence': {
        const len = Math.min(Math.max(2, Math.ceil(prob.taps / 1.5)), 5);
        return { type: 'sequence',
          sequence: Array.from({ length: len }, () => Math.floor(Math.random() * 4)),
          playerIndex: 0, showPhase: true, failed: false };
      }
      case 'timing':
        return { type: 'timing', markerT: 0,
          speed: 1.0 + Math.random() * 0.7,
          hits: 0, hitsNeeded: Math.min(prob.taps, 5),
          hitFeedback: 0, missFeedback: 0,
          zoneMin: 0.36, zoneMax: 0.64 };
    }
  }

  // ─── HOLD: hold button to fill gauge; release = drain ─────────────
  buildHoldUI(panelW, startY, btnY) {
    this.panel.add(this.add.text(0, startY, 'HOLD the button to fill the gauge', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888'
    }).setOrigin(0.5));

    const barW = panelW - 60;
    const barY = startY + 34;
    this.panel.add(this.add.rectangle(0, barY, barW, 26, 0x111122).setStrokeStyle(1, 0x555577));
    const barFill = this.add.rectangle(-barW / 2, barY, 0, 20, 0xf5a623).setOrigin(0, 0.5);
    this.panel.add(barFill);
    this.mgRefs.barFill = barFill;
    this.mgRefs.barWidth = barW;

    const pctText = this.add.text(0, barY, '0%', {
      fontSize: '13px', fontFamily: 'Arial Black, sans-serif', color: '#fff'
    }).setOrigin(0.5).setDepth(1);
    this.panel.add(pctText);
    this.mgRefs.pctText = pctText;

    // Two overlaid buttons — orange (idle) / green (held)
    const idleBtn = this.add.graphics();
    idleBtn.fillStyle(0xf5a623, 1);
    idleBtn.fillRoundedRect(-110, btnY - 34, 220, 68, 14);
    this.panel.add(idleBtn);

    const activeBtn = this.add.graphics().setAlpha(0);
    activeBtn.fillStyle(0x88ee44, 1);
    activeBtn.fillRoundedRect(-110, btnY - 34, 220, 68, 14);
    this.panel.add(activeBtn);

    const btnText = this.add.text(0, btnY, '👆  HOLD', {
      fontSize: '26px', fontFamily: 'Arial Black, sans-serif', color: '#1a1a2e'
    }).setOrigin(0.5);
    this.panel.add(btnText);
    this.mgRefs.holdBtnText = btnText;

    const hitZone = this.add.rectangle(0, btnY, 220, 68, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    this.panel.add(hitZone);

    hitZone.on('pointerdown', () => {
      if (!this.miniGame) return;
      this.miniGame.isHolding = true;
      idleBtn.setAlpha(0); activeBtn.setAlpha(1);
      btnText.setText('⬇  HOLDING...');
    });
    const stopHold = () => {
      if (!this.miniGame) return;
      this.miniGame.isHolding = false;
      idleBtn.setAlpha(1); activeBtn.setAlpha(0);
      btnText.setText('👆  HOLD');
    };
    hitZone.on('pointerup', stopHold);
    hitZone.on('pointerout', stopHold);
  }

  // ─── RAPID TAP: tap fast before the gauge drains ──────────────────
  buildRapidTapUI(panelW, startY, btnY) {
    this.panel.add(this.add.text(0, startY, "TAP fast! Don't let the gauge drain!", {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#ff8844'
    }).setOrigin(0.5));

    const barW = panelW - 60;
    const barY = startY + 34;
    this.panel.add(this.add.rectangle(0, barY, barW, 26, 0x111122).setStrokeStyle(1, 0x555577));

    const barFill = this.add.rectangle(-barW / 2, barY, 0, 20, 0xf5a623).setOrigin(0, 0.5);
    this.panel.add(barFill);
    this.mgRefs.barFill = barFill;
    this.mgRefs.barWidth = barW;

    const pctText = this.add.text(0, barY, '0%', {
      fontSize: '13px', fontFamily: 'Arial Black, sans-serif', color: '#fff'
    }).setOrigin(0.5).setDepth(1);
    this.panel.add(pctText);
    this.mgRefs.pctText = pctText;

    const tapBtnG = this.add.graphics();
    tapBtnG.fillStyle(0xf5a623, 1);
    tapBtnG.lineStyle(3, 0xffd700, 1);
    tapBtnG.fillRoundedRect(-110, btnY - 34, 220, 68, 14);
    tapBtnG.strokeRoundedRect(-110, btnY - 34, 220, 68, 14);
    this.panel.add(tapBtnG);

    const tapBtnText = this.add.text(0, btnY, '👊  TAP!', {
      fontSize: '28px', fontFamily: 'Arial Black, sans-serif', color: '#1a1a2e'
    }).setOrigin(0.5);
    this.panel.add(tapBtnText);

    const tapHZ = this.add.rectangle(0, btnY, 220, 68, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    this.panel.add(tapHZ);

    tapHZ.on('pointerdown', () => {
      if (!this.miniGame || !this.panelOpen) return;
      SoundManager.tap();
      this.miniGame.progress = Math.min(1, this.miniGame.progress + this.miniGame.tapAmount);
      this.tweens.add({ targets: tapBtnText, scaleX: 0.87, scaleY: 0.87, duration: 55, yoyo: true });
      if (this.miniGame.progress >= 1) {
        this.miniGame = null;
        this.completeFix(this.activeProblem);
      }
    });
  }

  // ─── SEQUENCE: watch color pattern, then tap it back ──────────────
  buildSequenceUI(panelW, startY, btnY) {
    const mg = this.miniGame;
    const COLORS  = [0xff4444, 0xf5a623, 0x44cc44, 0x4488ff];
    const HEX     = ['#ff4444', '#f5a623', '#44cc44', '#4488ff'];
    const LABELS  = ['R', 'Y', 'G', 'B'];
    mg.COLORS = COLORS; mg.HEX = HEX;

    const instrText = this.add.text(0, startY, 'MEMORIZE the sequence!', {
      fontSize: '15px', fontFamily: 'Arial Black, sans-serif', color: '#f5a623'
    }).setOrigin(0.5);
    this.panel.add(instrText);
    this.mgRefs.seqInstruction = instrText;

    // Display dots (show which colors are in the sequence)
    const seqLen = mg.sequence.length;
    const dotGap = 36;
    const seqOffX = -(seqLen - 1) * dotGap / 2;
    const seqY = startY + 44;
    mg.seqDisplayDots = [];
    for (let i = 0; i < seqLen; i++) {
      const dot = this.add.circle(seqOffX + i * dotGap, seqY, 13, COLORS[mg.sequence[i]], 0.25);
      this.panel.add(dot);
      mg.seqDisplayDots.push(dot);
    }

    // Progress dots (fill as player taps correctly)
    const progressY = seqY + 34;
    mg.progressDots = [];
    for (let i = 0; i < seqLen; i++) {
      const dot = this.add.circle(seqOffX + i * dotGap, progressY, 8, 0x333355);
      this.panel.add(dot);
      mg.progressDots.push(dot);
    }

    const feedbackText = this.add.text(0, progressY + 26, '', {
      fontSize: '15px', fontFamily: 'Arial Black, sans-serif', color: '#ff4444'
    }).setOrigin(0.5);
    this.panel.add(feedbackText);
    this.mgRefs.seqFeedback = feedbackText;

    // Four color buttons (R, Y, G, B)
    const btnGap = 70;
    const bx0 = -(1.5 * btnGap);
    mg.colorBtns = [];
    for (let i = 0; i < 4; i++) {
      const bx = bx0 + i * btnGap;
      const btnG = this.add.graphics();
      btnG.fillStyle(COLORS[i], 0.3);
      btnG.lineStyle(3, COLORS[i], 1);
      btnG.fillRoundedRect(bx - 28, btnY - 28, 56, 56, 10);
      btnG.strokeRoundedRect(bx - 28, btnY - 28, 56, 56, 10);
      this.panel.add(btnG);

      this.panel.add(this.add.text(bx, btnY, LABELS[i], {
        fontSize: '20px', fontFamily: 'Arial Black, sans-serif', color: HEX[i]
      }).setOrigin(0.5));

      const hz = this.add.rectangle(bx, btnY, 56, 56, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });
      this.panel.add(hz);

      const idx = i;
      hz.on('pointerdown', () => this.handleSequenceTap(idx));
      mg.colorBtns.push({ btnG, hitZone: hz });
    }

    this.runSequenceShowPhase();
  }

  runSequenceShowPhase() {
    const mg = this.miniGame;
    if (!mg || mg.type !== 'sequence') return;
    mg.colorBtns.forEach(b => b.hitZone.disableInteractive());

    let i = 0;
    const flashNext = () => {
      if (!this.panelOpen || !this.miniGame || this.miniGame !== mg) return;
      if (i >= mg.sequence.length) {
        this.mgRefs.seqInstruction?.setText('Your turn! Tap in order:');
        this.mgRefs.seqInstruction?.setColor('#4fc3f7');
        mg.colorBtns.forEach(b => b.hitZone.setInteractive({ useHandCursor: true }));
        mg.showPhase = false;
        return;
      }
      const colorIdx = mg.sequence[i];
      mg.seqDisplayDots[i].setAlpha(1.0);
      mg.colorBtns[colorIdx].btnG.setAlpha(1.0);
      SoundManager.tap();
      this.time.delayedCall(380, () => {
        if (!this.panelOpen || !this.miniGame || this.miniGame !== mg) return;
        mg.seqDisplayDots[i].setAlpha(0.25);
        mg.colorBtns[colorIdx].btnG.setAlpha(0.3);
        i++;
        this.time.delayedCall(140, flashNext);
      });
    };
    this.time.delayedCall(450, flashNext);
  }

  handleSequenceTap(colorIdx) {
    const mg = this.miniGame;
    if (!mg || mg.showPhase || mg.failed || !this.panelOpen) return;

    if (colorIdx === mg.sequence[mg.playerIndex]) {
      SoundManager.tap();
      mg.colorBtns[colorIdx].btnG.setAlpha(1.0);
      mg.progressDots[mg.playerIndex].setFillStyle(mg.COLORS[colorIdx]);
      mg.playerIndex++;
      this.time.delayedCall(200, () => {
        if (mg.colorBtns[colorIdx]) mg.colorBtns[colorIdx].btnG.setAlpha(0.3);
      });
      if (mg.playerIndex >= mg.sequence.length) {
        this.time.delayedCall(300, () => {
          if (this.activeProblem) this.completeFix(this.activeProblem);
        });
      }
    } else {
      SoundManager.wrongTap();
      mg.failed = true;
      mg.playerIndex = 0;
      this.mgRefs.seqFeedback?.setText('❌ Wrong! Watch again...');
      mg.progressDots.forEach(d => d.setFillStyle(0x333355));
      mg.colorBtns.forEach(b => b.hitZone.disableInteractive());
      this.cameras.main.shake(120, 0.007);
      this.time.delayedCall(950, () => {
        if (!this.panelOpen || !this.miniGame || this.miniGame !== mg) return;
        mg.failed = false;
        mg.showPhase = true;
        this.mgRefs.seqFeedback?.setText('');
        this.mgRefs.seqInstruction?.setText('MEMORIZE the sequence!');
        this.mgRefs.seqInstruction?.setColor('#f5a623');
        mg.seqDisplayDots.forEach(d => d.setAlpha(0.25));
        this.runSequenceShowPhase();
      });
    }
  }

  // ─── TIMING: tap when the moving marker is in the green zone ──────
  buildTimingUI(panelW, startY, btnY) {
    const mg = this.miniGame;
    const barW = panelW - 60;
    const barH = 44;
    const barY = startY + 28;

    this.panel.add(this.add.text(0, startY - 10, 'Tap when the marker hits the green zone!', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#aaa'
    }).setOrigin(0.5));

    // Track background
    this.panel.add(this.add.rectangle(0, barY, barW, barH, 0x111122).setStrokeStyle(1, 0x555577));

    // Green zone fill
    const zoneW = barW * (mg.zoneMax - mg.zoneMin);
    const zoneOffX = -barW / 2 + barW * mg.zoneMin;
    this.panel.add(this.add.rectangle(zoneOffX + zoneW / 2, barY, zoneW, barH, 0x44ee44, 0.22));

    // Zone borders
    const zoneLines = this.add.graphics();
    zoneLines.lineStyle(2, 0x44ee44, 0.7);
    zoneLines.lineBetween(zoneOffX, barY - barH / 2, zoneOffX, barY + barH / 2);
    zoneLines.lineBetween(zoneOffX + zoneW, barY - barH / 2, zoneOffX + zoneW, barY + barH / 2);
    this.panel.add(zoneLines);

    this.panel.add(this.add.text(0, barY, 'ZONE', {
      fontSize: '12px', fontFamily: 'Arial Black, sans-serif', color: 'rgba(68,238,68,0.55)'
    }).setOrigin(0.5));

    // Moving marker — starts at left edge
    const marker = this.add.rectangle(-barW / 2, barY, 10, barH + 8, 0xff4444).setOrigin(0.5);
    this.panel.add(marker);
    this.mgRefs.timingMarker = marker;
    this.mgRefs.timingBarW = barW;
    this.mgRefs.timingBtnY = btnY;

    // Hit counter dots
    const hitDotsY = barY + barH / 2 + 22;
    const dotGap = 32;
    const hitStartX = -(mg.hitsNeeded - 1) * dotGap / 2;
    mg.hitDots = [];
    for (let i = 0; i < mg.hitsNeeded; i++) {
      const dot = this.add.circle(hitStartX + i * dotGap, hitDotsY, 10, 0x333355);
      this.panel.add(dot);
      mg.hitDots.push(dot);
    }

    const feedbackText = this.add.text(0, hitDotsY + 24, 'Wait for the zone...', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#888'
    }).setOrigin(0.5);
    this.panel.add(feedbackText);
    this.mgRefs.timingFeedback = feedbackText;

    // Tap button — gray until marker is in zone, then green
    const tapBtnG = this.add.graphics();
    tapBtnG.fillStyle(0x445566, 1);
    tapBtnG.fillRoundedRect(-110, btnY - 30, 220, 60, 14);
    this.panel.add(tapBtnG);
    this.mgRefs.timingBtnG = tapBtnG;

    const tapBtnText = this.add.text(0, btnY, '⏱  WAIT...', {
      fontSize: '22px', fontFamily: 'Arial Black, sans-serif', color: '#445566'
    }).setOrigin(0.5);
    this.panel.add(tapBtnText);
    this.mgRefs.timingBtnText = tapBtnText;

    const tapHZ = this.add.rectangle(0, btnY, 220, 60, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    this.panel.add(tapHZ);

    tapHZ.on('pointerdown', () => {
      const m = this.miniGame;
      if (!m || !this.panelOpen) return;
      const pos = (Math.sin(m.markerT) + 1) / 2;
      if (pos >= m.zoneMin && pos <= m.zoneMax) {
        m.hits++;
        m.hitFeedback = 0.45;
        m.hitDots[m.hits - 1].setFillStyle(0x44ee44);
        SoundManager.tap();
        if (m.hits >= m.hitsNeeded) {
          this.time.delayedCall(350, () => {
            if (this.activeProblem) this.completeFix(this.activeProblem);
          });
        }
      } else {
        m.missFeedback = 0.35;
        SoundManager.urgentTick();
        this.cameras.main.shake(80, 0.005);
      }
    });
  }

  // ─── Update Loop (continuous animation) ──────────────────────────
  update(time, delta) {
    const dt = delta / 1000;
    if (!this.miniGame || !this.panelOpen) return;
    const mg = this.miniGame;

    if (mg.type === 'hold') {
      mg.progress = mg.isHolding
        ? Math.min(1, mg.progress + dt * mg.fillRate)
        : Math.max(0, mg.progress - dt * mg.drainRate);
      this.updateProgressBar(mg.progress);
      if (mg.progress >= 1) { this.miniGame = null; this.completeFix(this.activeProblem); }

    } else if (mg.type === 'rapidtap') {
      mg.progress = Math.max(0, mg.progress - dt * mg.drainRate);
      this.updateProgressBar(mg.progress);

    } else if (mg.type === 'timing') {
      mg.markerT += dt * mg.speed;
      if (mg.hitFeedback > 0) mg.hitFeedback -= dt;
      if (mg.missFeedback > 0) mg.missFeedback -= dt;
      this.updateTimingVisuals(mg);
    }
  }

  updateProgressBar(progress) {
    const refs = this.mgRefs;
    if (!refs.barFill) return;
    refs.barFill.width = refs.barWidth * progress;
    refs.barFill.setFillStyle(progress < 0.5 ? 0xf5a623 : progress < 0.85 ? 0x88dd44 : 0x44ee88);
    refs.pctText?.setText(`${Math.round(progress * 100)}%`);
  }

  updateTimingVisuals(mg) {
    const refs = this.mgRefs;
    if (!refs.timingMarker) return;
    const barW = refs.timingBarW;
    const pos = (Math.sin(mg.markerT) + 1) / 2;
    const inZone = pos >= mg.zoneMin && pos <= mg.zoneMax;

    refs.timingMarker.x = -barW / 2 + barW * pos;
    refs.timingMarker.setFillStyle(inZone ? 0x44ee44 : 0xff4444);

    const btnY = refs.timingBtnY;
    if (refs.timingBtnG && refs.timingBtnText) {
      refs.timingBtnG.clear();
      refs.timingBtnG.fillStyle(inZone ? 0x44ee44 : 0x445566, 1);
      refs.timingBtnG.fillRoundedRect(-110, btnY - 30, 220, 60, 14);
      refs.timingBtnText.setText(inZone ? '⚡  TAP NOW!' : '⏱  WAIT...');
      refs.timingBtnText.setColor(inZone ? '#1a1a2e' : '#445566');
    }

    if (refs.timingFeedback) {
      if (mg.hitFeedback > 0)      { refs.timingFeedback.setText('✓ HIT!');              refs.timingFeedback.setColor('#44ee44'); }
      else if (mg.missFeedback > 0) { refs.timingFeedback.setText('✗ MISS');              refs.timingFeedback.setColor('#ff4444'); }
      else if (inZone)              { refs.timingFeedback.setText('▶  NOW!');             refs.timingFeedback.setColor('#44ee44'); }
      else                          { refs.timingFeedback.setText('Wait for the zone...'); refs.timingFeedback.setColor('#888888'); }
    }
  }

  // ─── HUD ──────────────────────────────────────────────────────────
  createHUD(level) {
    const { W, H } = this;
    this.scoreValue = this.totalScore;

    this.add.rectangle(0, 0, W, 56, 0x111122, 0.9).setOrigin(0, 0).setDepth(8);

    const badge = this.isDaily ? '📅 ' : '';
    this.add.text(12, 10, `${badge}${level.name}`, {
      fontSize: '15px', fontFamily: 'Arial Black, sans-serif', color: '#f5a623'
    }).setDepth(9);

    this.scoreText = this.add.text(W - 12, 10, `Score: ${this.scoreValue}`, {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#ffffff'
    }).setOrigin(1, 0).setDepth(9);

    this.timerText = this.add.text(W / 2, 28, this.formatTime(this.timeLeft), {
      fontSize: '24px', fontFamily: 'Arial Black, sans-serif', color: '#ffffff'
    }).setOrigin(0.5).setDepth(9);

    const muteBtn = this.add.text(W - 14, H - 48, '🔊', {
      fontSize: '20px'
    }).setOrigin(1, 0).setDepth(9).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const m = SoundManager.toggleMute();
      muteBtn.setText(m ? '🔇' : '🔊');
    });

    this.add.rectangle(0, 52, W, 8, 0x333355).setOrigin(0, 0).setDepth(8);
    this.timerBar = this.add.rectangle(0, 52, W, 8, 0xf5a623).setOrigin(0, 0).setDepth(9);
  }

  tickTimer() {
    if (this.activeProblem || this.showingIntro) return;
    this.timeLeft--;

    const ratio = this.timeLeft / this.levelData.timeLimit;
    this.tweens.add({ targets: this.timerBar, width: this.W * ratio, duration: 900 });
    this.timerBar.setFillStyle(ratio > 0.5 ? 0xf5a623 : ratio > 0.25 ? 0xff8800 : 0xff2222);
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

  // ─── Complete Fix ─────────────────────────────────────────────────
  completeFix(entry) {
    if (!entry || entry.fixed) return;
    entry.fixed = true;
    this.activeProblem = null;
    this.miniGame = null;
    this.panelOpen = false;
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

    SoundManager.fix();
    this.fixedCount++;
    this.scoreValue += 100 + Math.ceil(this.timeLeft * 2);
    this.scoreText.setText(`Score: ${this.scoreValue}`);

    if (this.problems.every(p => p.fixed)) this.endLevel(true);
  }

  closeFixPanel() {
    if (this.overlay) { this.overlay.destroy(); this.overlay = null; }
    if (this.panel)   { this.panel.destroy();   this.panel = null; }
    if (this.miniGame) this.miniGame.isHolding = false;
    this.activeProblem = null;
    this.panelOpen = false;
    this.mgRefs = {};
  }

  // ─── End Level ────────────────────────────────────────────────────
  endLevel(won) {
    this.timerEvent.remove(false);
    this.closeFixPanel();

    const bonus = won ? this.timeLeft * 5 : 0;
    this.scoreValue += bonus;

    if (won) {
      SoundManager.levelComplete();
      if (!this.isDaily) HouseScene.saveRoomComplete(this.levelData.id);
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
