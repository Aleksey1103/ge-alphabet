import {describe, expect, it} from 'vitest';
import {GEORGIAN_ALPHABET} from '../data/georgianAlphabet.ts';
import {LETTER_PRESETS} from '../data/letterPresets.ts';
import {
  canStartSession,
  lettersFromIds,
  matchingPresetId,
  presetLetterIds,
  toggleLetter,
} from './letterSelection.ts';

const VOWELS = ['ani', 'eni', 'ini', 'oni', 'uni'];

describe('lettersFromIds', () => {
  it('returns the letters in alphabetical order and drops unknown IDs', () => {
    const letters = lettersFromIds(['uni', 'missing', 'ani', 'eni']);
    expect(letters.map((letter) => letter.character)).toEqual(['ა', 'ე', 'უ']);
  });
});

describe('presetLetterIds', () => {
  it("returns a preset's letters", () => {
    expect(presetLetterIds('vowels')).toEqual(VOWELS);
    expect(presetLetterIds('all')).toHaveLength(33);
  });

  it('checks nothing for Custom', () => {
    expect(presetLetterIds('custom')).toEqual([]);
  });
});

describe('toggleLetter', () => {
  it('unchecks a checked letter and leaves the others', () => {
    expect(toggleLetter(VOWELS, 'ini')).toEqual(['ani', 'eni', 'oni', 'uni']);
  });

  it('checks a letter in its alphabetical place', () => {
    expect(toggleLetter(['ani', 'uni'], 'bani')).toEqual([
      'ani',
      'bani',
      'uni',
    ]);
  });
});

describe('matchingPresetId', () => {
  it('finds the preset for every preset set', () => {
    for (const preset of LETTER_PRESETS) {
      expect(matchingPresetId(preset.letterIds)).toBe(preset.id);
    }
  });

  it('switches to the matching preset after a toggle', () => {
    const nearlyP = ["p'ari"];
    expect(matchingPresetId(nearlyP)).toBe('custom');
    expect(matchingPresetId(toggleLetter(nearlyP, 'pari'))).toBe('twins-p');
  });

  it('falls back to Custom without changing the letters', () => {
    const edited = toggleLetter(VOWELS, 'uni');
    expect(matchingPresetId(edited)).toBe('custom');
    expect(edited).toEqual(['ani', 'eni', 'ini', 'oni']);
  });

  it('matches All letters only when every letter is checked', () => {
    const all = GEORGIAN_ALPHABET.map((letter) => letter.id);
    expect(matchingPresetId(all)).toBe('all');
    expect(matchingPresetId(all.slice(1))).toBe('custom');
  });
});

describe('canStartSession', () => {
  it('needs at least 2 letters', () => {
    expect(canStartSession([])).toBe(false);
    expect(canStartSession(['ani'])).toBe(false);
    expect(canStartSession(['ani', 'bani'])).toBe(true);
  });
});
