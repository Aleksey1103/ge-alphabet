import PrimaryButton from '../../components/PrimaryButton.tsx';
import ProgressBar from '../../components/ProgressBar.tsx';
import Screen from '../../components/Screen.tsx';
import ScreenHeading from '../../components/ScreenHeading.tsx';
import type {TrainingStats} from '../../types/training.ts';
import {calculateAccuracy, formatScore} from '../../utils/scoring.ts';

const TITLE_CLASSES = 'pt-2 text-[1.75rem] leading-[1.2]';
const ACTIONS_CLASSES = 'mt-auto flex flex-col gap-3';

type ResultsScreenProps = {
  /** `null` when there's no finished session to show. */
  stats: TrainingStats | null;
  totalExercises: number;
  onRestart: () => void;
  onExit: () => void;
};

export default function ResultsScreen({
  stats,
  totalExercises,
  onRestart,
  onExit,
}: ResultsScreenProps) {
  if (stats === null || totalExercises === 0) {
    return (
      <Screen className="gap-4">
        <ScreenHeading className={TITLE_CLASSES}>No results yet</ScreenHeading>
        <p className="text-muted">
          Finish a training session to see your score here.
        </p>
        <div className={ACTIONS_CLASSES}>
          <PrimaryButton onClick={onExit}>Exit to Home</PrimaryButton>
        </div>
      </Screen>
    );
  }

  const accuracy = Math.round(calculateAccuracy(stats));
  const rows: Array<[label: string, value: number | string]> = [
    ['Correct on first try', stats.firstTryCorrect],
    ['Correct on second try', stats.secondTryCorrect],
    ['Failed exercises', stats.failedExercises],
    ['Total exercises', totalExercises],
    ['Total attempts', stats.totalAttempts],
    ['Accuracy', `${accuracy}%`],
  ];

  return (
    <Screen className="gap-4">
      <ScreenHeading className={TITLE_CLASSES}>Training complete</ScreenHeading>

      <section
        className="flex flex-col items-center gap-1 rounded-3xl bg-surface px-4
          py-6"
        aria-label="Final score"
      >
        <p className="font-semibold text-muted">Final score</p>
        <p className="text-[3.5rem] leading-[1.1] font-extrabold tabular-nums">
          {formatScore(stats.score)}
        </p>
        <ProgressBar
          value={accuracy}
          max={100}
          tone="success"
          className="mt-3 h-2 w-full bg-surface-2"
        />
        <p className="text-[0.9375rem] text-muted">{accuracy}% accuracy</p>
      </section>

      <dl className="divide-y divide-line rounded-3xl bg-surface px-4 py-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 py-3">
            <dt className="text-muted">{label}</dt>
            <dd className="font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className={ACTIONS_CLASSES}>
        <PrimaryButton onClick={onRestart}>Restart Training</PrimaryButton>
        <PrimaryButton variant="secondary" onClick={onExit}>
          Exit to Home
        </PrimaryButton>
      </div>
    </Screen>
  );
}
