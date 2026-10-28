import {act} from '@testing-library/react';
import {afterEach, beforeEach, vi} from 'vitest';

/**
 * Runs every test in the calling file with fake timers. Call it at the top
 * level of the file.
 */
export function withFakeTimers() {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
}

/** Advances fake timers inside `act`, so React applies the updates they trigger. */
export function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}
