import Phaser from 'phaser';
import type { Character } from '@/domain/Character';
import { CART_SCALE, CART_TEXTURE_WIDTH, CHARACTER_SCALE, CHARACTER_TEXTURE_WIDTH, TEXTURE_KEYS } from '@/game/constants';
import { eventBus } from '@/state/eventBus';
import { pointerToClientPosition } from '@/game/utils/screenCoordinates';

const cartHalfWidth = (CART_TEXTURE_WIDTH / 2) * CART_SCALE;
const characterHalfWidth = (CHARACTER_TEXTURE_WIDTH / 2) * CHARACTER_SCALE;

// Derived from both scales (not just CHARACTER_SCALE) so the first pulling/walking character
// never overlaps the cart even if CART_SCALE and CHARACTER_SCALE change independently. This is
// a fixed pixel budget on either side of the cart, so it's only safe up to 5 characters at
// screen widths in the realistic desktop/tablet range — re-check on a much smaller viewport.
const PULL_OFFSET_X = cartHalfWidth + characterHalfWidth + 8;
const WALK_OFFSET_X = cartHalfWidth + characterHalfWidth + 30;
const SLOT_SPACING = 46 * CHARACTER_SCALE;

export class CharacterSprite {
  readonly character: Character;
  readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, character: Character, groundY: number) {
    this.character = character;
    const key = TEXTURE_KEYS.CHARACTER_PREFIX + character.id;
    this.sprite = scene.add.sprite(0, groundY, key);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(CHARACTER_SCALE);
    this.sprite.setDepth(4);

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerover', (pointer: Phaser.Input.Pointer) => this.emitHover(pointer));
    this.sprite.on('pointermove', (pointer: Phaser.Input.Pointer) => this.emitHover(pointer));
    this.sprite.on('pointerout', () => {
      eventBus.emit('characterHoverChanged', { characterId: null });
    });
    this.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const { x, y } = pointerToClientPosition(this.sprite.scene, pointer);
      eventBus.emit('characterClicked', { characterId: this.character.id, x, y });
    });
  }

  private emitHover(pointer: Phaser.Input.Pointer): void {
    const { x, y } = pointerToClientPosition(this.sprite.scene, pointer);
    eventBus.emit('characterHoverChanged', { characterId: this.character.id, x, y });
  }

  /** Fully stops this sprite from receiving pointer events (used while the radial menu is open,
   * so a menu button that visually overlaps another character's sprite can't trigger it). */
  setInputEnabled(enabled: boolean): void {
    if (enabled) {
      // `disableInteractive()` keeps `sprite.input` around (just flips `.enabled` off), it
      // doesn't clear it — so re-enabling must flip that flag back rather than skip re-setup.
      if (this.sprite.input) {
        this.sprite.input.enabled = true;
      } else {
        this.sprite.setInteractive({ useHandCursor: true });
      }
    } else {
      this.sprite.disableInteractive();
    }
  }

  updatePosition(cartScreenX: number, slotIndex: number, groundY: number): void {
    if (!this.character.alive) {
      this.sprite.setAlpha(0.25);
      return;
    }
    this.sprite.setAlpha(1);

    switch (this.character.state) {
      case 'pulling':
        this.sprite.setDepth(4);
        this.sprite.setPosition(cartScreenX + PULL_OFFSET_X + slotIndex * SLOT_SPACING, groundY);
        break;
      case 'resting':
        this.sprite.setDepth(6);
        this.sprite.setPosition(cartScreenX - 6 * CHARACTER_SCALE + slotIndex * 12 * CHARACTER_SCALE, groundY - 44 * CHARACTER_SCALE);
        break;
      case 'walking':
        this.sprite.setDepth(4);
        this.sprite.setPosition(cartScreenX - WALK_OFFSET_X - slotIndex * SLOT_SPACING, groundY);
        break;
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
