import type {LetterPreset, LetterPresetId} from '../types/alphabet.ts';
import {GEORGIAN_ALPHABET, getLetterById} from './georgianAlphabet.ts';

// The letter sets from SPEC 5.2, by letter ID, each in alphabetical order.

/**
 * Letters that sound alike to an English speaker. Their labels end with the
 * letters, such as "P twins · პ ფ".
 */
const TWINS: readonly LetterPreset[] = (
  [
    {id: 'twins-p', name: 'P twins', letterIds: ["p'ari", 'pari']},
    {id: 'twins-t', name: 'T twins', letterIds: ['tani', "t'ari"]},
    {id: 'twins-ch', name: 'Ch twins', letterIds: ['chini', "ch'ari"]},
    {id: 'twins-ts', name: 'Ts twins', letterIds: ['tsani', "ts'ili"]},
    {id: 'twins-h', name: 'H twins', letterIds: ['khani', 'hae']},
    {
      id: 'triplets-k',
      name: 'K triplets',
      letterIds: ["k'ani", 'kani', "q'ari"],
    },
  ] satisfies Array<{
    id: LetterPresetId;
    name: string;
    letterIds: readonly string[];
  }>
).map(({id, name, letterIds}) => ({
  id,
  label: `${name} · ${letterIds
    .map((letterId) => getLetterById(letterId)?.character)
    .join(' ')}`,
  letterIds,
}));

const twinIds = new Set(TWINS.flatMap((preset) => preset.letterIds));

/** The presets in the order the select lists them. */
export const LETTER_PRESETS: readonly LetterPreset[] = [
  {
    id: 'all',
    label: 'All letters',
    letterIds: GEORGIAN_ALPHABET.map((letter) => letter.id),
  },
  {
    id: 'vowels',
    label: 'Vowels',
    letterIds: ['ani', 'eni', 'ini', 'oni', 'uni'],
  },
  {
    id: 'distinct-sounds',
    label: 'Distinct sounds',
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
    label: 'All twins',
    letterIds: GEORGIAN_ALPHABET.filter((letter) => twinIds.has(letter.id)).map(
      (letter) => letter.id,
    ),
  },
  {id: 'custom', label: 'Custom', letterIds: []},
];
