import Phaser from 'phaser';
import { BootScene } from '@/game/scenes/BootScene';
import { MainGameScene } from '@/game/scenes/MainGameScene';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#f2c299',
    scale: {
      mode: Phaser.Scale.RESIZE,
    },
    scene: [BootScene, MainGameScene],
  };
}
