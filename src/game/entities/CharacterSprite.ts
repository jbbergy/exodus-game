import Phaser from 'phaser';
import type { Character } from '@/domain/Character';
import { CHARACTER_SCALE, GROUND_Y, TEXTURE_KEYS } from '@/game/constants';
import { eventBus } from '@/state/eventBus';
import { pointerToClientPosition } from '@/game/utils/screenCoordinates';

const SLOT_SPACING = 46 * CHARACTER_SCALE;

export class CharacterSprite {
  readonly character: Character;
  readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, character: Character) {
    this.character = character;
    const key = TEXTURE_KEYS.CHARACTER_PREFIX + character.id;
    this.sprite = scene.add.sprite(0, GROUND_Y, key);
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

  updatePosition(cartScreenX: number, slotIndex: number): void {
    if (!this.character.alive) {
      this.sprite.setAlpha(0.25);
      return;
    }
    this.sprite.setAlpha(1);

    switch (this.character.state) {
      case 'pulling':
        this.sprite.setDepth(4);
        this.sprite.setPosition(cartScreenX + 70 * CHARACTER_SCALE + slotIndex * SLOT_SPACING, GROUND_Y);
        break;
      case 'resting':
        this.sprite.setDepth(6);
        this.sprite.setPosition(cartScreenX - 6 + slotIndex * 12 * CHARACTER_SCALE, GROUND_Y - 44 * CHARACTER_SCALE);
        break;
      case 'walking':
        this.sprite.setDepth(4);
        this.sprite.setPosition(cartScreenX - 90 * CHARACTER_SCALE - slotIndex * SLOT_SPACING, GROUND_Y);
        break;
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
