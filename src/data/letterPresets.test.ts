import {describe, expect, it} from 'vitest';
import {GEORGIAN_ALPHABET, getLetterById} from './georgianAlphabet.ts';
import {LETTER_PRESETS} from './letterPresets.ts';

function characters(presetId: string): string {
  const preset = LETTER_PRESETS.find((p) => p.id === presetId);
  if (!preset) throw new Error(`no preset ${presetId}`);
  return preset.letterIds
    .map((id) => getLetterById(id)?.character ?? '?')
    .join(' ');
}

describe('LETTER_PRESETS', () => {
  it('lists the presets from the spec, in order', () => {
    expect(LETTER_PRESETS.map((preset) => preset.label)).toEqual([
      'All letters',
      'Vowels',
      'Single sound',
      'Familiar P sound',
      'Familiar T sound',
      'Familiar Ch sound',
      'Familiar Tz sound',
      'Familiar H sound',
      'Familiar K sound',
      'All familiar sounds',
      'Custom',
    ]);
  });

  it('holds exactly the letters the spec lists for each preset', () => {
    expect(characters('all')).toBe(
      GEORGIAN_ALPHABET.map((letter) => letter.character).join(' '),
    );
    expect(characters('vowels')).toBe('ა ე ი ო უ');
    expect(characters('single-sound')).toBe(
      'ა ბ გ დ ე ვ ზ ი ლ მ ნ ო ჟ რ ს უ ღ შ ძ ჯ',
    );
    expect(characters('familiar-p')).toBe('პ ფ');
    expect(characters('familiar-t')).toBe('თ ტ');
    expect(characters('familiar-ch')).toBe('ჩ ჭ');
    expect(characters('familiar-tz')).toBe('ც წ');
    expect(characters('familiar-h')).toBe('ხ ჰ');
    expect(characters('familiar-k')).toBe('კ ქ ყ');
    expect(characters('all-familiar')).toBe('თ კ პ ტ ფ ქ ყ ჩ ც წ ჭ ხ ჰ');
    expect(characters('custom')).toBe('');
  });

  it('keeps every preset in alphabetical order', () => {
    const order = GEORGIAN_ALPHABET.map((letter) => letter.id);
    for (const preset of LETTER_PRESETS) {
      const positions = preset.letterIds.map((id) => order.indexOf(id));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });

  it('splits the alphabet between single sounds and familiar sounds', () => {
    const single = characters('single-sound').split(' ');
    const familiar = characters('all-familiar').split(' ');
    expect(single.filter((letter) => familiar.includes(letter))).toEqual([]);
    expect(single.length + familiar.length).toBe(33);
  });

  it('gives every preset a different set, so the select can always tell which one is checked', () => {
    const sets = LETTER_PRESETS.map((preset) => preset.letterIds.join(','));
    expect(new Set(sets).size).toBe(LETTER_PRESETS.length);
  });
});
