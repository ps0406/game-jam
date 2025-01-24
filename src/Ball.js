export default class Ball extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, ballId) {
    super(scene, x, y, texture);

    this.ballId = ballId;
    this.maximumLength = 1000;
    this.forceMultiplier = 5;
    this.friction = 0.99;

    this.touchDown = false;
    this.positionStart = new Phaser.Math.Vector2();
    this.positionEnd = new Phaser.Math.Vector2();
    this.vector = new Phaser.Math.Vector2();
    this.storedVector = new Phaser.Math.Vector2();
    this.canDraw = true;
    this.initialPosition = new Phaser.Math.Vector2(x, y);
    this.aimLineLength = 4;

    // Enable physics
    scene.physics.world.enable(this);
    scene.add.existing(this);

    // Set up physics properties
    this.setBounce(1);
    this.setFriction(0.8);
    this.setDrag(1);
    this.setDamping(true);

    // Initialize input handling
    this.setInteractive();
    this.on('pointerdown', this.onPointerDown, this);

    // Create graphics for drawing lines
    this.graphics = scene.add.graphics();

    // Freeze initial position
    this.body.setImmovable(true);

    // Set up collision with world bounds
    this.body.setCollideWorldBounds(true);

    // Add update method to gradually slow down the ball
    scene.events.on('update', this.update, this);
  }

  update() {
    if (!this.body.immovable) {
      // Apply friction
      this.body.velocity.scale(this.friction);

      // Stop ball if moving very slowly
      if (this.body.velocity.length() < 10) {
        this.body.setVelocity(0, 0);
      }
    }
  }

  onPointerDown(pointer) {
    if (this.body.immovable && this.canDraw) {
      this.touchDown = true;
      this.positionStart.x = this.x;
      this.positionStart.y = this.y;
      this.positionEnd.copy(pointer);
      this.scene.input.on('pointermove', this.onPointerMove, this);
      this.scene.input.on('pointerup', this.onPointerUp, this);
    }
  }

  onPointerMove(pointer) {
    if (this.touchDown && this.canDraw) {
      this.positionEnd.copy(pointer);
      this.vector.copy(this.positionEnd).subtract(this.positionStart);

      // Limit vector length
      if (this.vector.length() > this.maximumLength) {
        this.vector.normalize().scale(this.maximumLength);
      }

      this.drawLines();
    }
  }

  onPointerUp() {
    if (this.touchDown && this.canDraw) {
      this.touchDown = false;
      this.storedVector.copy(this.vector);
      this.scene.events.emit('vectorDrawn', this.ballId);
      this.scene.input.off('pointermove', this.onPointerMove, this);
      this.scene.input.off('pointerup', this.onPointerUp, this);
      this.drawLines();
    }
  }

  drawLines() {
    this.graphics.clear();

    if (!this.storedVector.equals(Phaser.Math.Vector2.ZERO) && this.canDraw) {
      // Draw stored vector with arrow
      this.graphics.lineStyle(4, 0xd99d81);
      const endX =
        this.x -
        (this.aimLineLength * this.storedVector.x) / this.forceMultiplier;
      const endY =
        this.y -
        (this.aimLineLength * this.storedVector.y) / this.forceMultiplier;

      this.graphics.beginPath();
      this.graphics.moveTo(this.x, this.y);
      this.graphics.lineTo(endX, endY);

      // Add arrowhead
      const angle = Phaser.Math.Angle.Between(this.x, this.y, endX, endY);
      const arrowSize = 10;
      const arrowPoint1X = endX + Math.cos(angle + Math.PI * 0.8) * arrowSize;
      const arrowPoint1Y = endY + Math.sin(angle + Math.PI * 0.8) * arrowSize;
      const arrowPoint2X = endX + Math.cos(angle - Math.PI * 0.8) * arrowSize;
      const arrowPoint2Y = endY + Math.sin(angle - Math.PI * 0.8) * arrowSize;

      this.graphics.lineTo(arrowPoint1X, arrowPoint1Y);
      this.graphics.moveTo(endX, endY);
      this.graphics.lineTo(arrowPoint2X, arrowPoint2Y);

      this.graphics.strokePath().setDepth(2);
    } else if (this.touchDown && this.canDraw) {
      // Draw force and aim lines with arrows
      this.graphics.lineStyle(4, 0xc5d3e8);
      this.graphics.beginPath();
      this.graphics.moveTo(this.x, this.y);
      this.graphics.lineTo(this.positionEnd.x, this.positionEnd.y);
      this.graphics.strokePath().setDepth(2);

      const actualVector = {
        x: this.positionEnd.x - this.x,
        y: this.positionEnd.y - this.y,
      };

      this.graphics.lineStyle(4, 0xd99d81);
      const endX =
        this.x - (this.aimLineLength * actualVector.x) / this.forceMultiplier;
      const endY =
        this.y - (this.aimLineLength * actualVector.y) / this.forceMultiplier;

      this.graphics.beginPath();
      this.graphics.moveTo(this.x, this.y);
      this.graphics.lineTo(endX, endY);

      // Add arrowhead
      const angle = Phaser.Math.Angle.Between(this.x, this.y, endX, endY);
      const arrowSize = 10;
      const arrowPoint1X = endX + Math.cos(angle + Math.PI * 0.8) * arrowSize;
      const arrowPoint1Y = endY + Math.sin(angle + Math.PI * 0.8) * arrowSize;
      const arrowPoint2X = endX + Math.cos(angle - Math.PI * 0.8) * arrowSize;
      const arrowPoint2Y = endY + Math.sin(angle - Math.PI * 0.8) * arrowSize;

      this.graphics.lineTo(arrowPoint1X, arrowPoint1Y);
      this.graphics.moveTo(endX, endY);
      this.graphics.lineTo(arrowPoint2X, arrowPoint2Y);

      this.graphics.strokePath().setDepth(2);
    }
  }

  launchWithStoredVector() {
    if (!this.storedVector.equals(Phaser.Math.Vector2.ZERO)) {
      this.body.setImmovable(false);
      this.canDraw = false;
      this.body.setVelocity(
        -this.storedVector.x * this.forceMultiplier,
        -this.storedVector.y * this.forceMultiplier
      );
      // console.log(this.storedVector.y * this.forceMultiplier);
      this.graphics.clear();
    }
  }

  enableDrawing() {
    this.body.setImmovable(true);
    this.storedVector.reset();
    this.vector.reset();
    this.canDraw = true;
    this.graphics.clear();
  }

  reset() {
    this.body.reset(this.initialPosition.x, this.initialPosition.y);
    this.body.setVelocity(0, 0);
    this.body.setImmovable(true);
    this.vector.reset();
    this.storedVector.reset();
    this.canDraw = true;
    this.graphics.clear();
  }
}
