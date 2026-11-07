import {describe, expect, it} from 'vitest';
import {LETTER_PRESETS} from '../data/letterPresets.ts';
import {MESSAGES} from './messages.ts';
import {presetLabel} from './presetLabel.ts';

describe('presetLabel', () => {
  it('names the presets in English, as the spec lists them', () => {
    expect(
      LETTER_PRESETS.map((preset) => presetLabel(preset, MESSAGES.en)),
    ).toEqual([
      'All letters',
      'Vowels',
      'Distinct sounds',
      'P twins · პ ფ',
      'T twins · თ ტ',
      'Ch twins · ჩ ჭ',
      'Ts twins · ც წ',
      'H twins · ხ ჰ',
      'K triplets · კ ქ ყ',
      'All twins',
      'Custom',
    ]);
  });

  it('names the presets in Russian, as the spec lists them', () => {
    expect(
      LETTER_PRESETS.map((preset) => presetLabel(preset, MESSAGES.ru)),
    ).toEqual([
      'Все буквы',
      'Гласные',
      'Непохожие звуки',
      'Пара П · პ ფ',
      'Пара Т · თ ტ',
      'Пара Ч · ჩ ჭ',
      'Пара Ц · ც წ',
      'Пара Х · ხ ჰ',
      'Тройка К · კ ქ ყ',
      'Все пары и тройки',
      'Свой набор',
    ]);
  });
});
