import type {AttemptNumber, TrainingStats} from '../types/training.ts';

export const POINTS_FOR_CORRECT = 1;
export const POINTS_FOR_INCORRECT = -1;

export const EMPTY_STATS: TrainingStats = {
  score: 0,
  firstTryCorrect: 0,
  secondTryCorrect: 0,
  failedExercises: 0,
  totalAttempts: 0,
};

/** Records one submitted answer. Call it exactly once per submission. */
export function applyAttempt(
  stats: TrainingStats,
  attempt: AttemptNumber,
  isCorrect: boolean,
): TrainingStats {
  const next = {...stats, totalAttempts: stats.totalAttempts + 1};
  if (isCorrect) {
    next.score += POINTS_FOR_CORRECT;
    if (attempt === 1) next.firstTryCorrect += 1;
    else next.secondTryCorrect += 1;
  } else {
    next.score += POINTS_FOR_INCORRECT;
    if (attempt === 2) next.failedExercises += 1;
  }
  return next;
}

/** Signed score for display: `+3`, `0`, `−2` (with a true minus sign). */
export function formatScore(score: number): string {
  if (score > 0) return `+${score}`;
  if (score < 0) return `−${Math.abs(score)}`;
  return '0';
}

/**
 * Correct answers as a percentage (0–100) of all submitted answers; 0 when
 * nothing was submitted.
 */
export function calculateAccuracy(stats: TrainingStats): number {
  if (stats.totalAttempts === 0) return 0;
  return (
    ((stats.firstTryCorrect + stats.secondTryCorrect) / stats.totalAttempts) *
    100
  );
}
