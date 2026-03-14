class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(0, 0, W, H, 0x1a1a2e).setOrigin(0, 0);
    this.drawHouseDecor(W / 2, H * 0.26);

    // Title
    this.add.text(W / 2, H * 0.47, 'FIX IT FAST', {
      fontSize: '48px', fontFamily: 'Arial Black, sans-serif',
      color: '#f5a623', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.55, 'Repair your home before time runs out!', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif',
      color: '#ccc', wordWrap: { width: W - 60 }, align: 'center'
    }).setOrigin(0.5);

    // Daily challenge button
    const dailyDone = DailyChallenge.isCompletedToday();
    const streak = DailyChallenge.getStreak();
    this.makeButton(W / 2, H * 0.645,
      dailyDone ? '📅  Daily Challenge  ✅' : '📅  Daily Challenge',
      dailyDone ? 0x1e3a2f : 0x1a3a5c,
      dailyDone ? 0x4caf50 : 0x4fc3f7,
      () => this.scene.start('DailyChallengeScene')
    );
    if (streak > 0) {
      this.add.text(W / 2 + 90, H * 0.645, `🔥${streak}`, {
        fontSize: '16px', color: '#f5a623', fontFamily: 'Arial Black, sans-serif'
      }).setOrigin(0, 0.5).setDepth(2);
    }

    // Play button
    this.makeButton(W / 2, H * 0.735, '▶  PLAY LEVELS', 0xf5a623, 0xffffff, () => {
      SoundManager.tap();
      this.scene.start('GameScene', { level: 1, score: 0 });
    }, true);

    // My House button
    this.makeButton(W / 2, H * 0.82, '🏠  MY HOUSE', 0x2a2a3e, 0xf5a623,
      () => this.scene.start('HouseScene')
    );

    // Best score
    const best = localStorage.getItem('fixitfast_best') || 0;
    this.add.text(W / 2, H * 0.895, `Best Score: ${best}`, {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#555'
    }).setOrigin(0.5);

    // Mute
    const muteBtn = this.add.text(W - 20, 16, '🔊', { fontSize: '22px' })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const m = SoundManager.toggleMute();
      muteBtn.setText(m ? '🔇' : '🔊');
    });
  }

  makeButton(x, y, label, fillColor, textColor, callback, primary = false) {
    const w = primary ? 280 : 260;
    const h = primary ? 68 : 58;

    const btn = this.add.rectangle(x, y, w, h, fillColor, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(primary ? 3 : 2, primary ? 0xffd700 : 0x444466)
      .setDepth(1);

    this.add.text(x, y, label, {
      fontSize: primary ? '26px' : '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: primary ? '#1a1a2e' : `#${textColor.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5).setDepth(2);

    btn.on('pointerdown', () => {
      SoundManager.tap();
      this.tweens.add({
        targets: btn, scaleX: 0.93, scaleY: 0.93, duration: 80, yoyo: true,
        onComplete: callback
      });
    });
    btn.on('pointerover', () => btn.setStrokeStyle(primary ? 3 : 2, 0xf5a623));
    btn.on('pointerout', () => btn.setStrokeStyle(primary ? 3 : 2, primary ? 0xffd700 : 0x444466));
  }

  drawHouseDecor(cx, cy) {
    const g = this.add.graphics();
    g.fillStyle(0x2d2d44, 1);
    g.fillRect(cx - 90, cy - 20, 180, 120);
    g.fillStyle(0x8b4513, 1);
    g.fillTriangle(cx - 110, cy - 20, cx + 110, cy - 20, cx, cy - 130);
    g.fillStyle(0x5c3d1e, 1);
    g.fillRect(cx - 22, cy + 50, 44, 50);
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(cx - 70, cy + 10, 40, 35);
    g.fillRect(cx + 30, cy + 10, 40, 35);
    // Animated crack
    g.lineStyle(3, 0xff4444, 1);
    g.lineBetween(cx + 60, cy + 20, cx + 75, cy + 55);
    g.lineBetween(cx + 75, cy + 55, cx + 65, cy + 75);
  }
}
