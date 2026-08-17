import Phaser from 'phaser';
import { SCREEN_HEIGHT, STARTING_CHARACTERS, TEXTURE_KEYS } from '@/game/constants';

const TILE_WIDTH = 400;
const CHARACTER_WIDTH = 40;
const CHARACTER_HEIGHT = 64;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.generateCharacterTextures();
    this.generateCartTexture();
    this.generateBackgroundTextures();
    this.scene.start('MainGameScene');
  }

  private generateCharacterTextures(): void {
    for (const config of STARTING_CHARACTERS) {
      const key = TEXTURE_KEYS.CHARACTER_PREFIX + config.id;
      const gfx = this.add.graphics();
      gfx.fillStyle(config.color, 1);
      gfx.fillRoundedRect(0, 0, CHARACTER_WIDTH, CHARACTER_HEIGHT, 8);
      gfx.fillStyle(0x000000, 0.15);
      gfx.fillRoundedRect(0, CHARACTER_HEIGHT - 12, CHARACTER_WIDTH, 12, 4);
      gfx.generateTexture(key, CHARACTER_WIDTH, CHARACTER_HEIGHT);
      gfx.destroy();
    }
  }

  private generateCartTexture(): void {
    const width = 96;
    const height = 70;
    const gfx = this.add.graphics();
    gfx.fillStyle(0x6b4226, 1);
    gfx.fillRoundedRect(0, 8, width, height - 24, 4);
    gfx.fillStyle(0x8a5a34, 1);
    gfx.fillRect(0, 8, width, 6);
    gfx.fillStyle(0x2b2b2b, 1);
    gfx.fillCircle(20, height - 12, 12);
    gfx.fillCircle(width - 20, height - 12, 12);
    gfx.fillStyle(0x4a4a4a, 1);
    gfx.fillCircle(20, height - 12, 4);
    gfx.fillCircle(width - 20, height - 12, 4);
    gfx.generateTexture(TEXTURE_KEYS.CART, width, height);
    gfx.destroy();
  }

  private generateBackgroundTextures(): void {
    this.generateSkyLayer();
    this.generateDuneLayer(TEXTURE_KEYS.BG_MID, 0xd8a86b, 0xcf9a5c, 60);
    this.generateDuneLayer(TEXTURE_KEYS.BG_NEAR, 0xe8c294, 0xdba872, 30);
  }

  private generateSkyLayer(): void {
    const gfx = this.add.graphics();
    gfx.fillGradientStyle(0xf2c299, 0xf2c299, 0xf7dcb8, 0xf7dcb8, 1);
    gfx.fillRect(0, 0, TILE_WIDTH, SCREEN_HEIGHT);
    gfx.fillStyle(0xffe9b0, 0.9);
    gfx.fillCircle(TILE_WIDTH * 0.75, SCREEN_HEIGHT * 0.25, 36);
    gfx.generateTexture(TEXTURE_KEYS.BG_FAR, TILE_WIDTH, SCREEN_HEIGHT);
    gfx.destroy();
  }

  private generateDuneLayer(key: string, base: number, bump: number, duneHeight: number): void {
    const gfx = this.add.graphics();
    gfx.fillStyle(base, 1);
    gfx.fillRect(0, 0, TILE_WIDTH, SCREEN_HEIGHT);
    gfx.fillStyle(bump, 1);
    gfx.fillEllipse(TILE_WIDTH * 0.2, SCREEN_HEIGHT - duneHeight * 0.4, TILE_WIDTH * 0.5, duneHeight);
    gfx.fillEllipse(TILE_WIDTH * 0.7, SCREEN_HEIGHT - duneHeight * 0.3, TILE_WIDTH * 0.6, duneHeight * 1.2);
    gfx.generateTexture(key, TILE_WIDTH, SCREEN_HEIGHT);
    gfx.destroy();
  }
}
