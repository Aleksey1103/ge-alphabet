import {useCallback, useEffect, useMemo, useState} from 'react';
import type {LanguageContextValue} from '../i18n/LanguageContext.ts';
import {loadLanguage, saveLanguage, type Language} from '../i18n/language.ts';
import {MESSAGES} from '../i18n/messages.ts';

/** `localStorage`, or `undefined` where reading it throws (blocked site data). */
function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function preferredLanguages(): readonly string[] {
  return navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];
}

/**
 * The interface language: the saved choice, or the browser's language on the
 * first visit. Switching saves the choice, and the page's `lang` and title
 * follow it.
 */
export function useLanguagePreference(): LanguageContextValue {
  const [language, setLanguageState] = useState<Language>(() =>
    loadLanguage(browserStorage(), preferredLanguages()),
  );
  const messages = MESSAGES[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = messages.documentTitle;
  }, [language, messages]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    saveLanguage(browserStorage(), next);
  }, []);

  return useMemo(
    () => ({language, messages, setLanguage}),
    [language, messages, setLanguage],
  );
}
