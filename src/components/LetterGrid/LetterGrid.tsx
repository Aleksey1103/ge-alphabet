import type {GeorgianLetter} from '../../types/alphabet.ts';
import {cx} from '../../utils/classNames.ts';

type LetterGridProps = {
  letters: readonly GeorgianLetter[];
  checkedIds: readonly string[];
  onToggle: (letterId: string) => void;
};

/**
 * Every letter as a toggle tile. A checked tile is marked with a tick as well
 * as color.
 */
export default function LetterGrid({
  letters,
  checkedIds,
  onToggle,
}: LetterGridProps) {
  return (
    <ul
      className="grid
        grid-cols-[repeat(auto-fill,minmax(var(--spacing-touch),1fr))]
        gap-tight"
      aria-label="Letters"
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
    </ul>
  );
}
