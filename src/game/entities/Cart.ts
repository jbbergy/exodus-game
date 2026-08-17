import Phaser from 'phaser';
import { CART_SCALE, GROUND_Y, SCREEN_WIDTH, TEXTURE_KEYS } from '@/game/constants';
import { eventBus } from '@/state/eventBus';
import { pointerToClientPosition } from '@/game/utils/screenCoordinates';

export const CART_SCREEN_X = SCREEN_WIDTH * 0.45;

export class Cart {
  readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.sprite(CART_SCREEN_X, GROUND_Y, TEXTURE_KEYS.CART);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(CART_SCALE);
    this.sprite.setDepth(5);

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerover', (pointer: Phaser.Input.Pointer) => this.emitHover(pointer));
    this.sprite.on('pointermove', (pointer: Phaser.Input.Pointer) => this.emitHover(pointer));
    this.sprite.on('pointerout', () => {
      eventBus.emit('cartHoverChanged', { hovered: false });
    });
  }

  private emitHover(pointer: Phaser.Input.Pointer): void {
    const { x, y } = pointerToClientPosition(this.sprite.scene, pointer);
    eventBus.emit('cartHoverChanged', { hovered: true, x, y });
  }
}
