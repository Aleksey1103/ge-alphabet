export type Exercise = {
  targetLetterId: string;
};

export type TrainingStats = {
  score: number;
  firstTryCorrect: number;
  secondTryCorrect: number;
  failedExercises: number;
  /** Every submitted answer, correct or not. */
  totalAttempts: number;
};

export type AttemptNumber = 1 | 2;

/** `failed` reveals the answer, which is the current exercise's target. */
export type Feedback =
  | {kind: 'correct'; attempt: AttemptNumber}
  | {kind: 'retry'}
  | {kind: 'failed'};

/**
 * - `idle`: no session (home screen)
 * - `answering`: waiting for the user to pick and confirm a letter
 * - `feedback`: the exercise is resolved and feedback is showing until it
 *   advances
 * - `finished`: every exercise is resolved (results screen)
 */
export type TrainingPhase = 'idle' | 'answering' | 'feedback' | 'finished';

export type TrainingState = {
  phase: TrainingPhase;
  /**
   * Increments on every start, so events from an earlier session can be
   * ignored.
   */
  sessionId: number;
  exercises: readonly Exercise[];
  index: number;
  attempt: AttemptNumber;
  selectedLetterId: string | null;
  /** The wrong first answer, which can't be chosen again on the second attempt. */
  rejectedLetterId: string | null;
  feedback: Feedback | null;
  stats: TrainingStats;
};

/** How a letter is shown in the carousel. */
export type LetterStatus = 'idle' | 'selected' | 'correct' | 'incorrect';

export type TrainingAction =
  | {type: 'start'; exercises: readonly Exercise[]}
  | {type: 'select'; letterId: string}
  | {type: 'deselect'}
  | {type: 'submit'}
  | {type: 'advance'; sessionId: number; index: number}
  | {type: 'exit'};
