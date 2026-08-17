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
    this.sprite.on('pointerover', (pointer: Phaser.Input.Pointer) => this.emitHover(pointer));
    this.sprite.on('pointermove', (pointer: Phaser.Input.Pointer) => this.emitHover(pointer));
    this.sprite.on('pointerout', () => {
      eventBus.emit('cartHoverChanged', { hovered: false });
    });
  }

  reposition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  private emitHover(pointer: Phaser.Input.Pointer): void {
    const { x, y } = pointerToClientPosition(this.sprite.scene, pointer);
    eventBus.emit('cartHoverChanged', { hovered: true, x, y });
  }
}
