export type GeorgianLetter = {
  /** Stable ID: the letter's romanized name, e.g. `ani`, `k'ani`. */
  id: string;
  /** The Mkhedruli character, e.g. `ა`. */
  character: string;
  /** The letter's name in Georgian, e.g. `ანი`. */
  name: string;
  /** Latin transliteration (2002 national system), e.g. `a`, `k'`. */
  transliteration: string;
  /** URL of the recorded sound, or `null` if the recording is missing. */
  audioSrc: string | null;
};

export type LetterPresetId =
  | 'all'
  | 'vowels'
  | 'distinct-sounds'
  | 'twins-p'
  | 'twins-t'
  | 'twins-ch'
  | 'twins-ts'
  | 'twins-h'
  | 'triplets-k'
  | 'all-twins'
  | 'custom';

/**
 * A ready-made letter set on the settings screen. Its name, in each language,
 * is in the messages module.
 */
export type LetterPreset = {
  id: LetterPresetId;
  /** Whether the select shows the letters after the name, such as "P twins · პ ფ". */
  showLetters: boolean;
  /** The preset's letter IDs in alphabetical order. Empty for `custom`. */
  letterIds: readonly string[];
};
