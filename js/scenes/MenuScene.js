class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(0, 0, W, H, 0x1a1a2e).setOrigin(0, 0);

    // Decorative house outline
    this.drawHouseDecor(W / 2, H * 0.28);

    // Title
    this.add.text(W / 2, H * 0.52, 'FIX IT FAST', {
      fontSize: '48px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#f5a623',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.60, 'Repair your home before time runs out!', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ccc',
      wordWrap: { width: W - 60 },
      align: 'center'
    }).setOrigin(0.5);

    // High score display
    const best = localStorage.getItem('fixitfast_best') || 0;
    this.add.text(W / 2, H * 0.67, `Best Score: ${best}`, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#f5a623'
    }).setOrigin(0.5);

    // Play button
    const btn = this.add.rectangle(W / 2, H * 0.78, 260, 72, 0xf5a623, 1)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0xffffff);

    this.add.text(W / 2, H * 0.78, '▶  PLAY', {
      fontSize: '28px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#1a1a2e'
    }).setOrigin(0.5).setDepth(1);

    btn.on('pointerdown', () => {
      this.tweens.add({
        targets: btn,
        scaleX: 0.93,
        scaleY: 0.93,
        duration: 80,
        yoyo: true,
        onComplete: () => this.scene.start('GameScene', { level: 1, score: 0 })
      });
    });

    btn.on('pointerover', () => btn.setFillStyle(0xffbb44));
    btn.on('pointerout', () => btn.setFillStyle(0xf5a623));

    // Subtle hint
    this.add.text(W / 2, H * 0.88, 'Tap broken items to fix them', {
      fontSize: '15px',
      color: '#666',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);
  }

  drawHouseDecor(cx, cy) {
    const g = this.add.graphics();
    // House body
    g.fillStyle(0x2d2d44, 1);
    g.fillRect(cx - 90, cy - 20, 180, 120);
    // Roof
    g.fillStyle(0x8b4513, 1);
    g.fillTriangle(cx - 110, cy - 20, cx + 110, cy - 20, cx, cy - 130);
    // Door
    g.fillStyle(0x5c3d1e, 1);
    g.fillRect(cx - 22, cy + 50, 44, 50);
    // Window left
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(cx - 70, cy + 10, 40, 35);
    // Window right
    g.fillRect(cx + 30, cy + 10, 40, 35);
    // Crack on wall
    g.lineStyle(3, 0xff4444, 1);
    g.lineBetween(cx + 60, cy + 20, cx + 75, cy + 55);
    g.lineBetween(cx + 75, cy + 55, cx + 65, cy + 75);
  }
}
