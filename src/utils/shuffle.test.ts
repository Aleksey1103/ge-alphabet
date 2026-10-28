import {describe, expect, it} from 'vitest';
import {seededRandom} from '../test/seededRandom.ts';
import {shuffle} from './shuffle.ts';

const items = Array.from({length: 33}, (_, i) => i);

describe('shuffle', () => {
  it('keeps every item exactly once', () => {
    const result = shuffle(items, seededRandom(1));
    expect(result).toHaveLength(items.length);
    expect([...result].sort((a, b) => a - b)).toEqual(items);
  });

  it('does not modify the input array', () => {
    const input = [...items];
    shuffle(input, seededRandom(2));
    expect(input).toEqual(items);
  });

  it('changes the order', () => {
    expect(shuffle(items, seededRandom(3))).not.toEqual(items);
  });

  it('gives different orders for different random sequences', () => {
    expect(shuffle(items, seededRandom(4))).not.toEqual(
      shuffle(items, seededRandom(5)),
    );
  });

  it('swaps each position with a random index at or below it (Fisher–Yates)', () => {
    // random() = 0 always picks j = 0: each step swaps position i with position 0.
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
    // random() just under 1 always picks j = i: nothing moves.
    expect(shuffle([1, 2, 3, 4], () => 0.999)).toEqual([1, 2, 3, 4]);
  });

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['ა'])).toEqual(['ა']);
  });
});
