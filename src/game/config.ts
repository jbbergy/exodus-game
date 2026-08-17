import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/game/constants';
import { BootScene } from '@/game/scenes/BootScene';
import { MainGameScene } from '@/game/scenes/MainGameScene';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#f2c299',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MainGameScene],
  };
}
