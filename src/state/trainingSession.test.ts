import {describe, expect, it} from 'vitest';
import {GEORGIAN_ALPHABET} from '../data/georgianAlphabet.ts';
import {wrongLetterId} from '../test/letters.ts';
import {seededRandom} from '../test/seededRandom.ts';
import type {Exercise, TrainingState} from '../types/training.ts';
import {EMPTY_STATS} from '../utils/scoring.ts';
import {
  canPlaySound,
  canSelectLetter,
  canSubmit,
  createExercises,
  getCurrentExercise,
  getLetterStatus,
  initialTrainingState,
  trainingReducer,
} from './trainingSession.ts';

const ALPHABETICAL: Exercise[] = GEORGIAN_ALPHABET.map((letter) => ({
  targetLetterId: letter.id,
}));

function start(
  exercises: readonly Exercise[] = ALPHABETICAL,
  from = initialTrainingState,
) {
  return trainingReducer(from, {type: 'start', exercises});
}

function target(state: TrainingState): string {
  const exercise = getCurrentExercise(state);
  if (!exercise) throw new Error(`no current exercise in phase ${state.phase}`);
  return exercise.targetLetterId;
}

function wrongAnswer(state: TrainingState): string {
  return wrongLetterId(target(state), state.rejectedLetterId);
}

function answer(state: TrainingState, letterId: string): TrainingState {
  const selected = trainingReducer(state, {type: 'select', letterId});
  return trainingReducer(selected, {type: 'submit'});
}

function advance(state: TrainingState): TrainingState {
  return trainingReducer(state, {
    type: 'advance',
    sessionId: state.sessionId,
    index: state.index,
  });
}

describe('createExercises', () => {
  it('creates one exercise for each of the 33 letters', () => {
    const exercises = createExercises(GEORGIAN_ALPHABET, seededRandom(1));
    expect(exercises).toHaveLength(33);
  });

  it('includes every letter exactly once', () => {
    const ids = createExercises(GEORGIAN_ALPHABET, seededRandom(2)).map(
      (e) => e.targetLetterId,
    );
    expect(new Set(ids).size).toBe(33);
    expect([...ids].sort()).toEqual(
      GEORGIAN_ALPHABET.map((letter) => letter.id).sort(),
    );
  });

  it('randomizes the order without losing or duplicating letters', () => {
    const first = createExercises(GEORGIAN_ALPHABET, seededRandom(3));
    const second = createExercises(GEORGIAN_ALPHABET, seededRandom(4));
    expect(first).not.toEqual(ALPHABETICAL);
    expect(first).not.toEqual(second);
    expect([...first].sort(byId)).toEqual([...second].sort(byId));
  });
});

describe('trainingReducer', () => {
  it('starts a session at the first exercise with empty stats', () => {
    const state = start();
    expect(state.phase).toBe('answering');
    expect(state.exercises).toHaveLength(33);
    expect(state.index).toBe(0);
    expect(state.attempt).toBe(1);
    expect(state.stats).toEqual(EMPTY_STATS);
    expect(state.sessionId).toBe(1);
  });

  it('ignores a start with fewer than 2 exercises', () => {
    expect(start([])).toBe(initialTrainingState);
    expect(start(ALPHABETICAL.slice(0, 1))).toBe(initialTrainingState);
  });

  it('starts a session with only the given letters', () => {
    const vowels = GEORGIAN_ALPHABET.filter((letter) =>
      'აეიოუ'.includes(letter.character),
    );
    const state = start(createExercises(vowels, seededRandom(2)));
    expect(state.phase).toBe('answering');
    expect(
      state.exercises.map((exercise) => exercise.targetLetterId).sort(),
    ).toEqual(vowels.map((letter) => letter.id).sort());
  });

  it('adds 1 point for a correct first attempt and advances', () => {
    const answered = answer(start(), target(start()));
    expect(answered.phase).toBe('feedback');
    expect(answered.feedback).toEqual({kind: 'correct', attempt: 1});
    expect(answered.stats).toEqual({
      ...EMPTY_STATS,
      score: 1,
      firstTryCorrect: 1,
      totalAttempts: 1,
    });

    const next = advance(answered);
    expect(next.phase).toBe('answering');
    expect(next.index).toBe(1);
    expect(next.attempt).toBe(1);
    expect(next.selectedLetterId).toBeNull();
    expect(next.feedback).toBeNull();
  });

  it('subtracts 1 point for an incorrect first attempt and allows a second attempt', () => {
    const state = start();
    const wrong = wrongAnswer(state);
    const answered = answer(state, wrong);
    expect(answered.phase).toBe('answering');
    expect(answered.index).toBe(0);
    expect(answered.attempt).toBe(2);
    expect(answered.rejectedLetterId).toBe(wrong);
    expect(answered.selectedLetterId).toBeNull();
    expect(answered.feedback).toEqual({kind: 'retry'});
    expect(answered.stats).toEqual({
      ...EMPTY_STATS,
      score: -1,
      totalAttempts: 1,
    });
  });

  it('adds 1 point for a correct second attempt and advances', () => {
    const state = start();
    const answered = answer(answer(state, wrongAnswer(state)), target(state));
    expect(answered.phase).toBe('feedback');
    expect(answered.feedback).toEqual({kind: 'correct', attempt: 2});
    expect(answered.stats).toEqual({
      ...EMPTY_STATS,
      score: 0,
      secondTryCorrect: 1,
      totalAttempts: 2,
    });
    expect(advance(answered).index).toBe(1);
  });

  it('subtracts 1 point for an incorrect second attempt, reveals the answer and advances', () => {
    const state = start();
    const afterFirst = answer(state, wrongAnswer(state));
    const answered = answer(afterFirst, wrongAnswer(afterFirst));
    expect(answered.phase).toBe('feedback');
    expect(answered.feedback).toEqual({kind: 'failed'});
    expect(getLetterStatus(answered, target(state))).toBe('correct');
    expect(answered.stats).toEqual({
      ...EMPTY_STATS,
      score: -2,
      failedExercises: 1,
      totalAttempts: 2,
    });
    expect(advance(answered).index).toBe(1);
  });

  it('gives a net score of -2 for two incorrect attempts', () => {
    const state = start();
    const afterFirst = answer(state, wrongAnswer(state));
    expect(answer(afterFirst, wrongAnswer(afterFirst)).stats.score).toBe(-2);
  });

  it('does not allow a third attempt', () => {
    const state = start();
    const afterFirst = answer(state, wrongAnswer(state));
    const failed = answer(afterFirst, wrongAnswer(afterFirst));
    expect(answer(failed, target(state))).toBe(failed);
    expect(trainingReducer(failed, {type: 'submit'})).toBe(failed);
  });

  it('does not allow choosing the rejected first answer again', () => {
    const state = start();
    const wrong = wrongAnswer(state);
    const afterFirst = answer(state, wrong);
    expect(trainingReducer(afterFirst, {type: 'select', letterId: wrong})).toBe(
      afterFirst,
    );
  });

  it('ignores selecting the letter that is already selected', () => {
    const selected = trainingReducer(start(), {
      type: 'select',
      letterId: 'bani',
    });
    expect(trainingReducer(selected, {type: 'select', letterId: 'bani'})).toBe(
      selected,
    );
  });

  it('ignores selections while feedback is showing', () => {
    const answered = answer(start(), target(start()));
    expect(trainingReducer(answered, {type: 'select', letterId: 'ani'})).toBe(
      answered,
    );
  });

  it('clears the selection on deselect, so Confirm has nothing to submit', () => {
    const selected = trainingReducer(start(), {
      type: 'select',
      letterId: 'bani',
    });
    const cleared = trainingReducer(selected, {type: 'deselect'});
    expect(cleared.selectedLetterId).toBeNull();
    expect(canSubmit(cleared)).toBe(false);
    expect(trainingReducer(cleared, {type: 'deselect'})).toBe(cleared);
  });

  it('ignores a deselect while feedback is showing', () => {
    const answered = answer(start(), target(start()));
    expect(trainingReducer(answered, {type: 'deselect'})).toBe(answered);
  });

  it('ignores a submit with no letter selected', () => {
    const state = start();
    expect(trainingReducer(state, {type: 'submit'})).toBe(state);
  });

  it('scores rapid repeated submissions only once', () => {
    const state = start();
    const once = answer(state, target(state));
    const twice = trainingReducer(once, {type: 'submit'});
    expect(twice).toBe(once);
    expect(twice.stats.totalAttempts).toBe(1);

    // A double tap on a wrong answer must not use up the second attempt.
    const wrongOnce = answer(state, wrongAnswer(state));
    const wrongTwice = trainingReducer(wrongOnce, {type: 'submit'});
    expect(wrongTwice).toBe(wrongOnce);
    expect(wrongTwice.stats).toEqual({
      ...EMPTY_STATS,
      score: -1,
      totalAttempts: 1,
    });
  });

  it('ignores an advance for another exercise or session', () => {
    const answered = answer(start(), target(start()));
    const staleIndex = trainingReducer(answered, {
      type: 'advance',
      sessionId: answered.sessionId,
      index: answered.index + 1,
    });
    const staleSession = trainingReducer(answered, {
      type: 'advance',
      sessionId: answered.sessionId - 1,
      index: answered.index,
    });
    expect(staleIndex).toBe(answered);
    expect(staleSession).toBe(answered);
  });

  it('advances only once per resolved exercise', () => {
    const next = advance(answer(start(), target(start())));
    expect(advance(next)).toBe(next);
    expect(next.index).toBe(1);
  });

  it('finishes after the last exercise and never goes past it', () => {
    let state = start();
    for (let i = 0; i < 33; i++) {
      state = advance(answer(state, target(state)));
    }
    expect(state.phase).toBe('finished');
    expect(state.index).toBe(32);
    expect(state.stats).toEqual({
      ...EMPTY_STATS,
      score: 33,
      firstTryCorrect: 33,
      totalAttempts: 33,
    });
    expect(advance(state)).toBe(state);
    expect(trainingReducer(state, {type: 'submit'})).toBe(state);
  });

  it('keeps statistics consistent with the scoring rules over a full session', () => {
    let state = start();
    for (let i = 0; i < 33; i++) {
      const outcome = i % 3; // 0: right first time, 1: right second time, 2: failed
      if (outcome === 0) {
        state = answer(state, target(state));
      } else {
        state = answer(state, wrongAnswer(state));
        state = answer(
          state,
          outcome === 1 ? target(state) : wrongAnswer(state),
        );
      }
      expect(state.phase).toBe('feedback');
      state = advance(state);
    }

    const {
      score,
      firstTryCorrect,
      secondTryCorrect,
      failedExercises,
      totalAttempts,
    } = state.stats;
    expect(state.phase).toBe('finished');
    expect(firstTryCorrect + secondTryCorrect + failedExercises).toBe(33);
    expect([firstTryCorrect, secondTryCorrect, failedExercises]).toEqual([
      11, 11, 11,
    ]);
    expect(score).toBe(firstTryCorrect - 2 * failedExercises);
    expect(totalAttempts).toBe(
      firstTryCorrect + 2 * secondTryCorrect + 2 * failedExercises,
    );
  });

  it('restarts with a new session, fresh stats and a new exercise order', () => {
    let state = start(createExercises(GEORGIAN_ALPHABET, seededRandom(5)));
    state = answer(state, wrongAnswer(state));
    const firstOrder = state.exercises;

    const restarted = start(
      createExercises(GEORGIAN_ALPHABET, seededRandom(6)),
      state,
    );
    expect(restarted.sessionId).toBe(state.sessionId + 1);
    expect(restarted.phase).toBe('answering');
    expect(restarted.index).toBe(0);
    expect(restarted.attempt).toBe(1);
    expect(restarted.selectedLetterId).toBeNull();
    expect(restarted.rejectedLetterId).toBeNull();
    expect(restarted.feedback).toBeNull();
    expect(restarted.stats).toEqual(EMPTY_STATS);
    expect(restarted.exercises).not.toEqual(firstOrder);
  });

  it('returns to idle on exit and keeps counting sessions', () => {
    const state = answer(start(), target(start()));
    const exited = trainingReducer(state, {type: 'exit'});
    expect(exited).toEqual({
      ...initialTrainingState,
      sessionId: state.sessionId,
    });
    expect(start(ALPHABETICAL, exited).sessionId).toBe(state.sessionId + 1);
  });
});

describe('canSelectLetter and canSubmit', () => {
  it('allow picking any letter and submitting once one is selected', () => {
    const state = start();
    expect(canSelectLetter(state, 'ani')).toBe(true);
    expect(canSubmit(state)).toBe(false);
    expect(
      canSubmit(trainingReducer(state, {type: 'select', letterId: 'ani'})),
    ).toBe(true);
  });

  it('block the rejected first answer during the second attempt', () => {
    const state = start();
    const wrong = wrongAnswer(state);
    const afterFirst = answer(state, wrong);
    expect(canSelectLetter(afterFirst, wrong)).toBe(false);
    expect(canSelectLetter(afterFirst, target(state))).toBe(true);
    expect(canSubmit(afterFirst)).toBe(false);
  });

  it('block everything while feedback is showing and outside a session', () => {
    const answered = answer(start(), target(start()));
    expect(canSelectLetter(answered, 'ani')).toBe(false);
    expect(canSubmit(answered)).toBe(false);
    expect(canSelectLetter(initialTrainingState, 'ani')).toBe(false);
  });
});

describe('canPlaySound', () => {
  it('allows playing during both attempts', () => {
    const state = start();
    expect(canPlaySound(state)).toBe(true);
    expect(canPlaySound(answer(state, wrongAnswer(state)))).toBe(true);
  });

  it('blocks playing while a resolved exercise shows its feedback', () => {
    const state = start();
    expect(canPlaySound(answer(state, target(state)))).toBe(false);

    const afterFirst = answer(state, wrongAnswer(state));
    const failed = answer(
      afterFirst,
      wrongLetterId(target(state), afterFirst.rejectedLetterId),
    );
    expect(failed.feedback?.kind).toBe('failed');
    expect(canPlaySound(failed)).toBe(false);
  });

  it('allows playing again once the next exercise starts', () => {
    const state = start();
    expect(canPlaySound(advance(answer(state, target(state))))).toBe(true);
  });

  it('blocks playing outside a session', () => {
    expect(canPlaySound(initialTrainingState)).toBe(false);
  });
});

describe('getLetterStatus', () => {
  it('marks only the selected letter while answering', () => {
    const state = trainingReducer(start(), {
      type: 'select',
      letterId: 'bani',
    });
    expect(getLetterStatus(state, 'bani')).toBe('selected');
    expect(getLetterStatus(state, 'ani')).toBe('idle');
  });

  it('marks the rejected first answer as incorrect during the second attempt', () => {
    const state = start();
    const wrong = wrongAnswer(state);
    const afterFirst = answer(state, wrong);
    expect(getLetterStatus(afterFirst, wrong)).toBe('incorrect');
    expect(getLetterStatus(afterFirst, target(state))).toBe('idle');
  });

  it('shows a correct answer as correct without marking anything else', () => {
    const state = start();
    const answered = answer(state, target(state));
    const statuses = GEORGIAN_ALPHABET.map((letter) =>
      getLetterStatus(answered, letter.id),
    );
    expect(statuses.filter((status) => status !== 'idle')).toEqual(['correct']);
  });

  it('reveals the correct letter and marks both wrong answers after a failed exercise', () => {
    const state = start();
    const first = wrongAnswer(state);
    const afterFirst = answer(state, first);
    const second = wrongAnswer(afterFirst);
    const failed = answer(afterFirst, second);
    expect(getLetterStatus(failed, target(state))).toBe('correct');
    expect(getLetterStatus(failed, first)).toBe('incorrect');
    expect(getLetterStatus(failed, second)).toBe('incorrect');
  });

  it('marks nothing outside a session', () => {
    expect(getLetterStatus(initialTrainingState, 'ani')).toBe('idle');
  });
});

function byId(a: Exercise, b: Exercise) {
  return a.targetLetterId.localeCompare(b.targetLetterId);
}
