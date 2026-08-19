import Phaser from 'phaser';

/**
 * Thin wrapper so gameplay code can call playSfx/playMusic today with no
 * assets loaded. Once real audio is loaded in BootScene under the same
 * keys, playback starts working with zero gameplay-code changes.
 *
 * Actual audible volume is controlled globally (see game/utils/audioSettings.ts) via the
 * scene's sound manager mute/volume, driven by the on-screen audio toggle — individual
 * play calls always use full instance volume.
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
