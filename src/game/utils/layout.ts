import { CART_X_FRACTION, GROUND_Y_FRACTION } from '@/game/constants';

export function computeCartScreenX(width: number): number {
  return width * CART_X_FRACTION;
}

export function computeGroundY(height: number): number {
  return height * GROUND_Y_FRACTION;
}
