import { fontStyles } from './constant/style.js';

export default class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScene' });
  }

  preload() {
    this.load.image('background', '/assets/homescreen.jpg');
    this.load.audio('bg-music', '/assets/audio/bg-music.mp3');
  }

  create() {
    const { width, height } = this.scale;
    const backgroundImage = this.add.image(width / 2, height / 2, 'background');

    // Scale image to fit while maintaining aspect ratio
    const scale = Math.max(
      width / backgroundImage.width,
      height / backgroundImage.height
    );

    backgroundImage.setScale(scale);

    // Start Button

    const buttonWidth = 260;
    const buttonHeight = 60;
    const positionX = width / 2;
    const positionY = height - 100;
    const text = "Let's Go!";

    const graphics = this.add.graphics();
    graphics.fillStyle(0xfbd148, 1);
    graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 30);

    // Create button text
    const buttonText = this.add
      .text(buttonWidth / 2, buttonHeight / 2, text, {
        fontSize: '36px',
        color: '#333',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '700',
      })
      .setOrigin(0.5);

    // Create a container to hold the graphics and text
    const button = this.add
      .container(positionX - buttonWidth / 2, positionY, [graphics, buttonText])
      .setDepth(1);

    button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    button.on('pointerdown', () => this.scene.start('GameScene'), this);

    // const startButton = this.add
    //   .rectangle(width / 2, height / 2, 200, 60, 0x4caf50)
    //   .setInteractive();

    // const startText = this.add
    //   .text(width / 2, height / 2, 'Start Game', {
    //     fontSize: '24px',
    //     color: '#fff',
    //   })
    //   .setOrigin(0.5);

    // startButton.on('pointerdown', () => {
    //   this.scene.start('GameScene');
    // });
  }
}
