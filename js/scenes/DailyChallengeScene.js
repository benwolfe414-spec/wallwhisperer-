/**
 * DailyChallengeScene — intro screen for the daily puzzle.
 * Shows streak, best score, and whether today's challenge is done.
 */
class DailyChallengeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DailyChallengeScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.W = W;
    this.H = H;

    this.drawBg();

    const alreadyDone = DailyChallenge.isCompletedToday();
    const streak = DailyChallenge.getStreak();
    const best = DailyChallenge.getBestScore();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const dailyLevel = DailyChallenge.getTodayLevel();

    // Header
    this.add.text(W / 2, 60, '📅 DAILY CHALLENGE', {
      fontSize: '28px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#f5a623',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(W / 2, 102, today, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaa'
    }).setOrigin(0.5);

    // Streak display
    this.drawStreakBadge(W / 2, H * 0.25, streak);

    // Today's room info
    const infoY = H * 0.42;
    this.add.rectangle(W / 2, infoY, W - 48, 120, 0x2a2a3e, 1)
      .setStrokeStyle(2, 0x444466);

    this.add.text(W / 2, infoY - 42, "Today's Room", {
      fontSize: '13px', color: '#888', fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.add.text(W / 2, infoY - 20, `${dailyLevel.icon || '🏠'}  ${dailyLevel.name}`, {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#fff'
    }).setOrigin(0.5);

    this.add.text(W / 2, infoY + 8, `${dailyLevel.problems.length} problems  •  ${dailyLevel.timeLimit}s limit`, {
      fontSize: '15px', color: '#aaa', fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.add.text(W / 2, infoY + 36, `Best Daily Score: ${best}`, {
      fontSize: '15px', color: '#f5a623', fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    if (alreadyDone) {
      this.showCompletedState(W, H);
    } else {
      this.showPlayButton(W, H, dailyLevel);
    }

    this.drawBackButton(H);
  }

  drawBg() {
    const { W, H } = this;
    this.add.rectangle(0, 0, W, H, 0x1a1a2e, 1).setOrigin(0, 0);
    // Stars
    for (let i = 0; i < 30; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H * 0.5),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.5)
      );
      this.tweens.add({
        targets: s, alpha: 0.05, duration: Phaser.Math.Between(800, 2000),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  drawStreakBadge(cx, cy, streak) {
    const g = this.add.graphics();
    g.fillStyle(streak >= 7 ? 0xf5a623 : streak >= 3 ? 0xff8800 : 0x333355, 1);
    g.fillRoundedRect(cx - 90, cy - 44, 180, 88, 16);

    this.add.text(cx, cy - 24, streak > 0 ? '🔥' : '💤', {
      fontSize: '32px'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 10, streak === 0
      ? 'No streak yet'
      : `${streak} day streak!`, {
      fontSize: streak > 0 ? '18px' : '14px',
      fontFamily: 'Arial Black, sans-serif',
      color: streak > 0 ? '#fff' : '#666'
    }).setOrigin(0.5);
  }

  showPlayButton(W, H, dailyLevel) {
    const btn = this.add.rectangle(W / 2, H * 0.68, 280, 72, 0xf5a623, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xffffff);

    this.add.text(W / 2, H * 0.68, '▶  START TODAY\'S ROOM', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#1a1a2e'
    }).setOrigin(0.5).setDepth(1);

    btn.on('pointerdown', () => {
      SoundManager.tap();
      this.tweens.add({
        targets: btn, scaleX: 0.93, scaleY: 0.93, duration: 80, yoyo: true,
        onComplete: () => this.scene.start('GameScene', {
          level: dailyLevel.id,
          score: 0,
          dailyLevel,
          isDaily: true
        })
      });
    });
    btn.on('pointerover', () => btn.setFillStyle(0xffbb44));
    btn.on('pointerout', () => btn.setFillStyle(0xf5a623));

    this.add.text(W / 2, H * 0.76, 'One attempt per day. Make it count!', {
      fontSize: '14px', color: '#666', fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  showCompletedState(W, H) {
    this.add.rectangle(W / 2, H * 0.67, W - 48, 100, 0x1e3a2f, 1)
      .setStrokeStyle(2, 0x4caf50);

    this.add.text(W / 2, H * 0.64, '✅ Today\'s challenge complete!', {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#4caf50'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.70, 'Come back tomorrow for a new room 🕐', {
      fontSize: '15px', color: '#aaa', fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    // Next unlock countdown
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diffMs = tomorrow - now;
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);

    this.add.text(W / 2, H * 0.76, `Next room in ${h}h ${m}m`, {
      fontSize: '14px', color: '#555', fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  drawBackButton(H) {
    const back = this.add.text(20, H - 30, '← Menu', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#666'
    }).setOrigin(0, 1).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('MenuScene'));
    back.on('pointerover', () => back.setColor('#aaa'));
    back.on('pointerout', () => back.setColor('#666'));
  }
}
