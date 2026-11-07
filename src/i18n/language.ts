/** The interface languages. Georgian letters and text are never translated. */
export const LANGUAGES = ['en', 'ru'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

const STORAGE_KEY = 'language';

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((language) => language === value);
}

/**
 * Russian when the browser's first preferred language is Russian (`ru`,
 * `ru-RU`…), English otherwise.
 */
export function detectLanguage(preferred: readonly string[]): Language {
  const first = preferred[0]?.toLowerCase() ?? '';
  return first === 'ru' || first.startsWith('ru-') ? 'ru' : DEFAULT_LANGUAGE;
}

/** The saved language if there is a valid one, otherwise the detected one. */
export function loadLanguage(
  storage: Pick<Storage, 'getItem'> | undefined,
  preferred: readonly string[],
): Language {
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage can be unavailable (private mode, blocked site data); detect instead.
  }
  return detectLanguage(preferred);
}

/** Saves the choice for later visits. Does nothing if storage is unavailable. */
export function saveLanguage(
  storage: Pick<Storage, 'setItem'> | undefined,
  language: Language,
): void {
  try {
    storage?.setItem(STORAGE_KEY, language);
  } catch {
    // The choice then lasts only until the page reloads.
  }
}
