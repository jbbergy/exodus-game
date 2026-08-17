import Phaser from 'phaser';
import type { Character } from '@/domain/Character';
import { GROUND_Y, TEXTURE_KEYS } from '@/game/constants';
import { eventBus } from '@/state/eventBus';

const SLOT_SPACING = 46;

export class CharacterSprite {
  readonly character: Character;
  readonly sprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, character: Character) {
    this.character = character;
    const key = TEXTURE_KEYS.CHARACTER_PREFIX + character.id;
    this.sprite = scene.add.sprite(0, GROUND_Y, key);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(4);

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerover', () => {
      eventBus.emit('characterHoverChanged', { characterId: this.character.id });
    });
    this.sprite.on('pointerout', () => {
      eventBus.emit('characterHoverChanged', { characterId: null });
    });
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
        this.sprite.setPosition(cartScreenX + 70 + slotIndex * SLOT_SPACING, GROUND_Y);
        break;
      case 'resting':
        this.sprite.setDepth(6);
        this.sprite.setPosition(cartScreenX - 6 + slotIndex * 12, GROUND_Y - 44);
        break;
      case 'walking':
        this.sprite.setDepth(4);
        this.sprite.setPosition(cartScreenX - 90 - slotIndex * SLOT_SPACING, GROUND_Y);
        break;
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
