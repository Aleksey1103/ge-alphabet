import type {LetterPreset} from '../types/alphabet.ts';
import {GEORGIAN_ALPHABET} from './georgianAlphabet.ts';

// The letter sets from SPEC 5.2, by letter ID, each in alphabetical order.

/** The six "Familiar … sound" groups. */
const FAMILIAR_SOUNDS: readonly LetterPreset[] = [
  {id: 'familiar-p', label: 'Familiar P sound', letterIds: ["p'ari", 'pari']},
  {id: 'familiar-t', label: 'Familiar T sound', letterIds: ['tani', "t'ari"]},
  {
    id: 'familiar-ch',
    label: 'Familiar Ch sound',
    letterIds: ['chini', "ch'ari"],
  },
  {
    id: 'familiar-tz',
    label: 'Familiar Tz sound',
    letterIds: ['tsani', "ts'ili"],
  },
  {id: 'familiar-h', label: 'Familiar H sound', letterIds: ['khani', 'hae']},
  {
    id: 'familiar-k',
    label: 'Familiar K sound',
    letterIds: ["k'ani", 'kani', "q'ari"],
  },
];

const familiarIds = new Set(FAMILIAR_SOUNDS.flatMap((p) => p.letterIds));

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
    id: 'single-sound',
    label: 'Single sound',
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
  ...FAMILIAR_SOUNDS,
  {
    id: 'all-familiar',
    label: 'All familiar sounds',
    letterIds: GEORGIAN_ALPHABET.filter((letter) =>
      familiarIds.has(letter.id),
    ).map((letter) => letter.id),
  },
  {id: 'custom', label: 'Custom', letterIds: []},
];
