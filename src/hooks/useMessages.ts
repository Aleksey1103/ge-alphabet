import {useContext} from 'react';
import {
  LanguageContext,
  type LanguageContextValue,
} from '../i18n/LanguageContext.ts';
import type {Messages} from '../i18n/messages.ts';

/** The interface language, its text and a way to switch it. */
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

/** The interface text in the current language. */
export function useMessages(): Messages {
  return useContext(LanguageContext).messages;
}
