class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const d = this.resultData;

    this.add.rectangle(0, 0, W, H, 0x1a1a2e).setOrigin(0, 0);

    if (d.won) {
      this.showWin(W, H, d);
    } else {
      this.showLoss(W, H, d);
    }
  }

  showWin(W, H, d) {
    for (let i = 0; i < 20; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(20, W - 20),
        Phaser.Math.Between(20, H - 20),
        Phaser.Math.Between(2, 5),
        0xf5a623,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      this.tweens.add({
        targets: star, alpha: 0,
        duration: Phaser.Math.Between(600, 1800),
        repeat: -1, yoyo: true, delay: Phaser.Math.Between(0, 1000)
      });
    }

    const emoji = d.isDaily ? '📅' : '🏠';
    this.add.text(W / 2, H * 0.13, emoji, { fontSize: '64px' }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.25, d.isDaily ? 'DAILY DONE!' : 'ROOM FIXED!', {
      fontSize: '44px', fontFamily: 'Arial Black, sans-serif',
      color: d.isDaily ? '#4fc3f7' : '#f5a623',
      stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.34, `Level ${d.level} Complete`, {
      fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#aaaacc'
    }).setOrigin(0.5);

    // Daily streak badge
    if (d.isDaily) {
      const streak = DailyChallenge.getStreak();
      this.add.text(W / 2, H * 0.41, `🔥 ${streak} day streak!`, {
        fontSize: '22px', fontFamily: 'Arial Black, sans-serif', color: '#f5a623'
      }).setOrigin(0.5);
    }

    // Score panel
    const panelY = d.isDaily ? H * 0.58 : H * 0.55;
    const panel = this.add.container(W / 2, panelY);
    const bg = this.add.rectangle(0, 0, W - 60, 190, 0x2a2a3e, 1).setStrokeStyle(2, 0xf5a623);
    panel.add(bg);

    panel.add(this.add.text(-120, -75, 'Fixes Completed', { fontSize: '16px', color: '#aaa', fontFamily: 'Arial, sans-serif' }));
    panel.add(this.add.text(120, -75, `${d.fixedCount} / ${d.totalProblems}`, { fontSize: '16px', color: '#fff', fontFamily: 'Arial Black, sans-serif' }).setOrigin(1, 0));

    panel.add(this.add.text(-120, -38, 'Time Bonus', { fontSize: '16px', color: '#aaa', fontFamily: 'Arial, sans-serif' }));
    panel.add(this.add.text(120, -38, `+${d.timeBonus} pts`, { fontSize: '16px', color: '#f5a623', fontFamily: 'Arial Black, sans-serif' }).setOrigin(1, 0));

    panel.add(this.add.line(0, 0, -120, 10, 120, 10, 0x444466));

    panel.add(this.add.text(-120, 30, 'Total Score', { fontSize: '20px', color: '#fff', fontFamily: 'Arial Black, sans-serif' }));
    panel.add(this.add.text(120, 30, `${d.score}`, { fontSize: '24px', color: '#f5a623', fontFamily: 'Arial Black, sans-serif' }).setOrigin(1, 0));

    // Best score tracking
    const key = d.isDaily ? 'fixitfast_daily_best' : 'fixitfast_best';
    const prev = parseInt(localStorage.getItem(key) || 0);
    if (d.score > prev) {
      localStorage.setItem(key, d.score);
      panel.add(this.add.text(0, 75, '⭐ New Best Score! ⭐', {
        fontSize: '18px', color: '#f5a623', fontFamily: 'Arial Black, sans-serif'
      }).setOrigin(0.5));
    }

    this.addButtons(W, H, d);
  }

  showLoss(W, H, d) {
    this.add.text(W / 2, H * 0.15, '🔧', { fontSize: '64px' }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.27, 'TIME\'S UP!', {
      fontSize: '46px', fontFamily: 'Arial Black, sans-serif',
      color: '#ff4444', stroke: '#000', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.36, `You fixed ${d.fixedCount} of ${d.totalProblems} problems`, {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#aaaacc'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.46, `Score: ${d.score}`, {
      fontSize: '36px', fontFamily: 'Arial Black, sans-serif', color: '#f5a623'
    }).setOrigin(0.5);

    if (d.isDaily) {
      this.add.text(W / 2, H * 0.55, `Daily streak lost. Try again tomorrow!`, {
        fontSize: '15px', color: '#888', fontFamily: 'Arial, sans-serif', align: 'center'
      }).setOrigin(0.5);
    } else {
      this.add.text(W / 2, H * 0.55, 'Practice makes perfect!\nKeep at it to beat your best time.', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#888',
        align: 'center', wordWrap: { width: W - 60 }
      }).setOrigin(0.5);
    }

    this.addButtons(W, H, d);
  }

  addButtons(W, H, d) {
    const btnY = H * 0.82;

    if (!d.isDaily && !d.isLastLevel && d.won) {
      const next = this.add.rectangle(W / 2, btnY - 44, 260, 62, 0xf5a623, 1)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, 0xffffff);
      this.add.text(W / 2, btnY - 44, 'NEXT ROOM  ▶', {
        fontSize: '22px', fontFamily: 'Arial Black, sans-serif', color: '#1a1a2e'
      }).setOrigin(0.5).setDepth(1);
      next.on('pointerdown', () => {
        SoundManager.tap();
        this.scene.start('GameScene', { level: d.level + 1, score: d.score });
      });
      next.on('pointerover', () => next.setFillStyle(0xffbb44));
      next.on('pointerout', () => next.setFillStyle(0xf5a623));
    }

    if (!d.isDaily && d.isLastLevel && d.won) {
      this.add.text(W / 2, btnY - 54, '🏆 House fully restored!\nYou\'re a real DIY pro!', {
        fontSize: '20px', fontFamily: 'Arial Black, sans-serif',
        color: '#f5a623', align: 'center'
      }).setOrigin(0.5);
    }

    if (!d.isDaily) {
      // Retry button
      const retry = this.add.rectangle(W / 2, btnY + 28, 200, 56, 0x333355, 1)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x666688);
      this.add.text(W / 2, btnY + 28, '↺  Retry Level', {
        fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ccc'
      }).setOrigin(0.5).setDepth(1);
      retry.on('pointerdown', () => {
        SoundManager.tap();
        this.scene.start('GameScene', { level: d.level, score: 0, fromHouse: d.fromHouse });
      });
    }

    // Go to house or menu
    const homeLabel = d.fromHouse ? '← My House' : 'Back to Menu';
    const homeTarget = d.fromHouse ? 'HouseScene' : 'MenuScene';
    const home = this.add.text(W / 2, d.isDaily ? btnY + 20 : btnY + 96, homeLabel, {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    home.on('pointerdown', () => {
      SoundManager.tap();
      this.scene.start(homeTarget);
    });
    home.on('pointerover', () => home.setColor('#aaa'));
    home.on('pointerout', () => home.setColor('#666'));

    if (d.isDaily) {
      const menuBtn = this.add.text(W / 2, btnY + 60, 'Back to Menu', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#555'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
      menuBtn.on('pointerover', () => menuBtn.setColor('#888'));
      menuBtn.on('pointerout', () => menuBtn.setColor('#555'));
    }
  }
}
