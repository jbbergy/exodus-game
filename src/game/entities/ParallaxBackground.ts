import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH, TEXTURE_KEYS } from '@/game/constants';

interface Layer {
  sprite: Phaser.GameObjects.TileSprite;
  factor: number;
}

export class ParallaxBackground {
  private readonly layers: Layer[];

  constructor(scene: Phaser.Scene) {
    this.layers = [
      { sprite: this.makeLayer(scene, TEXTURE_KEYS.BG_FAR), factor: 0.15 },
      { sprite: this.makeLayer(scene, TEXTURE_KEYS.BG_MID), factor: 0.45 },
      { sprite: this.makeLayer(scene, TEXTURE_KEYS.BG_NEAR), factor: 1 },
    ];
  }

  private makeLayer(scene: Phaser.Scene, key: string): Phaser.GameObjects.TileSprite {
    const sprite = scene.add.tileSprite(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, key);
    sprite.setOrigin(0, 0);
    sprite.setDepth(-10);
    return sprite;
  }

  scroll(distanceDelta: number): void {
    for (const layer of this.layers) {
      layer.sprite.tilePositionX += distanceDelta * layer.factor;
    }
  }
}
