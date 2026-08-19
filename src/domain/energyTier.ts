/** Drives both the on-sprite status word today and, eventually, which of the 4 planned
 * per-character skins to render — so the thresholds live in one place both can share. */
export type EnergyTier = 'fit' | 'normal' | 'tired' | 'dying';

const ENERGY_TIER_LABELS: Record<EnergyTier, string> = {
  fit: 'En forme',
  normal: 'Normal',
  tired: 'Fatigué',
  dying: 'À l’agonie',
};

export function energyTierFor(energy: number, maxEnergy: number): EnergyTier {
  const percent = (energy / maxEnergy) * 100;
  if (percent >= 70) return 'fit';
  if (percent >= 40) return 'normal';
  if (percent >= 10) return 'tired';
  return 'dying';
}

export function energyTierLabel(tier: EnergyTier): string {
  return ENERGY_TIER_LABELS[tier];
}
