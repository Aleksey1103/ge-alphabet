import {useLanguage} from '../../hooks/useMessages.ts';
import {LANGUAGES, type Language} from '../../i18n/language.ts';
import {cx} from '../../utils/classNames.ts';

/**
 * Each language's code and its name in that language, which stay the same
 * whatever the interface language is.
 */
const LANGUAGE_LABELS: Record<Language, {code: string; name: string}> = {
  en: {code: 'EN', name: 'English'},
  ru: {code: 'RU', name: 'Русский'},
};

/** Segmented EN | RU buttons. The pressed one is the interface language. */
export default function LanguageSwitcher() {
  const {language, messages, setLanguage} = useLanguage();

  return (
    <div
      role="group"
      aria-label={messages.languageSwitcher}
      className="flex shrink-0 gap-1 rounded-full bg-surface p-1"
    >
      {LANGUAGES.map((option) => {
        const active = option === language;
        const {code, name} = LANGUAGE_LABELS[option];
        return (
          // `relative` keeps the sr-only name inside the button.
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            className={cx(
              `relative min-h-10 min-w-12 rounded-full px-3 text-sm font-bold
              transition-colors`,
              active ? 'bg-accent text-on-accent' : 'text-muted hover:text-fg',
            )}
            onClick={() => setLanguage(option)}
          >
            <span aria-hidden="true">{code}</span>
            <span className="sr-only">{name}</span>
          </button>
        );
      })}
    </div>
  );
}
