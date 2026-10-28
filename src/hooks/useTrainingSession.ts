import {useEffect, useReducer} from 'react';
import {GEORGIAN_ALPHABET, getLetterById} from '../data/georgianAlphabet.ts';
import {
  createExercises,
  getCurrentExercise,
  initialTrainingState,
  trainingReducer,
} from '../state/trainingSession.ts';
import type {RandomSource} from '../utils/shuffle.ts';

/**
 * How long feedback stays on screen before the next exercise. A failed exercise
 * shows the answer, so it stays longer.
 */
export const FEEDBACK_DELAY_MS = 1200;
export const FAILED_FEEDBACK_DELAY_MS = 2200;

export function useTrainingSession({random}: {random?: RandomSource} = {}) {
  const [state, dispatch] = useReducer(trainingReducer, initialTrainingState);

  const exercise = getCurrentExercise(state);
  const currentLetter = exercise
    ? (getLetterById(exercise.targetLetterId) ?? null)
    : null;

  // Auto-advance after feedback. The cleanup cancels the timer whenever the exercise or session
  // changes (restart, exit, unmount), and the reducer ignores an advance meant for another exercise.
  const {phase, sessionId, index, feedback} = state;
  let advanceDelay: number | null = null;
  if (phase === 'feedback') {
    advanceDelay =
      feedback?.kind === 'failed'
        ? FAILED_FEEDBACK_DELAY_MS
        : FEEDBACK_DELAY_MS;
  }
  useEffect(() => {
    if (advanceDelay === null) return;
    const timer = window.setTimeout(() => {
      dispatch({type: 'advance', sessionId, index});
    }, advanceDelay);
    return () => window.clearTimeout(timer);
  }, [advanceDelay, sessionId, index]);

  return {
    state,
    currentLetter,
    start: () =>
      dispatch({
        type: 'start',
        exercises: createExercises(GEORGIAN_ALPHABET, random),
      }),
    select: (letterId: string) => dispatch({type: 'select', letterId}),
    deselect: () => dispatch({type: 'deselect'}),
    submit: () => dispatch({type: 'submit'}),
    exit: () => dispatch({type: 'exit'}),
  };
}

export type TrainingSession = ReturnType<typeof useTrainingSession>;
