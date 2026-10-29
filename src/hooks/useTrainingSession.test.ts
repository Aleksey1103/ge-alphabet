import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {GEORGIAN_ALPHABET} from '../data/georgianAlphabet.ts';
import {wrongLetterId} from '../test/letters.ts';
import {seededRandom} from '../test/seededRandom.ts';
import {wait, withFakeTimers} from '../test/timers.ts';
import {
  FAILED_FEEDBACK_DELAY_MS,
  FEEDBACK_DELAY_MS,
  useTrainingSession,
  type TrainingSession,
} from './useTrainingSession.ts';

withFakeTimers();

function renderSession(seed = 1) {
  const random = seededRandom(seed);
  return renderHook(() => useTrainingSession({random}));
}

function targetId(session: TrainingSession): string {
  if (!session.currentLetter) throw new Error('no current letter');
  return session.currentLetter.id;
}

function wrongId(session: TrainingSession): string {
  return wrongLetterId(targetId(session), session.state.rejectedLetterId);
}

function answer(result: {current: TrainingSession}, letterId: string) {
  act(() => result.current.select(letterId));
  act(() => result.current.submit());
}

describe('useTrainingSession', () => {
  it('starts idle with no current letter', () => {
    const {result} = renderSession();
    expect(result.current.state.phase).toBe('idle');
    expect(result.current.currentLetter).toBeNull();
  });

  it('advances to the next exercise after a correct answer, once the feedback delay has passed', () => {
    const {result} = renderSession();
    act(() => result.current.start(GEORGIAN_ALPHABET));
    answer(result, targetId(result.current));
    expect(result.current.state.phase).toBe('feedback');

    wait(FEEDBACK_DELAY_MS - 1);
    expect(result.current.state.index).toBe(0);
    wait(1);
    expect(result.current.state.phase).toBe('answering');
    expect(result.current.state.index).toBe(1);
  });

  it('keeps a failed exercise on screen longer, then advances', () => {
    const {result} = renderSession();
    act(() => result.current.start(GEORGIAN_ALPHABET));
    answer(result, wrongId(result.current));
    answer(result, wrongId(result.current));
    expect(result.current.state.feedback?.kind).toBe('failed');

    wait(FEEDBACK_DELAY_MS);
    expect(result.current.state.index).toBe(0);
    wait(FAILED_FEEDBACK_DELAY_MS - FEEDBACK_DELAY_MS);
    expect(result.current.state.index).toBe(1);
  });

  it('does not advance after a wrong first attempt', () => {
    const {result} = renderSession();
    act(() => result.current.start(GEORGIAN_ALPHABET));
    answer(result, wrongId(result.current));
    wait(FAILED_FEEDBACK_DELAY_MS * 2);
    expect(result.current.state.phase).toBe('answering');
    expect(result.current.state.index).toBe(0);
    expect(result.current.state.attempt).toBe(2);
  });

  it('advances exactly one exercise per resolved answer', () => {
    const {result} = renderSession();
    act(() => result.current.start(GEORGIAN_ALPHABET));
    answer(result, targetId(result.current));
    act(() => result.current.submit());
    wait(FEEDBACK_DELAY_MS * 5);
    expect(result.current.state.index).toBe(1);
    expect(result.current.state.phase).toBe('answering');
    expect(result.current.state.stats.totalAttempts).toBe(1);
  });

  it('opens the results after the final exercise', () => {
    const {result} = renderSession();
    act(() => result.current.start(GEORGIAN_ALPHABET));
    for (let i = 0; i < 33; i++) {
      answer(result, targetId(result.current));
      wait(FEEDBACK_DELAY_MS);
    }
    expect(result.current.state.phase).toBe('finished');
    expect(result.current.state.stats.score).toBe(33);
    wait(FAILED_FEEDBACK_DELAY_MS * 2);
    expect(result.current.state.phase).toBe('finished');
  });

  it('asks only the chosen letters, each once, then opens the results', () => {
    const {result} = renderSession();
    const chosen = GEORGIAN_ALPHABET.slice(0, 3);
    act(() => result.current.start(chosen));
    const asked: string[] = [];
    for (let i = 0; i < chosen.length; i++) {
      asked.push(targetId(result.current));
      answer(result, targetId(result.current));
      wait(FEEDBACK_DELAY_MS);
    }
    expect(asked.sort()).toEqual(chosen.map((letter) => letter.id).sort());
    expect(result.current.state.phase).toBe('finished');
  });

  it('restarting while feedback is showing cancels the pending advance', () => {
    const {result} = renderSession();
    act(() => result.current.start(GEORGIAN_ALPHABET));
    answer(result, targetId(result.current));
    const firstOrder = result.current.state.exercises;

    act(() => result.current.start(GEORGIAN_ALPHABET));
    wait(FAILED_FEEDBACK_DELAY_MS * 2);
    expect(result.current.state.phase).toBe('answering');
    expect(result.current.state.index).toBe(0);
    expect(result.current.state.stats.totalAttempts).toBe(0);
    expect(result.current.state.exercises).not.toEqual(firstOrder);
  });

  it('exiting while feedback is showing stays on the home screen', () => {
    const {result} = renderSession();
    act(() => result.current.start(GEORGIAN_ALPHABET));
    answer(result, targetId(result.current));
    act(() => result.current.exit());
    wait(FAILED_FEEDBACK_DELAY_MS * 2);
    expect(result.current.state.phase).toBe('idle');
    expect(result.current.currentLetter).toBeNull();
  });
});
