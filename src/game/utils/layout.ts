import { CART_GROUND_BAND_FRACTION, CART_X_FRACTION, GRAVE_GROUND_BAND_FRACTION, GROUND_Y_FRACTION } from '@/game/constants';

export function computeCartScreenX(width: number): number {
  return width * CART_X_FRACTION;
}

export function computeGroundY(height: number): number {
  return height * GROUND_Y_FRACTION;
}

/** Vertical position for the cart/characters within the ground band (groundY..height) — centered
 * rather than sitting right at groundY, so they visually stand inside that layer. */
export function computeCartY(groundY: number, height: number): number {
  return groundY + (height - groundY) * CART_GROUND_BAND_FRACTION;
}

/** Vertical position for grave markers within the ground band — higher up (closer to the
 * horizon) than the cart's own band position, so a grave reads as sitting behind the cart rather
 * than getting lost right under its wheels. */
export function computeGraveY(groundY: number, height: number): number {
  return groundY + (height - groundY) * GRAVE_GROUND_BAND_FRACTION;
}
