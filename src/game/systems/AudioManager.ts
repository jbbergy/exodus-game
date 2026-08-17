import Phaser from 'phaser';

/**
 * Thin wrapper so gameplay code can call playSfx/playMusic today with no
 * assets loaded. Once real audio is loaded in BootScene under the same
 * keys, playback starts working with zero gameplay-code changes.
 */
export class AudioManager {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  playSfx(key: string): void {
    if (!this.scene.cache.audio.has(key)) return;
    this.scene.sound.play(key);
  }

  playMusic(key: string, config?: Phaser.Types.Sound.SoundConfig): void {
    if (!this.scene.cache.audio.has(key)) return;
    this.scene.sound.play(key, { loop: true, ...config });
  }
}
