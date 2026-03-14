class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Draw all assets programmatically — no external image files needed
  }

  create() {
    this.scene.start('MenuScene');
  }
}
