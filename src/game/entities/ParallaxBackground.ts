import Phaser from 'phaser';
import type { BiomeId } from '@/domain/types';
import { bgTextureKey, type BgLayer } from '@/game/constants';

interface Layer {
  sprite: Phaser.GameObjects.TileSprite;
  name: BgLayer;
  factor: number;
}

export class ParallaxBackground {
  private readonly layers: Layer[];

  constructor(scene: Phaser.Scene, initialBiomeId: BiomeId, width: number, height: number) {
    this.layers = [
      { sprite: this.makeLayer(scene, bgTextureKey(initialBiomeId, 'far'), width, height), name: 'far', factor: 0.15 },
      { sprite: this.makeLayer(scene, bgTextureKey(initialBiomeId, 'mid'), width, height), name: 'mid', factor: 0.45 },
      { sprite: this.makeLayer(scene, bgTextureKey(initialBiomeId, 'near'), width, height), name: 'near', factor: 1 },
    ];
  }

  private makeLayer(scene: Phaser.Scene, key: string, width: number, height: number): Phaser.GameObjects.TileSprite {
    const sprite = scene.add.tileSprite(0, 0, width, height, key);
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

  /** Viewport resized (Scale.RESIZE): stretch layers to the new size and re-bind to the current
   * biome's textures, which the caller must have already regenerated at the new height. */
  resize(width: number, height: number, biomeId: BiomeId): void {
    for (const layer of this.layers) {
      layer.sprite.setSize(width, height);
      layer.sprite.setTexture(bgTextureKey(biomeId, layer.name));
    }
  }
}
