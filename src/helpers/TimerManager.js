export class TimerManager {
  static startGameTimer(scene) {
    console.log(scene);
    scene.gameTimer = scene.time.addEvent({
      delay: 1000,
      callback: () => this.updateTimer(scene),
      callbackScope: scene,
      loop: true,
    });

    scene.timerText = scene.add
      .text(scene.cameras.main.width / 2, 50, this.formatTime(scene.gameTime), {
        fontSize: '32px',
        fill: '#000000',
        fontFamily: 'ChakraPetch',
        fontStyle: '600',
      })
      .setOrigin(0.5);
  }

  static updateTimer(scene) {
    if (scene.timerPaused) return;

    scene.gameTime--;
    scene.timerText.setText(this.formatTime(scene.gameTime));

    if (scene.gameTime <= 0) {
      scene.endGame();
    }
  }

  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }
}
