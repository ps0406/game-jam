import GameScene from './GameScene.js';
import HomeScene from './HomeScene.js';
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  // backgroundColor: '#0A3523',
  physics: {
    default: 'arcade',

    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [HomeScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
