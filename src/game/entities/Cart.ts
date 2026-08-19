import Phaser from 'phaser';
import { CART_SCALE, TEXTURE_KEYS } from '@/game/constants';
import { eventBus } from '@/state/eventBus';
import { pointerToClientPosition } from '@/game/utils/screenCoordinates';

export class Cart {
  readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x, y, TEXTURE_KEYS.CART);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(CART_SCALE);
    this.sprite.setDepth(5);

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const { x, y } = pointerToClientPosition(this.sprite.scene, pointer);
      eventBus.emit('cartClicked', { x, y });
    });
  }

  reposition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  /** Fully stops the cart from receiving pointer events (used while a character's stats/actions
   * panel is open, so a panel visually overlapping the cart can't also trigger it). */
  setInputEnabled(enabled: boolean): void {
    if (enabled) {
      if (this.sprite.input) {
        this.sprite.input.enabled = true;
      } else {
        this.sprite.setInteractive({ useHandCursor: true });
      }
    } else {
      this.sprite.disableInteractive();
    }
  }
}
