import Ball from './Ball.js';
import { fontStyles } from './constant/style.js';
export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.initializeGameState();
    this.playersWithVectors = {
      left: 0,
      right: 0,
    };
    this.playersWithVectors = 0;
    this.canDrawNewVectors = false;
    this.leftScore = 0;
    this.rightScore = 0;
    this.isResetting = false;
    this.scoreText = null;
    this.resultText = null;
    this.winner = null;
    this.leftTeam = 'Player 1';
    this.rightTeam = 'Player 2';
    this.timerText = null;
    this.gameTimer = null;
    this.timerPaused = false;
    this.scoreSound = null;
    this.leftGoalImage = null;
    this.rightGoalImage = null;
  }

  initializeGameState() {
    this.players = { left: [], right: [] };
    this.playersPerTeam = 3;
    this.winningScore = 10;
    this.gameTime = 180; // 3 minutes
    // this.resetGameState(); //later
  }

  preload() {
    // Load your ball texture
    this.load.image('field', '/assets/bg.jpg');
    this.load.image('playerLeft', '/assets/cat.png');
    this.load.image('playerRight', '/assets/dog.png');
    this.load.image('targetBall', '/assets/fire-cracker.png');
    this.load.image('ground', '/assets/platform.png');
    this.load.image('playerLeftLose', '/assets/cat-lose.png'); // New texture for losing left player
    this.load.image('playerRightLose', '/assets/dog-lose.png'); // New texture for losing right player
    this.load.audio('scoreSound', '/assets/audio/yay.mp3'); // Preload the audio file
    this.load.image('boom', '/assets/boom.png');
    this.load.image('dogboss', '/assets/dogboss.png');
    this.load.image('catboss', '/assets/catboss.png');
    this.load.image('catbosslose', '/assets/cat-boss-lose.png');
    this.load.image('dogbosslose', '/assets/dog-boss-lose.png');
    this.load.image('explosive', '/assets/boom.png');
    this.load.audio('endGameSound', '/assets/audio/whistle-blow.mp3'); // Preload the audio file
  }

  create() {
    // Load background and set it to occupy the whole screen
    this.add
      .image(0, 0, 'field')
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);
    // Create launch button

    this.scoreText = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height / 3, '', {
        fontSize: '40px',
        color: '#fff',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '600',
      })
      .setDepth(1)
      .setOrigin(0.5, 0.5);

    // Create score text
    this.leftScoreText = this.add
      .text(this.scale.width * 0.25, 50, '0', {
        fontSize: '32px',
        fill: '#000000',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '600',
      })
      .setOrigin(0.5);

    this.rightScoreText = this.add
      .text(this.scale.width * 0.75, 50, '0', {
        fontSize: '32px',
        fill: '#000000',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '600',
      })
      .setOrigin(0.5);

    this.createLaunchButton();
    this.createResetButton();

    // Create ready indicators for each team
    this.createTeamReadyIndicators();

    // Create players for both teams
    this.createTeams();

    // Create target ball (in the center)
    this.targetBall = new Ball(
      this,
      this.scale.width / 2,
      this.scale.height / 2,
      'targetBall',
      'target'
    );
    this.targetBall.setScale(0.4);
    this.targetBall.setDepth(1);
    this.targetBall.canDraw = false;
    this.targetBall.body.setImmovable(false);

    // Create goal posts with boundaries
    const goalPostWidth = 20;
    const goalPostHeight = 225;
    const goalPostPadding = 0;

    // Create goal posts
    this.createGoalPost('left', goalPostWidth, goalPostHeight, goalPostPadding);
    this.createGoalPost(
      'right',
      goalPostWidth,
      goalPostHeight,
      goalPostPadding
    );

    // Set up collisions
    this.setupCollisions();

    // Set up audio
    this.scoreSound = this.sound.add('scoreSound');
    this.endGameSound = this.sound.add('endGameSound');

    this.timerText = this.add
      .text(this.cameras.main.width / 2, 50, this.formatTime(this.gameTime), {
        fontSize: '32px',
        fill: '#000000',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '600',
      })
      .setOrigin(0.5)
      .setDepth(1.1);

    // Start the game timer
    this.startGameTimer();

    // Listen for vector drawn events
    this.events.on('vectorDrawn', this.onPlayerVectorDrawn, this);
  }
  startGameTimer() {
    this.gameTimer = this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  updateTimer() {
    if (this.timerPaused) return;
    this.gameTime--;

    this.timerText.setText(this.formatTime(this.gameTime));

    if (this.gameTime <= 0) {
      this.endGame();
    }
  }

  endGame() {
    this.canDrawNewVectors = false;
    // Stop the timer
    if (this.gameTimer) {
      this.gameTimer.remove();
    }

    // Determine winner based on score
    let winner = null;
    if (this.leftScore > this.rightScore) {
      winner = 'Player 1';
    } else if (this.rightScore > this.leftScore) {
      winner = 'Player 2';
    }
    console.log(this.canDrawNewVectors);

    // If it's a draw, winner remains null
    this.resultScreen(winner);
  }

  stopTimer() {
    if (this.gameTimer) {
      this.gameTimer.remove();
      this.gameTimer = null;
    }
  }

  createButton(positionX, positionY, text, onClick) {
    // Create rounded rectangle for the button
    const buttonWidth = 160;
    const buttonHeight = 40;
    // const buttonX = this.scale.width / 2 - buttonWidth / 2;
    // const buttonY = this.scale.height - 100;

    const graphics = this.add.graphics();
    graphics.fillStyle(0xffdb5c, 1);
    graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 20);

    // Create button text
    const buttonText = this.add
      .text(buttonWidth / 2, buttonHeight / 2, text, {
        fontSize: '20px',
        color: '#333',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '600',
      })
      .setOrigin(0.5);

    // Create a container to hold the graphics and text
    this.button = this.add
      .container(positionX - buttonWidth / 2, positionY, [graphics, buttonText])
      .setDepth(1);

    this.button.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    this.button.on('pointerdown', onClick, this);

    return this.button;
  }

  createLaunchButton() {
    const buttonX = this.scale.width / 2;
    const buttonY = this.scale.height - 100;

    this.launchButton = this.createButton(
      buttonX,
      buttonY,
      'LAUNCH',
      this.onLaunchButtonPressed
    ).setDepth(1.1);
    this.launchButton.setVisible(false);
  }

  createResetButton() {
    const buttonX = this.cameras.main.width / 2;
    const buttonY = this.scale.height - 100;

    this.resetButton = this.createButton(
      buttonX,
      buttonY,
      'RESTART',
      this.resetGame
    ).setDepth(1.1);
    this.resetButton.setVisible(false);
  }

  createTeamReadyIndicators() {
    this.leftTeamReady = this.add
      .text(this.scale.width * 0.25, 90, 'Not Ready', {
        fontSize: '20px',
        fill: '#000000',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '600',
      })
      .setOrigin(0.5)
      .setDepth(1.1);

    this.rightTeamReady = this.add
      .text(this.scale.width * 0.75, 90, 'Not Ready', {
        fontSize: '20px',
        fill: '#000000',
        fontFamily: fontStyles.fontFamily,
        fontStyle: '600',
      })
      .setOrigin(0.5)
      .setDepth(1.1);
  }

  createTeams() {
    // Left team positions
    const leftPositions = [
      { x: this.scale.width / 4, y: this.scale.height / 2 - 100 },
      { x: this.scale.width / 4, y: this.scale.height / 2 },
      { x: this.scale.width / 4, y: this.scale.height / 2 + 100 },
    ];

    // Right team positions
    const rightPositions = [
      { x: (this.scale.width * 3) / 4, y: this.scale.height / 2 - 100 },
      { x: (this.scale.width * 3) / 4, y: this.scale.height / 2 },
      { x: (this.scale.width * 3) / 4, y: this.scale.height / 2 + 100 },
    ];

    // Create left team players
    for (let i = 0; i < this.playersPerTeam; i++) {
      const player = new Ball(
        this,
        leftPositions[i].x,
        leftPositions[i].y,
        'playerLeft',
        `left${i}`
      );
      player.setScale(0.3);
      player.setDepth(1);
      player.team = 'left';
      this.players.left.push(player);
    }

    // Create right team players
    for (let i = 0; i < this.playersPerTeam; i++) {
      const player = new Ball(
        this,
        rightPositions[i].x,
        rightPositions[i].y,
        'playerRight',
        `right${i}`
      );
      player.setScale(0.3);
      player.setDepth(1);

      player.team = 'right';
      this.players.right.push(player);
    }
  }

  onPlayerVectorDrawn(playerId) {
    console.log(this.canDrawNewVectors);
    if (this.canDrawNewVectors) {
      this.playersWithVectors++;

      // Check team readiness
      const leftTeamReady = this.players.left.every(
        (player) =>
          player.storedVector &&
          !player.storedVector.equals(Phaser.Math.Vector2.ZERO)
      );
      const rightTeamReady = this.players.right.every(
        (player) =>
          player.storedVector &&
          !player.storedVector.equals(Phaser.Math.Vector2.ZERO)
      );

      // Update ready indicators
      this.leftTeamReady.setText(leftTeamReady ? 'Ready!' : 'Not Ready');
      this.rightTeamReady.setText(rightTeamReady ? 'Ready!' : 'Not Ready');

      // Show launch button only when all players are ready
      if (leftTeamReady && rightTeamReady) {
        this.launchButton.setVisible(true);
      }
    }
  }

  onLaunchButtonPressed() {
    this.canDrawNewVectors = false;
    // Launch all players at once
    [...this.players.left, ...this.players.right].forEach((player) => {
      player.launchWithStoredVector();
    });
    this.launchButton.setVisible(false);
    this.leftTeamReady.setText('Not Ready');
    this.rightTeamReady.setText('Not Ready');
  }

  objectDeceleration(object, deceleration = 0.95) {
    const velocity = object.body.velocity;
    object.body.setVelocity(
      velocity.x * deceleration,
      velocity.y * deceleration
    );
    if (Math.abs(velocity.x) < 1 && Math.abs(velocity.y) < 1) {
      object.body.setVelocity(0, 0);
      object.body.setImmovable(true);
    }
  }

  onGoalScored(ball, goalZone) {
    if (ball.body.velocity.length() > 5 && !this.isResetting) {
      this.isResetting = true;
      this.timerPaused = true;

      // Change the ball texture to explosive
      this.targetBall.setTexture('explosive');
      // Stop all players and the ball
      [...this.players.left, ...this.players.right].forEach((sprite) => {
        this.objectDeceleration(sprite, 0.95);
        // sprite.body.setVelocity(0, 0);
        // sprite.body.setImmovable(true);
      });
      this.targetBall.body.setVelocity(0, 0);

      this.targetBall.body.setImmovable(true);

      this.scoreText.setText(
        goalZone === this.leftGoalZone ? 'Player 2 Scored!' : 'Player 1 Scored!'
      );

      this.scoreSound.play();

      this.scoreText.visible = true;
      // Update score based on which goal was scored in
      if (goalZone === this.leftGoalZone) {
        this.rightScore++;
        this.rightScoreText.setText(this.rightScore.toString());
        this.leftGoalImage.setTexture('catbosslose');
      } else {
        this.leftScore++;
        this.leftScoreText.setText(this.leftScore.toString());
        this.rightGoalImage.setTexture('dogbosslose');
      }

      // Reset after 3 seconds
      this.time.delayedCall(3000, () => {
        this.isResetting = false;
        this.timerPaused = false;
        this.targetBall.setTexture('targetBall');
        this.leftGoalImage.setTexture('catboss');
        this.rightGoalImage.setTexture('dogboss');
        if (this.leftScore === this.winningScore) {
          this.winner = 'Player 1';
          this.resultScreen(this.winner);
        } else if (this.rightScore === this.winningScore) {
          this.winner = 'Player 2';
          this.resultScreen(this.winner);
        } else {
          this.resetRound();
        }
      });
    }
  }

  resultScreen(team) {
    this.stopTimer();
    this.endGameSound.play();
    this.canDrawNewVectors = false;
    const resultText = team ? `${team} Wins!` : 'Draw!';
    this.scoreText.visible = false;
    this.resultText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 3,
        resultText,
        {
          fontSize: '40px',
          color: '#fff',
          fontFamily: fontStyles.fontFamily,
          fontStyle: '600',
        }
      )
      .setDepth(1)
      .setOrigin(0.5, 0.5);

    this.resetButton.visible = true;

    // Change player image when player loses
    if (team === 'Player 1') {
      this.players.right.forEach((player) =>
        player.setTexture('playerRightLose')
      );
    } else if (team === 'Player 2') {
      this.players.left.forEach((player) =>
        player.setTexture('playerLeftLose')
      );
    }
  }

  resetGame() {
    this.leftScore = 0;
    this.rightScore = 0;
    this.leftScoreText.setText('0');
    this.rightScoreText.setText('0');
    this.resetButton.setVisible(false);
    this.resultText.visible = false;
    this.resetRound();
    // this.stopTimer();
    // Reset timer
    this.gameTime = 180;
    this.startGameTimer();
    this.resetPlayers();
  }
  resetPlayers() {
    // Reset player textures to normal
    this.players.left.forEach((player) => player.setTexture('playerLeft'));
    this.players.right.forEach((player) => player.setTexture('playerRight'));
  }

  resetRound() {
    // Reset target ball
    this.targetBall.reset();
    this.targetBall.body.setImmovable(false);

    // Reset all players
    [...this.players.left, ...this.players.right].forEach((player) => {
      player.reset();
      player.canDraw = true;
    });

    // Reset game state
    this.canDrawNewVectors = true;
    this.playersWithVectors = 0;
    this.launchButton.visible = false;
    this.scoreText.visible = false;
  }

  update() {
    if (!this.canDrawNewVectors) {
      if (this.allPlayersStopped()) {
        this.enableNewShot();
      }
    }
  }

  allPlayersStopped() {
    const allPlayers = [...this.players.left, ...this.players.right];
    return (
      allPlayers.every((player) => player.body.velocity.length() < 5) &&
      this.targetBall.body.velocity.length() < 5
    );
  }

  enableNewShot() {
    this.canDrawNewVectors = true;
    this.playersWithVectors = 0;
    [...this.players.left, ...this.players.right].forEach((player) => {
      player.enableDrawing();
    });
  }

  setupCollisions() {
    // Collide players with each other
    this.physics.add.collider([...this.players.left, ...this.players.right]);

    // Collide players with target ball
    this.physics.add.collider(
      [...this.players.left, ...this.players.right],
      this.targetBall
    );

    // Add colliders for all goal post parts
    const goalParts = [...this.leftGoalParts, ...this.rightGoalParts];

    goalParts.forEach((part) => {
      this.physics.add.collider(
        [...this.players.left, ...this.players.right],
        part
      );
      this.physics.add.collider(this.targetBall, part);
    });

    // Set up goal detection
    console.log('overlap');
    this.physics.add.overlap(
      this.targetBall,
      [this.leftGoalZone, this.rightGoalZone],
      this.onGoalScored,
      null,
      this
    );
  }

  createGoalPost(side, width, height, padding) {
    const isLeft = side === 'left';
    const x = isLeft
      ? padding + width / 2
      : this.scale.width - padding - width / 2;
    const color = 0xffffff;

    // Create arrays to store goal parts if they don't exist
    if (!this.leftGoalParts) this.leftGoalParts = [];
    if (!this.rightGoalParts) this.rightGoalParts = [];

    // Create main goal post
    const goalPost = this.add.rectangle(
      x,
      this.scale.height / 2,
      width,
      height,
      color,
      0
    );
    this.physics.add.existing(goalPost, true);

    // Create top boundary
    const topBoundary = this.add.rectangle(
      x,
      this.scale.height / 2 - height / 2,
      width * 10,
      width,
      color,
      0
    );
    this.physics.add.existing(topBoundary, true);

    // Create bottom boundary
    const bottomBoundary = this.add.rectangle(
      x,
      this.scale.height / 2 + height / 2,
      width * 10,
      width,
      color,
      0
    );
    this.physics.add.existing(bottomBoundary, true);

    // Create back boundary
    const backBoundary = this.add.rectangle(
      x + (isLeft ? -width : width),
      this.scale.height / 2,
      width,
      height,
      color,
      0.5
    );
    this.physics.add.existing(backBoundary, true);

    const goalZoneImage = this.add.image(
      isLeft ? x + 65 : x - 65,
      this.scale.height / 2,
      isLeft ? 'catboss' : 'dogboss'
    );

    goalZoneImage.setDisplaySize(
      goalZoneImage.width / 3,
      goalZoneImage.height / 3
    );
    // this.physics.add.existing(goalZoneImage, true);

    // Store all parts in the appropriate array
    const parts = [
      goalPost,
      topBoundary,
      bottomBoundary,
      backBoundary,
      // goalZoneImage,
    ];
    if (isLeft) {
      this.leftGoalParts.push(...parts);
      this.leftGoalImage = goalZoneImage;
    } else {
      this.rightGoalParts.push(...parts);
      this.rightGoalImage = goalZoneImage;
    }

    // Create goal detection zone
    const goalZone = this.add.rectangle(
      x,
      this.scale.height / 2,
      width * 2,
      height - width * 2,
      '#000000',
      0
    );
    // goalZone.setTexture("dogboss");
    // player.setTexture("playerLeftLose")
    this.physics.add.existing(goalZone, true);

    if (isLeft) {
      this.leftGoalZone = goalZone;
    } else {
      this.rightGoalZone = goalZone;
    }
  }
}
