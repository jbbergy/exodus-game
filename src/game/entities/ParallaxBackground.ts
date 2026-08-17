import Phaser from 'phaser';
import type { BiomeId } from '@/domain/types';
import { bgTextureKey, type BgLayer, SCREEN_HEIGHT, SCREEN_WIDTH } from '@/game/constants';

interface Layer {
  sprite: Phaser.GameObjects.TileSprite;
  name: BgLayer;
  factor: number;
}

export class ParallaxBackground {
  private readonly layers: Layer[];

  constructor(scene: Phaser.Scene, initialBiomeId: BiomeId) {
    this.layers = [
      { sprite: this.makeLayer(scene, bgTextureKey(initialBiomeId, 'far')), name: 'far', factor: 0.15 },
      { sprite: this.makeLayer(scene, bgTextureKey(initialBiomeId, 'mid')), name: 'mid', factor: 0.45 },
      { sprite: this.makeLayer(scene, bgTextureKey(initialBiomeId, 'near')), name: 'near', factor: 1 },
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

  /** Instant texture swap, no fade — tilePositionX is untouched so scrolling keeps going uninterrupted. */
  setBiome(biomeId: BiomeId): void {
    for (const layer of this.layers) {
      layer.sprite.setTexture(bgTextureKey(biomeId, layer.name));
    }
  }
}
