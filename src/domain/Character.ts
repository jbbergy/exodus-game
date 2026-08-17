import type { CharacterConfig, CharacterState } from '@/domain/types';

export class Character {
  readonly id: string;
  readonly name: string;
  readonly color: number;
  readonly maxEnergy: number;

  energy: number;
  state: CharacterState;
  alive: boolean;

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
  }

  setState(next: CharacterState): void {
    if (!this.alive) return;
    this.state = next;
  }

  /**
   * `pullingCount` is how many characters (including this one) are currently
   * pulling the cart together — the load is shared, so the more of them pull,
   * the less each one fatigues.
   */
  tickEnergy(deltaSeconds: number, pullingCount = 1): void {
    if (!this.alive) return;

    this.energy += this.energyRate(pullingCount) * deltaSeconds;
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy));

    if (this.energy <= 0) {
      this.die();
    }
  }

  /** Signed energy change per second at the current state (negative = draining). */
  energyRate(pullingCount = 1): number {
    if (!this.alive) return 0;
    if (this.state === 'pulling') return -(this.fatigueRate / Math.max(1, pullingCount));
    if (this.state === 'resting') return this.restRecoveryRate;
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

  restoreEnergy(amount: number): void {
    if (!this.alive) return;
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + amount));
  }
}
