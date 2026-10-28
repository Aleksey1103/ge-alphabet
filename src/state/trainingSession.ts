import type {GeorgianLetter} from '../types/alphabet.ts';
import type {
  Exercise,
  LetterStatus,
  TrainingAction,
  TrainingState,
} from '../types/training.ts';
import {applyAttempt, EMPTY_STATS} from '../utils/scoring.ts';
import {shuffle, type RandomSource} from '../utils/shuffle.ts';

export const initialTrainingState: TrainingState = {
  phase: 'idle',
  sessionId: 0,
  exercises: [],
  index: 0,
  attempt: 1,
  selectedLetterId: null,
  rejectedLetterId: null,
  feedback: null,
  stats: EMPTY_STATS,
};

/** One exercise per letter, in a new random order. */
export function createExercises(
  letters: readonly GeorgianLetter[],
  random?: RandomSource,
): Exercise[] {
  return shuffle(letters, random).map((letter) => ({
    targetLetterId: letter.id,
  }));
}

export function getCurrentExercise(state: TrainingState): Exercise | null {
  if (state.phase !== 'answering' && state.phase !== 'feedback') return null;
  return state.exercises[state.index] ?? null;
}

/**
 * While answering, only the selection and a rejected first answer are marked.
 * Once the exercise is resolved, the target is shown as correct, which reveals
 * it after a failed exercise.
 */
export function getLetterStatus(
  state: TrainingState,
  letterId: string,
): LetterStatus {
  if (state.phase === 'feedback') {
    if (letterId === getCurrentExercise(state)?.targetLetterId)
      return 'correct';
    if (
      letterId === state.selectedLetterId ||
      letterId === state.rejectedLetterId
    )
      return 'incorrect';
    return 'idle';
  }
  if (state.phase !== 'answering') return 'idle';
  if (letterId === state.rejectedLetterId) return 'incorrect';
  if (letterId === state.selectedLetterId) return 'selected';
  return 'idle';
}

/**
 * Whether the letter can be picked now. The rejected first answer can't be
 * picked again.
 */
export function canSelectLetter(
  state: TrainingState,
  letterId: string,
): boolean {
  return state.phase === 'answering' && letterId !== state.rejectedLetterId;
}

/** Whether Confirm would submit an answer now. */
export function canSubmit(state: TrainingState): boolean {
  return state.phase === 'answering' && state.selectedLetterId !== null;
}

// Every transition checks its guard first. Actions that arrive at the wrong time (a second tap on
// Confirm, a timer from an exercise or session that's already over) leave the state unchanged.
// The UI reads the same guards (canSelectLetter, canSubmit) to show what's available.
export function trainingReducer(
  state: TrainingState,
  action: TrainingAction,
): TrainingState {
  switch (action.type) {
    case 'start':
      if (action.exercises.length === 0) return state;
      return {
        ...initialTrainingState,
        phase: 'answering',
        sessionId: state.sessionId + 1,
        exercises: action.exercises,
      };

    case 'select':
      if (
        !canSelectLetter(state, action.letterId) ||
        action.letterId === state.selectedLetterId
      ) {
        return state;
      }
      return {...state, selectedLetterId: action.letterId};

    case 'deselect':
      if (state.phase !== 'answering' || state.selectedLetterId === null)
        return state;
      return {...state, selectedLetterId: null};

    case 'submit':
      return submitAnswer(state);

    case 'advance':
      return advance(state, action.sessionId, action.index);

    case 'exit':
      return {...initialTrainingState, sessionId: state.sessionId};
  }
}

function submitAnswer(state: TrainingState): TrainingState {
  const exercise = getCurrentExercise(state);
  if (!canSubmit(state) || exercise === null) return state;

  const isCorrect = state.selectedLetterId === exercise.targetLetterId;
  const stats = applyAttempt(state.stats, state.attempt, isCorrect);

  if (isCorrect) {
    return {
      ...state,
      phase: 'feedback',
      stats,
      feedback: {kind: 'correct', attempt: state.attempt},
    };
  }
  if (state.attempt === 1) {
    // Clearing the selection means a repeated tap has nothing to submit.
    return {
      ...state,
      stats,
      attempt: 2,
      selectedLetterId: null,
      rejectedLetterId: state.selectedLetterId,
      feedback: {kind: 'retry'},
    };
  }
  return {...state, phase: 'feedback', stats, feedback: {kind: 'failed'}};
}

function advance(
  state: TrainingState,
  sessionId: number,
  index: number,
): TrainingState {
  if (
    state.phase !== 'feedback' ||
    sessionId !== state.sessionId ||
    index !== state.index
  ) {
    return state;
  }

  const cleared = {
    ...state,
    attempt: 1 as const,
    selectedLetterId: null,
    rejectedLetterId: null,
    feedback: null,
  };
  const nextIndex = state.index + 1;
  if (nextIndex >= state.exercises.length) {
    return {...cleared, phase: 'finished'};
  }
  return {...cleared, phase: 'answering', index: nextIndex};
}
