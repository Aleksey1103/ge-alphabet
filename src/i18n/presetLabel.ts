import {getLetterById} from '../data/georgianAlphabet.ts';
import type {LetterPreset} from '../types/alphabet.ts';
import type {Messages} from './messages.ts';

/**
 * The preset's name in the select, such as "Vowels", or "P twins · პ ფ" for a
 * preset that shows its letters.
 */
export function presetLabel(preset: LetterPreset, messages: Messages): string {
  const name = messages.presets[preset.id];
  if (!preset.showLetters) return name;
  const letters = preset.letterIds
    .map((letterId) => getLetterById(letterId)?.character ?? '')
    .join(' ');
  return `${name} · ${letters}`;
}
