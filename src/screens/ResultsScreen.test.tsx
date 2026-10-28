import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import type {TrainingStats} from '../types/training.ts';
import {EMPTY_STATS} from '../utils/scoring.ts';
import ResultsScreen from './ResultsScreen.tsx';

function valueOf(label: string): string | null | undefined {
  return screen.getByText(label).nextElementSibling?.textContent;
}

describe('ResultsScreen', () => {
  it('shows every statistic from the session', () => {
    const stats: TrainingStats = {
      score: 5,
      firstTryCorrect: 20,
      secondTryCorrect: 6,
      failedExercises: 7,
      totalAttempts: 46,
    };
    render(
      <ResultsScreen
        stats={stats}
        totalExercises={33}
        onRestart={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', {name: 'Training complete'}),
    ).toBeTruthy();
    expect(screen.getByText('+5')).toBeTruthy();
    expect(valueOf('Correct on first try')).toBe('20');
    expect(valueOf('Correct on second try')).toBe('6');
    expect(valueOf('Failed exercises')).toBe('7');
    expect(valueOf('Total exercises')).toBe('33');
    expect(valueOf('Total attempts')).toBe('46');
    // 26 correct of 46 submitted = 56.5%
    expect(valueOf('Accuracy')).toBe('57%');
  });

  it('shows a negative score with a minus sign', () => {
    const stats: TrainingStats = {
      ...EMPTY_STATS,
      score: -4,
      failedExercises: 2,
      totalAttempts: 4,
    };
    render(
      <ResultsScreen
        stats={stats}
        totalExercises={2}
        onRestart={vi.fn()}
        onExit={vi.fn()}
      />,
    );
    expect(screen.getByText('−4')).toBeTruthy();
    expect(valueOf('Accuracy')).toBe('0%');
  });

  it('restarts or exits from the buttons', () => {
    const onRestart = vi.fn();
    const onExit = vi.fn();
    const stats: TrainingStats = {
      ...EMPTY_STATS,
      score: 1,
      firstTryCorrect: 1,
      totalAttempts: 1,
    };
    render(
      <ResultsScreen
        stats={stats}
        totalExercises={1}
        onRestart={onRestart}
        onExit={onExit}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Restart Training'}));
    fireEvent.click(screen.getByRole('button', {name: 'Exit to Home'}));
    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('handles being opened without session data', () => {
    const onExit = vi.fn();
    render(
      <ResultsScreen
        stats={null}
        totalExercises={0}
        onRestart={vi.fn()}
        onExit={onExit}
      />,
    );
    expect(screen.getByRole('heading', {name: 'No results yet'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Restart Training'})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Exit to Home'}));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
