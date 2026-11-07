import {useReducer} from 'react';
import IconButton from '../../components/IconButton/index.ts';
import LetterSoundButton from '../../components/LetterSoundButton/index.ts';
import PrimaryButton from '../../components/PrimaryButton/index.ts';
import Screen from '../../components/Screen/index.ts';
import ScreenHeading from '../../components/ScreenHeading/index.ts';
import {useMessages} from '../../hooks/useMessages.ts';
import {
  initialLetterPlayback,
  letterPlaybackReducer,
  letterSoundStatus,
} from '../../state/letterPlayback.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import {cx} from '../../utils/classNames.ts';

const HEADER_CELL_CLASSES =
  'sticky top-0 z-10 bg-surface px-4 py-2 text-sm font-semibold text-muted';

type LearningScreenProps = {
  /** The letters checked on the settings screen, in alphabetical order. */
  letters: readonly GeorgianLetter[];
  /** Returns to the settings screen with the same letters checked. */
  onBack: () => void;
  /** Returns to the main screen. */
  onClose: () => void;
  /** Starts a training session with these letters. */
  onStart: () => void;
};

/** Lists the chosen letters with a button that plays each one's sound. */
export default function LearningScreen({
  letters,
  onBack,
  onClose,
  onStart,
}: LearningScreenProps) {
  const t = useMessages();
  const [playback, dispatch] = useReducer(
    letterPlaybackReducer,
    initialLetterPlayback,
  );
  const failedLetter =
    playback?.status === 'error'
      ? letters.find((letter) => letter.id === playback.letterId)
      : undefined;

  return (
    <Screen className="gap-gutter">
      <header
        className="grid
          grid-cols-[var(--spacing-touch)_1fr_var(--spacing-touch)] items-center
          gap-gutter"
      >
        <IconButton icon="back" label={t.learning.back} onClick={onBack} />
        <ScreenHeading className="text-center text-2xl">
          {t.learning.title}
        </ScreenHeading>
        <IconButton
          icon="close"
          label={t.common.exitToHome}
          onClick={onClose}
        />
      </header>

      {/* On a short screen the table shrinks and scrolls by itself, so the header and button stay. */}
      <div
        className="min-h-0 overflow-y-auto overscroll-contain rounded-3xl
          bg-surface"
      >
        <table className="w-full border-collapse">
          <caption className="sr-only">{t.learning.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={cx(HEADER_CELL_CLASSES, 'text-left')}>
                {t.learning.letterColumn}
              </th>
              <th scope="col" className={cx(HEADER_CELL_CLASSES, 'text-right')}>
                {t.learning.soundColumn}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {letters.map((letter) => (
              <tr key={letter.id}>
                <th
                  scope="row"
                  lang="ka"
                  className="px-4 py-2 text-left text-[2rem] leading-none
                    font-semibold"
                >
                  {letter.character}
                </th>
                <td className="px-4 py-2 text-right">
                  <LetterSoundButton
                    letter={letter}
                    status={letterSoundStatus(playback, letter.id)}
                    onPlaybackEvent={(type) =>
                      dispatch({type, letterId: letter.id})
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {failedLetter && (
        <p
          className="rounded-xl bg-error-soft p-gutter text-center
            text-[0.9375rem]"
          role="alert"
        >
          {t.learning.soundFailed.before}
          <span lang="ka">{failedLetter.character}</span>
          {t.learning.soundFailed.after}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-tight">
        <PrimaryButton onClick={onStart}>
          {t.common.startTraining}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
