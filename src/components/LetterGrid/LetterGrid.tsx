import {useMessages} from '../../hooks/useMessages.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import {cx} from '../../utils/classNames.ts';

type LetterGridProps = {
  letters: readonly GeorgianLetter[];
  checkedIds: readonly string[];
  onToggle: (letterId: string) => void;
  /** Unchecks every letter. */
  onClear: () => void;
};

/**
 * Every letter as a toggle tile, followed by a Clear button. A checked tile is
 * marked with a tick as well as color.
 */
export default function LetterGrid({
  letters,
  checkedIds,
  onToggle,
  onClear,
}: LetterGridProps) {
  const hasChecked = checkedIds.length > 0;
  const t = useMessages();

  return (
    <ul
      className="grid
        grid-cols-[repeat(auto-fill,minmax(var(--spacing-touch),1fr))]
        gap-tight"
      aria-label={t.settings.letters}
    >
      {letters.map((letter) => {
        const checked = checkedIds.includes(letter.id);
        return (
          <li key={letter.id}>
            <button
              type="button"
              aria-pressed={checked}
              className={cx(
                `relative grid aspect-square w-full place-items-center
                rounded-xl border-2 transition-[background-color,border-color]`,
                checked
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-surface hover:bg-surface-2',
              )}
              onClick={() => onToggle(letter.id)}
            >
              <span lang="ka" className="text-2xl leading-none font-semibold">
                {letter.character}
              </span>
              {checked && (
                <span
                  className="absolute top-0.5 right-1.5 text-xs font-bold
                    text-accent"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          </li>
        );
      })}
      {/* Two tiles wide, at the end of the last row (or a new row when it's full). */}
      <li className="col-[span_2/-1]">
        {/* aria-disabled keeps focus on the button once it has cleared everything. */}
        <button
          type="button"
          className="size-full rounded-xl border-2 border-line text-sm
            font-semibold text-accent hover:not-aria-disabled:bg-surface-2
            aria-disabled:cursor-not-allowed aria-disabled:opacity-45"
          aria-disabled={!hasChecked}
          onClick={() => {
            if (hasChecked) onClear();
          }}
        >
          {t.settings.clear}
        </button>
      </li>
    </ul>
  );
}
