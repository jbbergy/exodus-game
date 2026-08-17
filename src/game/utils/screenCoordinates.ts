import Phaser from 'phaser';

/** Converts a Phaser pointer's canvas-local position into viewport (clientX/clientY) coordinates,
 * so DOM-positioned Vue panels can align with Phaser-space pointer events. */
export function pointerToClientPosition(scene: Phaser.Scene, pointer: Phaser.Input.Pointer): { x: number; y: number } {
  const game = scene.sys.game;
  const rect = game.canvas.getBoundingClientRect();
  return {
    x: rect.left + pointer.x * (rect.width / game.scale.gameSize.width),
    y: rect.top + pointer.y * (rect.height / game.scale.gameSize.height),
  };
}
