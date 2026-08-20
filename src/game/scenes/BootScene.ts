import Phaser from 'phaser';
import themeMusicUrl from '@/assets/audio/music/theme.mp3';
import {
  AUDIO_KEYS,
  CART_TEXTURE_WIDTH,
  CHARACTER_TEXTURE_HEIGHT,
  CHARACTER_TEXTURE_WIDTH,
  STARTING_CHARACTERS,
  TEXTURE_KEYS,
} from '@/game/constants';
import { applyAudioSettings } from '@/game/utils/audioSettings';
import { AudioManager } from '@/game/systems/AudioManager';
import { pinia } from '@/state/pinia';
import { useAudioStore } from '@/state/stores/audioStore';

const CHARACTER_WIDTH = CHARACTER_TEXTURE_WIDTH;
const CHARACTER_HEIGHT = CHARACTER_TEXTURE_HEIGHT;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.audio(AUDIO_KEYS.THEME, themeMusicUrl);
  }

  create(): void {
    this.generateCharacterTextures();
    this.generateCartTexture();

    // Applied before the first play() call so the music never starts audibly, even for a
    // frame, while audio is off (off by default — see audioStore).
    applyAudioSettings(this.sound, useAudioStore(pinia).enabled);

    // Started once here (not in MainGameScene) so it keeps playing uninterrupted
    // across future scene transitions (e.g. biome changes).
    new AudioManager(this).playMusic(AUDIO_KEYS.THEME);

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
    const width = CART_TEXTURE_WIDTH;
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
}
