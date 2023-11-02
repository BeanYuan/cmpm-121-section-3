import * as Phaser from "phaser";

import starfieldUrl from "/assets/starfield.png";
import shipUrl from "/assets/ship.png";
import enemyUrl from "/assets/enemy.png";

class Enemy extends Phaser.Physics.Arcade.Image {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy");
    this.scene = scene;

    // Set physics properties, scale, and velocity here
    const scale = 0.3;
    this.setScale(scale);
    this.setVelocity(Phaser.Math.Between(50, 150), 0);

    // Add the enemy to the scene
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
  }
}

export default class Play extends Phaser.Scene {
  fire?: Phaser.Input.Keyboard.Key;
  left?: Phaser.Input.Keyboard.Key;
  right?: Phaser.Input.Keyboard.Key;

  starfield?: Phaser.GameObjects.TileSprite;
  spinner?: Phaser.Physics.Arcade.Image;
  enemyGroup?: Phaser.Physics.Arcade.Group;

  rotationSpeed = Phaser.Math.PI2 / 1000;

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

    this.enemyGroup = this.physics.add.group({
      classType: Enemy,
    });

    this.time.addEvent({
      delay: 2000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(this.spinner, this.enemyGroup);
  }

  spawnEnemy() {
    const x = 0;
    const y = Phaser.Math.Between(0, this.game.config.width as number);
    const enemy = new Enemy(this, x, y);

    // Add enemy to enemyGroup
    this.enemyGroup!.add(enemy);
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
        y: "-=50",
        duration: 200,
        ease: Phaser.Math.Easing.Sine.Out,
        onComplete: () => {
          this.tweens.add({
            targets: this.spinner,
            y: "+=50",
            duration: 200,
            ease: Phaser.Math.Easing.Sine.In,
          });
        },
      });
    }
  }
}
