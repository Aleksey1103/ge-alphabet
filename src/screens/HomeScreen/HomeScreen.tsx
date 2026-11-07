import LanguageSwitcher from '../../components/LanguageSwitcher/index.ts';
import PrimaryButton from '../../components/PrimaryButton/index.ts';
import Screen from '../../components/Screen/index.ts';
import ScreenHeading from '../../components/ScreenHeading/index.ts';
import {useMessages} from '../../hooks/useMessages.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import {POINTS_FOR_CORRECT, POINTS_FOR_INCORRECT} from '../../utils/scoring.ts';

type HomeScreenProps = {
  letters: readonly GeorgianLetter[];
  onGetStarted: () => void;
};

export default function HomeScreen({letters, onGetStarted}: HomeScreenProps) {
  const t = useMessages();

  return (
    <Screen className="gap-6">
      <header className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between gap-gutter">
          <p className="text-lg font-semibold text-accent" lang="ka">
            ქართული ანბანი
          </p>
          <LanguageSwitcher />
        </div>
        <ScreenHeading
          className="text-[clamp(2rem,9vw,2.5rem)] leading-[1.1]
            tracking-[-0.02em]"
        >
          {t.home.title}
        </ScreenHeading>
        <p className="text-muted">{t.home.description(letters.length)}</p>
      </header>

      <div
        className="flex flex-wrap justify-center gap-2 rounded-3xl bg-surface
          p-4"
        role="img"
        aria-label={t.home.alphabetLabel(letters.length)}
      >
        {letters.map((letter, index) => (
          <span
            key={letter.id}
            lang="ka"
            className="grid size-10 animate-tile-in place-items-center
              rounded-[10px] bg-surface-2 text-[1.375rem] font-semibold
              first:bg-accent first:text-on-accent"
            style={{animationDelay: `${index * 18}ms`}}
          >
            {letter.character}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <PrimaryButton onClick={onGetStarted}>
          {t.home.getStarted}
        </PrimaryButton>
        <p className="text-center text-sm text-muted">
          {t.home.rules(POINTS_FOR_CORRECT, POINTS_FOR_INCORRECT)}
        </p>
      </div>
    </Screen>
  );
}
