import AudioPlayer from '../../components/AudioPlayer/index.ts';
import FeedbackMessage from '../../components/FeedbackMessage/index.ts';
import IconButton from '../../components/IconButton/index.ts';
import LetterCarousel from '../../components/LetterCarousel/index.ts';
import PrimaryButton from '../../components/PrimaryButton/index.ts';
import ProgressBar from '../../components/ProgressBar/index.ts';
import Screen from '../../components/Screen/index.ts';
import ScreenHeading from '../../components/ScreenHeading/index.ts';
import {useMessages} from '../../hooks/useMessages.ts';
import type {TrainingSession} from '../../hooks/useTrainingSession.ts';
import {
  canPlaySound,
  canSelectLetter,
  canSubmit,
  getLetterStatus,
} from '../../state/trainingSession.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import {cx} from '../../utils/classNames.ts';
import {formatScore} from '../../utils/scoring.ts';

const SECTION_CLASSES = 'flex flex-col rounded-3xl bg-surface';

type TrainingScreenProps = {
  letters: readonly GeorgianLetter[];
  session: TrainingSession;
};

export default function TrainingScreen({
  letters,
  session,
}: TrainingScreenProps) {
  const {state, currentLetter, select, deselect, submit, exit} = session;
  const t = useMessages();
  const exerciseKey = `${state.sessionId}:${state.index}`;
  const total = state.exercises.length;
  const completed = state.index + (state.phase === 'feedback' ? 1 : 0);
  const revealedLetterId =
    state.feedback?.kind === 'failed' ? (currentLetter?.id ?? null) : null;

  return (
    // Fits the viewport without scrolling; scrolls only on screens too short for everything.
    <Screen className="gap-gutter overscroll-contain">
      <header
        className="grid grid-cols-[var(--spacing-touch)_1fr_auto] items-center
          gap-gutter"
      >
        <IconButton icon="close" label={t.training.exit} onClick={exit} />
        <ScreenHeading
          className="text-center text-[clamp(0.875rem,4.2vw,1rem)]
            whitespace-nowrap"
          focusKey={exerciseKey}
        >
          {t.training.question(state.index + 1, total)}
        </ScreenHeading>
        <p
          className="min-w-touch rounded-full bg-surface px-3 py-1.5 text-center
            whitespace-nowrap"
        >
          <span className="text-[0.8125rem] text-muted">
            {t.training.score}
          </span>{' '}
          <span className="font-bold tabular-nums">
            {formatScore(state.stats.score)}
          </span>
        </p>
      </header>

      <ProgressBar
        value={completed}
        max={total}
        label={t.training.progress}
        className="h-1.5 bg-surface"
      />

      <section
        className={cx(
          SECTION_CLASSES,
          'flex-none items-center gap-tight p-section',
        )}
        aria-label={t.training.soundSection}
      >
        <FeedbackMessage
          feedback={state.feedback}
          correctLetter={currentLetter}
          prompt={t.training.prompt}
        />
        <AudioPlayer
          key={exerciseKey}
          src={currentLetter?.audioSrc ?? null}
          disabled={!canPlaySound(state)}
        />
      </section>

      {/* Takes the remaining height, but never less than the carousel's minimum plus the button. */}
      <section
        className={cx(SECTION_CLASSES, 'grow basis-0 gap-gutter p-gutter')}
        aria-label={t.training.answerSection}
      >
        <LetterCarousel
          letters={letters}
          getStatus={(letterId) => getLetterStatus(state, letterId)}
          isSelectable={(letterId) => canSelectLetter(state, letterId)}
          selectedLetterId={state.selectedLetterId}
          centeredLetterId={revealedLetterId ?? state.selectedLetterId}
          onSelect={select}
          onDeselect={deselect}
        />
        <PrimaryButton disabled={!canSubmit(state)} onClick={submit}>
          {t.training.confirm}
        </PrimaryButton>
      </section>
    </Screen>
  );
}
