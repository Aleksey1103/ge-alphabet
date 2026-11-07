import {useId, useState} from 'react';
import IconButton from '../../components/IconButton/index.ts';
import LetterGrid from '../../components/LetterGrid/index.ts';
import PrimaryButton from '../../components/PrimaryButton/index.ts';
import Screen from '../../components/Screen/index.ts';
import ScreenHeading from '../../components/ScreenHeading/index.ts';
import {LETTER_PRESETS} from '../../data/letterPresets.ts';
import {useMessages} from '../../hooks/useMessages.ts';
import {presetLabel} from '../../i18n/presetLabel.ts';
import {
  canStartSession,
  matchingPresetId,
  toggleLetter,
  type LetterSelection,
} from '../../state/letterSelection.ts';
import {MIN_SESSION_LETTERS} from '../../state/trainingSession.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';

type SettingsScreenProps = {
  letters: readonly GeorgianLetter[];
  /** The letters checked when the screen opens. */
  initialLetterIds: LetterSelection;
  onStart: (letterIds: LetterSelection) => void;
  /** Opens the learning screen with the checked letters. */
  onLearn: (letterIds: LetterSelection) => void;
  onBack: () => void;
};

/**
 * Picks the session's letters. The checked tiles are what counts; the preset
 * select only fills them in, and shows the preset that matches them.
 */
export default function SettingsScreen({
  letters,
  initialLetterIds,
  onStart,
  onLearn,
  onBack,
}: SettingsScreenProps) {
  const [letterIds, setLetterIds] = useState(initialLetterIds);
  const canStart = canStartSession(letterIds);
  const selectId = useId();
  const hintId = useId();
  const t = useMessages();

  return (
    <Screen className="gap-gutter">
      <header
        className="grid
          grid-cols-[var(--spacing-touch)_1fr_var(--spacing-touch)] items-center
          gap-gutter"
      >
        <IconButton icon="back" label={t.settings.back} onClick={onBack} />
        <ScreenHeading className="text-center text-2xl">
          {t.settings.title}
        </ScreenHeading>
      </header>

      <div className="flex flex-col gap-tight">
        <label htmlFor={selectId} className="text-sm text-muted">
          {t.settings.letterSet}
        </label>
        <div className="relative">
          <select
            id={selectId}
            className="min-h-touch w-full appearance-none rounded-2xl border-2
              border-line bg-surface pr-12 pl-4 text-base outline-none"
            value={matchingPresetId(letterIds)}
            onChange={(event) => {
              const preset = LETTER_PRESETS.find(
                ({id}) => id === event.target.value,
              );
              if (preset) setLetterIds(preset.letterIds);
            }}
          >
            {LETTER_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {presetLabel(preset, t)}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-4
              -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <LetterGrid
        letters={letters}
        checkedIds={letterIds}
        onToggle={(letterId) =>
          setLetterIds((ids) => toggleLetter(ids, letterId))
        }
        onClear={() => setLetterIds([])}
      />

      <div className="mt-auto flex flex-col gap-tight">
        <p className="text-center text-sm text-muted" role="status">
          {t.settings.lettersSelected(letterIds.length)}
        </p>
        {!canStart && (
          <p id={hintId} className="text-center text-sm text-muted">
            {t.settings.minLetters(MIN_SESSION_LETTERS)}
          </p>
        )}
        <PrimaryButton
          variant="secondary"
          disabled={!canStart}
          aria-describedby={canStart ? undefined : hintId}
          onClick={() => onLearn(letterIds)}
        >
          {t.common.learnLetters}
        </PrimaryButton>
        <PrimaryButton
          disabled={!canStart}
          aria-describedby={canStart ? undefined : hintId}
          onClick={() => onStart(letterIds)}
        >
          {t.common.startTraining}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
