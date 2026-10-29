import {GEORGIAN_ALPHABET} from '../data/georgianAlphabet.ts';
import {LETTER_PRESETS} from '../data/letterPresets.ts';
import type {GeorgianLetter, LetterPresetId} from '../types/alphabet.ts';
import {MIN_SESSION_LETTERS} from './trainingSession.ts';

/**
 * The letters checked on the settings screen, as IDs in alphabetical order.
 * Keeping one order means two selections are equal exactly when their arrays
 * are.
 */
export type LetterSelection = readonly string[];

/** The letters with these IDs, in alphabetical order. Unknown IDs are dropped. */
export function lettersFromIds(ids: Iterable<string>): GeorgianLetter[] {
  const wanted = new Set(ids);
  return GEORGIAN_ALPHABET.filter((letter) => wanted.has(letter.id));
}

export function presetLetterIds(presetId: LetterPresetId): LetterSelection {
  return (
    LETTER_PRESETS.find((preset) => preset.id === presetId)?.letterIds ?? []
  );
}

/** Checks or unchecks one letter and leaves the others as they are. */
export function toggleLetter(
  ids: LetterSelection,
  letterId: string,
): LetterSelection {
  if (ids.includes(letterId)) return ids.filter((id) => id !== letterId);
  return lettersFromIds([...ids, letterId]).map((letter) => letter.id);
}

/** The preset with exactly these letters, or `custom` when none matches. */
export function matchingPresetId(ids: LetterSelection): LetterPresetId {
  const preset = LETTER_PRESETS.find(
    ({letterIds}) =>
      letterIds.length === ids.length &&
      letterIds.every((id, index) => id === ids[index]),
  );
  return preset?.id ?? 'custom';
}

export function canStartSession(ids: LetterSelection): boolean {
  return ids.length >= MIN_SESSION_LETTERS;
}
