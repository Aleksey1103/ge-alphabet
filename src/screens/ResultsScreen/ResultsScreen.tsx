import IconButton from '../../components/IconButton/index.ts';
import PrimaryButton from '../../components/PrimaryButton/index.ts';
import ProgressBar from '../../components/ProgressBar/index.ts';
import Screen from '../../components/Screen/index.ts';
import ScreenHeading from '../../components/ScreenHeading/index.ts';
import {useMessages} from '../../hooks/useMessages.ts';
import type {TrainingStats} from '../../types/training.ts';
import {calculateAccuracy, formatScore} from '../../utils/scoring.ts';

const TITLE_CLASSES = 'pt-2 text-[1.75rem] leading-[1.2]';
const ACTIONS_CLASSES = 'mt-auto flex flex-col gap-3';

type ResultsScreenProps = {
  /** `null` when there's no finished session to show. */
  stats: TrainingStats | null;
  totalExercises: number;
  onRestart: () => void;
  /** Opens the settings screen to choose the next session's letters. */
  onNewSession: () => void;
  onExit: () => void;
};

export default function ResultsScreen({
  stats,
  totalExercises,
  onRestart,
  onNewSession,
  onExit,
}: ResultsScreenProps) {
  const t = useMessages();

  if (stats === null || totalExercises === 0) {
    return (
      <Screen className="gap-4">
        <ScreenHeading className={TITLE_CLASSES}>
          {t.results.emptyTitle}
        </ScreenHeading>
        <p className="text-muted">{t.results.emptyText}</p>
        <div className={ACTIONS_CLASSES}>
          <PrimaryButton onClick={onExit}>{t.results.emptyExit}</PrimaryButton>
        </div>
      </Screen>
    );
  }

  const accuracy = Math.round(calculateAccuracy(stats));
  const rows: Array<[label: string, value: number | string]> = [
    [t.results.firstTry, stats.firstTryCorrect],
    [t.results.secondTry, stats.secondTryCorrect],
    [t.results.failed, stats.failedExercises],
    [t.results.totalExercises, totalExercises],
    [t.results.totalAttempts, stats.totalAttempts],
    [t.results.accuracyRow, `${accuracy}%`],
  ];

  return (
    <Screen className="gap-4">
      <header
        className="grid grid-cols-[var(--spacing-touch)_1fr] items-center
          gap-gutter"
      >
        <IconButton icon="close" label={t.common.exitToHome} onClick={onExit} />
        <ScreenHeading className="text-[1.75rem] leading-[1.2]">
          {t.results.title}
        </ScreenHeading>
      </header>

      <section
        className="flex flex-col items-center gap-1 rounded-3xl bg-surface px-4
          py-6"
        aria-label={t.results.finalScore}
      >
        <p className="font-semibold text-muted">{t.results.finalScore}</p>
        <p className="text-[3.5rem] leading-[1.1] font-extrabold tabular-nums">
          {formatScore(stats.score)}
        </p>
        <ProgressBar
          value={accuracy}
          max={100}
          tone="success"
          className="mt-3 h-2 w-full bg-surface-2"
        />
        <p className="text-[0.9375rem] text-muted">
          {t.results.accuracy(accuracy)}
        </p>
      </section>

      {/* On a short screen the list shrinks and scrolls by itself, so the screen around it doesn't. */}
      <dl
        className="min-h-0 divide-y divide-line overflow-y-auto
          overscroll-contain rounded-3xl bg-surface px-4 py-1"
      >
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 py-3">
            <dt className="text-muted">{label}</dt>
            <dd className="font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className={ACTIONS_CLASSES}>
        <PrimaryButton onClick={onRestart}>{t.results.restart}</PrimaryButton>
        <PrimaryButton variant="secondary" onClick={onNewSession}>
          {t.results.newSession}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
