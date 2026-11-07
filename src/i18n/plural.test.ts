import {describe, expect, it} from 'vitest';
import {pluralEn, pluralRu} from './plural.ts';

const LETTER_RU = {one: 'буква', few: 'буквы', many: 'букв'};
const LETTER_EN = {one: 'letter', other: 'letters'};

describe('pluralRu', () => {
  it.each([
    [0, 'букв'],
    [1, 'буква'],
    [2, 'буквы'],
    [4, 'буквы'],
    [5, 'букв'],
    [11, 'букв'],
    [12, 'букв'],
    [14, 'букв'],
    [21, 'буква'],
    [22, 'буквы'],
    [25, 'букв'],
    [33, 'буквы'],
  ])('uses the right form for %i', (count, form) => {
    expect(pluralRu(count, LETTER_RU)).toBe(form);
  });
});

describe('pluralEn', () => {
  it.each([
    [0, 'letters'],
    [1, 'letter'],
    [2, 'letters'],
    [33, 'letters'],
  ])('uses the right form for %i', (count, form) => {
    expect(pluralEn(count, LETTER_EN)).toBe(form);
  });
});
