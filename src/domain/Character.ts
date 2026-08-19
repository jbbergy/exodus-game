import type { CharacterConfig, CharacterState, ResourceType } from '@/domain/types';
import { SICK_FATIGUE_MULTIPLIER } from '@/game/constants';

export class Character {
  readonly id: string;
  readonly name: string;
  readonly color: number;
  readonly maxEnergy: number;

  energy: number;
  state: CharacterState;
  alive: boolean;
  /** At most one character convoy-wide is ever sick — enforced by SicknessSystem, not here. */
  sick: boolean;

  // Public (not TS `private`): Vue's reactivity type helpers (UnwrapRef) reconstruct
  // class instances as plain object types, which lose structural compatibility with
  // classes that have `private` members. Kept internal by convention instead.
  readonly fatigueRate: number;
  readonly restRecoveryRate: number;
  readonly walkSpeed: number;
  readonly pullSpeedFactor: number;

  constructor(config: CharacterConfig) {
    this.id = config.id;
    this.name = config.name;
    this.color = config.color;
    this.maxEnergy = config.maxEnergy;
    this.fatigueRate = config.fatigueRate;
    this.restRecoveryRate = config.restRecoveryRate;
    this.walkSpeed = config.walkSpeed;
    this.pullSpeedFactor = config.pullSpeedFactor;

    this.energy = config.maxEnergy;
    this.state = 'pulling';
    this.alive = true;
    this.sick = false;
  }

  setState(next: CharacterState): void {
    if (!this.alive) return;
    this.state = next;
  }

  /** Pulling characters are too busy to stop for either — water or food. Walking characters can
   * only take water; only resting ones (back on the cart) can actually sit down to eat. */
  canReceiveResource(type: ResourceType): boolean {
    if (!this.alive) return false;
    if (this.state === 'pulling') return false;
    if (type === 'food') return this.state === 'resting';
    return true;
  }

  makeSick(): void {
    if (!this.alive) return;
    this.sick = true;
  }

  cure(): void {
    this.sick = false;
  }

  /** `rate` is the signed energy change per second to apply (see Convoy.effectiveEnergyRate). */
  tickEnergy(deltaSeconds: number, rate: number): void {
    if (!this.alive) return;

    this.energy += rate * deltaSeconds;
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy));

    if (this.energy <= 0) {
      this.die();
    }
  }

  /** Signed energy change per second at the current state (negative = draining). Sick characters
   * drain faster while pulling and never recover while resting — a remedy is the only cure. */
  energyRate(pullingCount = 1): number {
    if (!this.alive) return 0;
    if (this.state === 'pulling') {
      const rate = -(this.fatigueRate / Math.max(1, pullingCount));
      return this.sick ? rate * SICK_FATIGUE_MULTIPLIER : rate;
    }
    if (this.state === 'resting') return this.sick ? 0 : this.restRecoveryRate;
    return 0;
  }

  die(): void {
    this.alive = false;
    this.energy = 0;
  }

  currentSpeed(): number {
    if (!this.alive) return 0;
    if (this.state === 'pulling') return this.walkSpeed * this.pullSpeedFactor;
    if (this.state === 'walking') return this.walkSpeed;
    return 0;
  }

  /** Losses (negative amounts) always apply; a sick character just can't gain energy this way
   * (water, food) until cured — the hidden cost of a resource-gathering trip still applies. */
  restoreEnergy(amount: number): void {
    if (!this.alive) return;
    if (this.sick && amount > 0) return;
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + amount));
  }
}
