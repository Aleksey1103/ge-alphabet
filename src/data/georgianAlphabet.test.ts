import {describe, expect, it} from 'vitest';
import {GEORGIAN_ALPHABET, getLetterById} from './georgianAlphabet.ts';

describe('GEORGIAN_ALPHABET', () => {
  it('has the 33 modern Mkhedruli letters in order, U+10D0 to U+10F0', () => {
    const codePoints = GEORGIAN_ALPHABET.map((letter) =>
      letter.character.codePointAt(0),
    );
    const expected = Array.from({length: 33}, (_, i) => 0x10d0 + i);
    expect(codePoints).toEqual(expected);
    expect(
      GEORGIAN_ALPHABET.every((letter) => [...letter.character].length === 1),
    ).toBe(true);
  });

  it('gives every letter a unique ID', () => {
    const ids = GEORGIAN_ALPHABET.map((letter) => letter.id);
    expect(new Set(ids).size).toBe(33);
  });

  it('gives every letter a Georgian name starting with the letter, and a transliteration', () => {
    for (const letter of GEORGIAN_ALPHABET) {
      expect(letter.name.startsWith(letter.character)).toBe(true);
      expect(letter.transliteration).toMatch(/^[a-z]+'?$/);
    }
  });

  it('has a recording for every letter, named by the letter', () => {
    const missing = GEORGIAN_ALPHABET.filter(
      (letter) => letter.audioSrc === null,
    );
    expect(missing.map((letter) => letter.character)).toEqual([]);
    for (const letter of GEORGIAN_ALPHABET) {
      expect(decodeURIComponent(letter.audioSrc ?? '')).toContain(
        `${letter.character}.mp3`,
      );
    }
  });

  it('looks letters up by ID', () => {
    expect(getLetterById("k'ani")?.character).toBe('კ');
    expect(getLetterById('kani')?.character).toBe('ქ');
    expect(getLetterById('missing')).toBeUndefined();
  });
});
