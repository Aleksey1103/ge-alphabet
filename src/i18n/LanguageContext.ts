import {createContext} from 'react';
import {DEFAULT_LANGUAGE, type Language} from './language.ts';
import {MESSAGES, type Messages} from './messages.ts';

export type LanguageContextValue = {
  language: Language;
  /** The interface text in `language`. */
  messages: Messages;
  setLanguage: (language: Language) => void;
};

/**
 * The interface language, provided by `App`. Without a provider (a component
 * rendered on its own, as in tests) the text is English and can't be switched.
 */
export const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  messages: MESSAGES[DEFAULT_LANGUAGE],
  setLanguage: () => {},
});
