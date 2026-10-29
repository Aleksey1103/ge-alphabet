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
  | 'single-sound'
  | 'familiar-p'
  | 'familiar-t'
  | 'familiar-ch'
  | 'familiar-tz'
  | 'familiar-h'
  | 'familiar-k'
  | 'all-familiar'
  | 'custom';

/** A ready-made letter set on the settings screen. */
export type LetterPreset = {
  id: LetterPresetId;
  /** The name shown in the preset select. */
  label: string;
  /** The preset's letter IDs in alphabetical order. Empty for `custom`. */
  letterIds: readonly string[];
};
