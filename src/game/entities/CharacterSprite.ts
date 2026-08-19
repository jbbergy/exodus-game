import Phaser from 'phaser';
import type { Character } from '@/domain/Character';
import { energyTierFor, energyTierLabel } from '@/domain/energyTier';
import {
  CART_SCALE,
  CART_TEXTURE_WIDTH,
  CHARACTER_SCALE,
  CHARACTER_TEXTURE_HEIGHT,
  CHARACTER_TEXTURE_WIDTH,
  TEXTURE_KEYS,
} from '@/game/constants';
import { eventBus } from '@/state/eventBus';
import { pointerToClientPosition } from '@/game/utils/screenCoordinates';

const STATUS_LABEL_GAP = 6;

const cartHalfWidth = (CART_TEXTURE_WIDTH / 2) * CART_SCALE;
const characterHalfWidth = (CHARACTER_TEXTURE_WIDTH / 2) * CHARACTER_SCALE;

// Derived from both scales (not just CHARACTER_SCALE) so the first pulling/walking character
// never overlaps the cart even if CART_SCALE and CHARACTER_SCALE change independently. This is
// a fixed pixel budget on either side of the cart, so it's only safe up to 5 characters at
// screen widths in the realistic desktop/tablet range — re-check on a much smaller viewport.
const PULL_OFFSET_X = cartHalfWidth + characterHalfWidth + 8;
const WALK_OFFSET_X = cartHalfWidth + characterHalfWidth + 30;
const SLOT_SPACING = 46 * CHARACTER_SCALE;

// Resting characters fan out on top of the cart, each one drawn over the previous (see the
// slotIndex-based depth below) — spacing must be a sizeable fraction of the character's own
// width or a stacked-up character becomes fully hidden behind the next one. Half-width keeps
// every character at least half-visible regardless of how many are resting at once.
const RESTING_SLOT_SPACING = characterHalfWidth;
const RESTING_BASE_OFFSET_X = -2 * RESTING_SLOT_SPACING;

export class CharacterSprite {
  readonly character: Character;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly statusLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, character: Character, groundY: number) {
    this.character = character;
    const key = TEXTURE_KEYS.CHARACTER_PREFIX + character.id;
    this.sprite = scene.add.sprite(0, groundY, key);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(CHARACTER_SCALE);
    this.sprite.setDepth(4);

    this.statusLabel = scene.add.text(0, groundY, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
    });
    this.statusLabel.setOrigin(0.5, 1);

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const { x, y } = pointerToClientPosition(this.sprite.scene, pointer);
      eventBus.emit('characterClicked', { characterId: this.character.id, x, y });
    });
  }

  /** Fully stops this sprite from receiving pointer events (used while the stats/actions panel
   * is open, so a panel button that visually overlaps another character's sprite can't trigger it). */
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
      this.statusLabel.setVisible(false);
      return;
    }
    this.sprite.setAlpha(1);

    switch (this.character.state) {
      case 'pulling':
        this.sprite.setDepth(4);
        this.sprite.setPosition(cartScreenX + PULL_OFFSET_X + slotIndex * SLOT_SPACING, groundY);
        break;
      case 'resting':
        // Depth grows with slotIndex so the fan-out order is deterministic (each character
        // renders above the one before it) instead of depending on incidental creation order.
        this.sprite.setDepth(6 + slotIndex);
        this.sprite.setPosition(
          cartScreenX + RESTING_BASE_OFFSET_X + slotIndex * RESTING_SLOT_SPACING,
          groundY - 44 * CHARACTER_SCALE,
        );
        break;
      case 'walking':
        this.sprite.setDepth(4);
        this.sprite.setPosition(cartScreenX - WALK_OFFSET_X - slotIndex * SLOT_SPACING, groundY);
        break;
    }

    this.updateStatusLabel();
  }

  /** Name on top, fatigue state below — interim stand-in for the 4 energy-tier skins planned
   * later (for now the tier is spelled out as a word instead of changing the sprite). Sickness
   * takes over the second line entirely while active — it's the more urgent thing to notice, and
   * it already implies energy is only going to get worse until cured. */
  private updateStatusLabel(): void {
    if (this.character.sick) {
      this.statusLabel.setText([this.character.name, '🤒 Malade']);
      this.statusLabel.setColor('#ff8f7a');
    } else {
      const tier = energyTierFor(this.character.energy, this.character.maxEnergy);
      this.statusLabel.setText([this.character.name, energyTierLabel(tier)]);
      this.statusLabel.setColor('#ffffff');
    }
    this.statusLabel.setVisible(true);
    this.statusLabel.setDepth(this.sprite.depth + 1);

    const spriteTopY = this.sprite.y - CHARACTER_TEXTURE_HEIGHT * CHARACTER_SCALE;
    this.statusLabel.setPosition(this.sprite.x, spriteTopY - STATUS_LABEL_GAP);
  }

  destroy(): void {
    this.sprite.destroy();
    this.statusLabel.destroy();
  }
}
