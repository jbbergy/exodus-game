import type Phaser from 'phaser';
import { AUDIO_VOLUME_WHEN_ENABLED } from '@/game/constants';

/** Scene.sound is the game-wide Phaser sound manager (shared across scenes), so muting/scaling
 * it here silences or restores everything already playing — including a looping music track —
 * with no need to touch individual Sound instances. */
export function applyAudioSettings(sound: Phaser.Sound.BaseSoundManager, enabled: boolean): void {
  sound.mute = !enabled;
  sound.volume = AUDIO_VOLUME_WHEN_ENABLED;
}
