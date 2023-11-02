import * as Phaser from "phaser";

import starfieldUrl from "/assets/starfield.png";
import shipUrl from "/assets/ship.png";
import enemyUrl from "/assets/enemy.png";

export default class Play extends Phaser.Scene {
  fire?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  right?: Phaser.Input.Keyboard.Key;

  starfield?: Phaser.GameObjects.TileSprite;
  spinner?: Phaser.Physics.Arcade.Image;
  enemyGroup?: Phaser.Physics.Arcade.Group;

  rotationSpeed = Phaser.Math.PI2 / 1000; // radians per millisecond

  constructor() {
    super("play");
  }

  preload() {
    this.load.image("starfield", starfieldUrl);
    this.load.image("enemy", enemyUrl);
    this.load.image("ship", shipUrl);
  }

  #addKey(
    name: keyof typeof Phaser.Input.Keyboard.KeyCodes,
  ): Phaser.Input.Keyboard.Key {
    return this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes[name]);
  }

  create() {
    this.fire = this.#addKey("F");
    this.left = this.#addKey("LEFT");
    this.right = this.#addKey("RIGHT");

    this.starfield = this.add
      .tileSprite(
        0,
        0,
        this.game.config.width as number,
        this.game.config.height as number,
        "starfield",
      )
      .setOrigin(0, 0);

    this.spinner = this.physics.add.image(300, 400, "ship");
    this.spinner.setDisplaySize(50, 50).setTint(0xd18c57);

    this.enemyGroup = this.physics.add.group();

    // Spawn enemies periodically
    this.time.addEvent({
      delay: 2000, // spawns every 2 seconds
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(this.spinner, this.enemyGroup);
  }

  spawnEnemy() {
    const enemy = this.enemyGroup!.create(
      0,
      Phaser.Math.Between(0, this.game.config.width as number),
      "enemy",
    );

    const scale = 0.3;
    enemy.setScale(scale);
    enemy.setVelocity(Phaser.Math.Between(50, 150), 0);
  }

  update(_timeMs: number, delta: number) {
    this.starfield!.tilePositionX -= 4;

    if (!this.fire!.isDown) {
      if (this.left!.isDown) {
        this.spinner!.setVelocityX(delta * -10);
      }
      if (this.right!.isDown) {
        this.spinner!.setVelocityX(delta * 10);
      }
    }

    if (this.fire!.isDown) {
      this.tweens.add({
        targets: this.spinner,
        y: "-=50", // Move upwards by 300 units
        duration: 200,
        ease: Phaser.Math.Easing.Sine.Out,
        onComplete: () => {
          // After moving upwards, make the ship move downwards
          this.tweens.add({
            targets: this.spinner,
            y: "+=50", // Move downwards by 300 units
            duration: 200,
            ease: Phaser.Math.Easing.Sine.In,
          });
        },
      });
    }
  }
}
