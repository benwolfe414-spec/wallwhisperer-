/**
 * HouseScene — persistent fixer-upper map.
 * Shows all 7 rooms as cards. Completed rooms show as restored.
 * Progress is saved to localStorage.
 */
class HouseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HouseScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.W = W;
    this.H = H;

    this.progress = this.loadProgress();

    this.drawBackground();
    this.drawHeader();
    this.drawRoomGrid();
    this.drawBackButton();
    this.drawTotalProgress();
  }

  loadProgress() {
    try {
      return JSON.parse(localStorage.getItem('fixitfast_house')) || {};
    } catch { return {}; }
  }

  static saveRoomComplete(levelId) {
    try {
      const data = JSON.parse(localStorage.getItem('fixitfast_house')) || {};
      data[levelId] = true;
      localStorage.setItem('fixitfast_house', JSON.stringify(data));
    } catch {}
  }

  drawBackground() {
    const { W, H } = this;
    const g = this.add.graphics();
    // Gradient-style bg
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x16213e, 0.6);
    g.fillRect(0, H * 0.5, W, H * 0.5);
  }

  drawHeader() {
    const { W } = this;
    this.add.rectangle(0, 0, this.W, 70, 0x111122, 0.95).setOrigin(0, 0);

    this.add.text(W / 2, 14, 'MY FIXER-UPPER', {
      fontSize: '26px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#f5a623',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5, 0);

    this.add.text(W / 2, 44, 'Restore your house room by room', {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#888'
    }).setOrigin(0.5, 0);
  }

  drawTotalProgress() {
    const { W, H } = this;
    const completed = LEVELS.filter(l => this.progress[l.id]).length;
    const total = LEVELS.length;
    const pct = Math.round((completed / total) * 100);

    const y = H - 68;
    this.add.rectangle(0, y - 10, this.W, 80, 0x111122, 0.9).setOrigin(0, 0);

    this.add.text(20, y, `House Restored: ${pct}%  (${completed}/${total} rooms)`, {
      fontSize: '15px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    });

    // Progress bar
    const barW = W - 40;
    this.add.rectangle(20, y + 26, barW, 14, 0x333355).setOrigin(0, 0);
    if (completed > 0) {
      this.add.rectangle(20, y + 26, barW * (completed / total), 14, 0xf5a623).setOrigin(0, 0);
    }
  }

  drawRoomGrid() {
    const { W, H } = this;
    const cols = 2;
    const cardW = (W - 48) / cols;
    const cardH = 108;
    const startY = 86;
    const padX = 16;
    const padY = 10;

    LEVELS.forEach((level, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padX + col * (cardW + 16);
      const y = startY + row * (cardH + padY);

      this.drawRoomCard(level, x, y, cardW, cardH);
    });
  }

  drawRoomCard(level, x, y, w, h) {
    const { W } = this;
    const done = !!this.progress[level.id];

    // Determine lock state — room unlocks when previous is done (or it's level 1)
    const prevDone = level.id === 1 || !!this.progress[level.id - 1];
    const locked = !prevDone;

    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h,
      done ? 0x1e3a2f : locked ? 0x1a1a2e : 0x2a2a3e, 1)
      .setStrokeStyle(2, done ? 0x4caf50 : locked ? 0x333355 : 0x444466);

    // Icon
    this.add.text(x + 20, y + h / 2, level.icon, {
      fontSize: '36px'
    }).setOrigin(0, 0.5).setAlpha(locked ? 0.3 : 1);

    // Room name
    this.add.text(x + 68, y + 14, level.name, {
      fontSize: '15px',
      fontFamily: 'Arial Black, sans-serif',
      color: done ? '#81c784' : locked ? '#555' : '#fff'
    });

    if (done) {
      this.add.text(x + 68, y + 36, '✓ Restored!', {
        fontSize: '13px',
        color: '#4caf50',
        fontFamily: 'Arial, sans-serif'
      });
      this.add.text(x + w - 10, y + 14,
        `⏱ ${level.timeLimit}s`, {
        fontSize: '12px', color: '#555', fontFamily: 'Arial, sans-serif'
      }).setOrigin(1, 0);
    } else if (locked) {
      this.add.text(x + 68, y + 36, '🔒 Locked', {
        fontSize: '13px',
        color: '#555',
        fontFamily: 'Arial, sans-serif'
      });
    } else {
      this.add.text(x + 68, y + 36, `${level.problems.length} problems  •  ${level.timeLimit}s`, {
        fontSize: '12px',
        color: '#888',
        fontFamily: 'Arial, sans-serif'
      });
    }

    // Tap bar
    this.add.rectangle(x + 68, y + h - 20, w - 78, 8, 0x111133).setOrigin(0, 0.5);
    if (done) {
      this.add.rectangle(x + 68, y + h - 20, w - 78, 8, 0x4caf50).setOrigin(0, 0.5);
    }

    // Replay badge if done
    if (done) {
      const replay = this.add.text(x + w - 10, y + h - 24, '↺ Replay', {
        fontSize: '12px',
        color: '#aaa',
        fontFamily: 'Arial, sans-serif'
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
      replay.on('pointerdown', () => this.startRoom(level));
      replay.on('pointerover', () => replay.setColor('#fff'));
      replay.on('pointerout', () => replay.setColor('#aaa'));
    }

    // Make unlocked cards tappable
    if (!locked) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.startRoom(level));
      bg.on('pointerover', () => bg.setFillStyle(done ? 0x234a35 : 0x333355));
      bg.on('pointerout', () => bg.setFillStyle(done ? 0x1e3a2f : 0x2a2a3e));
    }
  }

  startRoom(level) {
    SoundManager.tap();
    this.scene.start('GameScene', {
      level: level.id,
      score: 0,
      fromHouse: true
    });
  }

  drawBackButton() {
    const back = this.add.text(20, this.H - 30, '← Menu', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#666'
    }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('MenuScene'));
    back.on('pointerover', () => back.setColor('#aaa'));
    back.on('pointerout', () => back.setColor('#666'));
  }
}
