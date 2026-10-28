import {describe, expect, it} from 'vitest';
import type {TrainingStats} from '../types/training.ts';
import {
  applyAttempt,
  calculateAccuracy,
  EMPTY_STATS,
  formatScore,
} from './scoring.ts';

describe('formatScore', () => {
  it('signs positive and negative scores', () => {
    expect(formatScore(3)).toBe('+3');
    expect(formatScore(0)).toBe('0');
    expect(formatScore(-2)).toBe('−2');
  });
});

describe('applyAttempt', () => {
  it('adds 1 point and a first-try success for a correct first attempt', () => {
    expect(applyAttempt(EMPTY_STATS, 1, true)).toEqual({
      ...EMPTY_STATS,
      score: 1,
      firstTryCorrect: 1,
      totalAttempts: 1,
    });
  });

  it('subtracts 1 point for an incorrect first attempt without failing the exercise', () => {
    expect(applyAttempt(EMPTY_STATS, 1, false)).toEqual({
      ...EMPTY_STATS,
      score: -1,
      totalAttempts: 1,
    });
  });

  it('adds 1 point and a second-try success for a correct second attempt', () => {
    expect(applyAttempt(EMPTY_STATS, 2, true)).toEqual({
      ...EMPTY_STATS,
      score: 1,
      secondTryCorrect: 1,
      totalAttempts: 1,
    });
  });

  it('subtracts 1 point and fails the exercise for an incorrect second attempt', () => {
    expect(applyAttempt(EMPTY_STATS, 2, false)).toEqual({
      ...EMPTY_STATS,
      score: -1,
      failedExercises: 1,
      totalAttempts: 1,
    });
  });

  it('gives the net exercise scores from the spec', () => {
    const firstTry = applyAttempt(EMPTY_STATS, 1, true);
    const secondTry = applyAttempt(
      applyAttempt(EMPTY_STATS, 1, false),
      2,
      true,
    );
    const failed = applyAttempt(applyAttempt(EMPTY_STATS, 1, false), 2, false);
    expect(firstTry.score).toBe(1);
    expect(secondTry.score).toBe(0);
    expect(failed.score).toBe(-2);
  });

  it('does not modify the stats passed in', () => {
    const stats = {...EMPTY_STATS};
    applyAttempt(stats, 1, true);
    expect(stats).toEqual(EMPTY_STATS);
  });
});

describe('calculateAccuracy', () => {
  it('is 0 when nothing was submitted', () => {
    expect(calculateAccuracy(EMPTY_STATS)).toBe(0);
  });

  it('is 100 when every answer was right first time', () => {
    const stats: TrainingStats = {
      ...EMPTY_STATS,
      score: 33,
      firstTryCorrect: 33,
      totalAttempts: 33,
    };
    expect(calculateAccuracy(stats)).toBe(100);
  });

  it('divides correct answers by all submitted answers', () => {
    // One exercise of each kind: 1 + 2 + 2 = 5 submissions, 2 of them correct.
    const stats: TrainingStats = {
      score: -1,
      firstTryCorrect: 1,
      secondTryCorrect: 1,
      failedExercises: 1,
      totalAttempts: 5,
    };
    expect(calculateAccuracy(stats)).toBe(40);
  });
});
