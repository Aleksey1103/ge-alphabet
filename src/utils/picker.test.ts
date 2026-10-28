import {describe, expect, it} from 'vitest';
import {
  findPickable,
  loopOffset,
  wheelItemAngle,
  wheelRadius,
  WHEEL_ITEM_ANGLE,
  wrap,
} from './picker.ts';

describe('wrap', () => {
  it('wraps indexes, negative and fractional ones too, into the loop', () => {
    expect(wrap(0, 33)).toBe(0);
    expect(wrap(33, 33)).toBe(0);
    expect(wrap(-1, 33)).toBe(32);
    expect(wrap(34.5, 33)).toBe(1.5);
  });
});

describe('loopOffset', () => {
  it('measures the short way round the loop', () => {
    expect(loopOffset(3, 5, 33)).toBe(2);
    expect(loopOffset(5, 3, 33)).toBe(-2);
    expect(loopOffset(32, 0, 33)).toBe(1);
    expect(loopOffset(0, 32, 33)).toBe(-1);
    expect(loopOffset(31.5, 0, 33)).toBe(1.5);
  });
});

describe('findPickable', () => {
  const all = () => true;

  it('returns the start itself when it can be picked', () => {
    expect(findPickable(4, 1, 33, all)).toBe(4);
  });

  it('skips letters that cannot be picked, in the given direction', () => {
    const notFour = (index: number) => index !== 4;
    expect(findPickable(4, 1, 33, notFour)).toBe(5);
    expect(findPickable(4, -1, 33, notFour)).toBe(3);
  });

  it('wraps round the ends of the loop', () => {
    expect(findPickable(32, 1, 33, (index) => index !== 32)).toBe(0);
    expect(findPickable(0, -1, 33, (index) => index !== 0)).toBe(32);
  });

  it('returns null when nothing can be picked', () => {
    expect(findPickable(0, 1, 33, () => false)).toBeNull();
  });
});

describe('wheelItemAngle', () => {
  it('puts the current item at the front and its neighbours above and below', () => {
    expect(wheelItemAngle(10, 10, 33)).toBe(0);
    expect(wheelItemAngle(9, 10, 33)).toBe(WHEEL_ITEM_ANGLE);
    expect(wheelItemAngle(11, 10, 33)).toBe(-WHEEL_ITEM_ANGLE);
  });

  it('turns smoothly between items while spinning', () => {
    expect(wheelItemAngle(10, 10.5, 33)).toBe(WHEEL_ITEM_ANGLE / 2);
  });

  it('hides items that are round the back of the wheel', () => {
    expect(wheelItemAngle(13, 10, 33)).toBe(-3 * WHEEL_ITEM_ANGLE);
    expect(wheelItemAngle(14, 10, 33)).toBeNull();
    expect(wheelItemAngle(26, 10, 33)).toBeNull();
  });

  it('continues across the end of the loop', () => {
    expect(wheelItemAngle(0, 32, 33)).toBe(-WHEEL_ITEM_ANGLE);
    expect(wheelItemAngle(32, 0, 33)).toBe(WHEEL_ITEM_ANGLE);
  });
});

describe('wheelRadius', () => {
  it('fits flat items of the given height edge to edge round the wheel', () => {
    const halfAngle = ((WHEEL_ITEM_ANGLE / 2) * Math.PI) / 180;
    expect(2 * wheelRadius(48) * Math.tan(halfAngle)).toBeCloseTo(48, 5);
    expect(wheelRadius(0)).toBe(0);
  });
});
