// Loop arithmetic and 3D-wheel geometry for the looping letter picker (an iOS-style drum).

/** Wraps `index` into 0…count-1. Works for fractional positions too. */
export function wrap(index: number, count: number): number {
  return ((index % count) + count) % count;
}

/**
 * `to - from` the short way round a loop of `count` items, between -count/2 and
 * count/2.
 */
export function loopOffset(from: number, to: number, count: number): number {
  return wrap(to - from + count / 2, count) - count / 2;
}

/**
 * The first index from `start` (inclusive), stepping by `step` (1 is down, -1
 * is up) and wrapping round the loop, that `canPick` accepts. `null` when
 * nothing can be picked.
 */
export function findPickable(
  start: number,
  step: 1 | -1,
  count: number,
  canPick: (index: number) => boolean,
): number | null {
  for (let i = 0; i < count; i++) {
    const index = wrap(start + i * step, count);
    if (canPick(index)) return index;
  }
  return null;
}

/**
 * Degrees between neighbouring items on the wheel (18 items would make a full
 * circle).
 */
export const WHEEL_ITEM_ANGLE = 20;
/**
 * Items drawn on each side of the center. Further round, they're behind the
 * wheel.
 */
const WHEEL_ITEMS_EACH_SIDE = 4;

/**
 * The radius in px of a wheel whose items are `itemSize` px tall and
 * `WHEEL_ITEM_ANGLE` apart.
 */
export function wheelRadius(itemSize: number): number {
  return itemSize / 2 / Math.tan(((WHEEL_ITEM_ANGLE / 2) * Math.PI) / 180);
}

/**
 * How far item `index` is turned from the front of the wheel, in degrees
 * (positive is above the center), when the wheel is at `position` (an item
 * index, fractional while it spins). `null` when the item is out of view.
 */
export function wheelItemAngle(
  index: number,
  position: number,
  count: number,
): number | null {
  const offset = loopOffset(position, index, count);
  if (Math.abs(offset) >= WHEEL_ITEMS_EACH_SIDE) return null;
  // rotateX turns positive angles upwards; items after the center sit below it. `|| 0` avoids -0.
  return -offset * WHEEL_ITEM_ANGLE || 0;
}
