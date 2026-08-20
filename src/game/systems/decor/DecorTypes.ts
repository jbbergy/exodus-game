import type { ForegroundShape } from '@/game/systems/BiomePalettes';

export type DecorLayerName = 'background' | 'ground' | 'foreground';

export interface TreeDescriptor {
  kind: 'tree';
  worldX: number;
  widthFraction: number;
  heightFraction: number;
  color: number;
}

export interface RuinDescriptor {
  kind: 'ruin';
  worldX: number;
  widthFraction: number;
  heightFraction: number;
  color: number;
}

/** One ridge segment between two consecutive mountain peaks (or a peak and a cycle boundary
 * anchored at ground level) — see DecorPlacement.mountainPanelsInRange for why panels, not
 * individual peaks, are the streamed unit. */
export interface MountainPanelDescriptor {
  kind: 'mountainPanel';
  leftWorldX: number;
  leftHeightFraction: number;
  rightWorldX: number;
  rightHeightFraction: number;
  shaded: boolean;
  color: number;
  shadowColor: number;
}

export type BackgroundDescriptor = TreeDescriptor | RuinDescriptor | MountainPanelDescriptor;

export interface GroundBumpDescriptor {
  kind: 'groundBump';
  worldX: number;
  widthFraction: number;
  heightFraction: number;
  /** Fraction of the ground band's height (from the ground line down to the viewport bottom)
   * at which the bump's vertical center sits. */
  centerYFraction: number;
  color: number;
}

export interface ForegroundElementDescriptor {
  kind: 'foreground';
  worldX: number;
  widthFraction: number;
  heightFraction: number;
  shape: ForegroundShape;
  color: number;
}
