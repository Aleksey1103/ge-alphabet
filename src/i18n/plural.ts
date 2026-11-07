/** Russian noun forms: 1 буква (one), 2 буквы (few), 5 букв (many). */
export type RussianForms = {one: string; few: string; many: string};

/** English noun forms: 1 letter, 2 letters. */
export type EnglishForms = {one: string; other: string};

const russianRules = new Intl.PluralRules('ru');
const englishRules = new Intl.PluralRules('en');

/** The Russian form of a noun for this count, such as `букв` for 5. */
export function pluralRu(count: number, forms: RussianForms): string {
  const category = russianRules.select(count);
  if (category === 'one') return forms.one;
  if (category === 'few') return forms.few;
  return forms.many;
}

/** The English form of a noun for this count, such as `letters` for 5. */
export function pluralEn(count: number, forms: EnglishForms): string {
  return englishRules.select(count) === 'one' ? forms.one : forms.other;
}
