const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 430,
  height: 932,
  backgroundColor: '#1a1a2e',
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: Math.min(window.devicePixelRatio || 1, 3)
  },
  scene: [BootScene, MenuScene, HouseScene, DailyChallengeScene, GameScene, ResultScene]
};

new Phaser.Game(config);
