import type {LetterPreset, LetterPresetId} from '../types/alphabet.ts';
import {GEORGIAN_ALPHABET} from './georgianAlphabet.ts';

// The letter sets from SPEC 5.2, by letter ID, each in alphabetical order.

/**
 * Letters that sound alike to an English speaker. Their labels end with the
 * letters, such as "P twins · პ ფ".
 */
const TWINS: readonly LetterPreset[] = (
  [
    {id: 'twins-p', letterIds: ["p'ari", 'pari']},
    {id: 'twins-t', letterIds: ['tani', "t'ari"]},
    {id: 'twins-ch', letterIds: ['chini', "ch'ari"]},
    {id: 'twins-ts', letterIds: ['tsani', "ts'ili"]},
    {id: 'twins-h', letterIds: ['khani', 'hae']},
    {id: 'triplets-k', letterIds: ["k'ani", 'kani', "q'ari"]},
  ] satisfies Array<{id: LetterPresetId; letterIds: readonly string[]}>
).map((preset) => ({...preset, showLetters: true}));

const twinIds = new Set(TWINS.flatMap((preset) => preset.letterIds));

/** The presets in the order the select lists them. */
export const LETTER_PRESETS: readonly LetterPreset[] = [
  {
    id: 'all',
    showLetters: false,
    letterIds: GEORGIAN_ALPHABET.map((letter) => letter.id),
  },
  {
    id: 'vowels',
    showLetters: false,
    letterIds: ['ani', 'eni', 'ini', 'oni', 'uni'],
  },
  {
    id: 'distinct-sounds',
    showLetters: false,
    letterIds: [
      'ani',
      'bani',
      'gani',
      'doni',
      'eni',
      'vini',
      'zeni',
      'ini',
      'lasi',
      'mani',
      'nari',
      'oni',
      'zhani',
      'rae',
      'sani',
      'uni',
      'ghani',
      'shini',
      'dzili',
      'jani',
    ],
  },
  ...TWINS,
  {
    id: 'all-twins',
    showLetters: false,
    letterIds: GEORGIAN_ALPHABET.filter((letter) => twinIds.has(letter.id)).map(
      (letter) => letter.id,
    ),
  },
  {id: 'custom', showLetters: false, letterIds: []},
];
