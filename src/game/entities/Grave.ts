import Phaser from 'phaser';

// Below the cart (depth 5) and characters (depth 4) so a grave always renders behind them, but
// still above the ground-layer decor streamed by DecorStreamManager (depth -9).
const GRAVE_DEPTH = 3;
const MOUND_WIDTH = 54;
const MOUND_HEIGHT = 22;
const MARKER_HEIGHT = 40;
const CROSSBAR_WIDTH = 28;

/** Marks where a character died, left behind on the ground as the convoy moves on. Like the
 * streamed decor layers, it has a fixed world-x and is reprojected to screen-x every frame from
 * the convoy's current position — the ground layer scrolls at factor 1 (see DecorStreamManager's
 * LAYER_CONFIGS), so a grave scrolls at the same rate as the ground itself. */
export class Grave {
  readonly worldX: number;
  private readonly mound: Phaser.GameObjects.Ellipse;
  private readonly post: Phaser.GameObjects.Rectangle;
  private readonly crossbar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, worldX: number, screenX: number, groundY: number) {
    this.worldX = worldX;

    this.mound = scene.add.ellipse(screenX, groundY, MOUND_WIDTH, MOUND_HEIGHT, 0x5a4a3a);
    this.post = scene.add.rectangle(screenX, groundY - MARKER_HEIGHT / 2, 7, MARKER_HEIGHT, 0x8a7960);
    this.crossbar = scene.add.rectangle(screenX, groundY - MARKER_HEIGHT * 0.7, CROSSBAR_WIDTH, 7, 0x8a7960);

    for (const shape of [this.mound, this.post, this.crossbar]) shape.setDepth(GRAVE_DEPTH);
  }

  reposition(screenX: number, groundY: number): void {
    this.mound.setPosition(screenX, groundY);
    this.post.setPosition(screenX, groundY - MARKER_HEIGHT / 2);
    this.crossbar.setPosition(screenX, groundY - MARKER_HEIGHT * 0.7);
  }

  destroy(): void {
    this.mound.destroy();
    this.post.destroy();
    this.crossbar.destroy();
  }
}
