import Phaser from 'phaser';
import { GROUND_Y, SCREEN_WIDTH, TEXTURE_KEYS } from '@/game/constants';

export const CART_SCREEN_X = SCREEN_WIDTH * 0.55;

export class Cart {
  readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene) {
    this.sprite = scene.add.sprite(CART_SCREEN_X, GROUND_Y, TEXTURE_KEYS.CART);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(5);
  }
}
