import PrimaryButton from '../../components/PrimaryButton/index.ts';
import Screen from '../../components/Screen/index.ts';
import ScreenHeading from '../../components/ScreenHeading/index.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import {
  formatScore,
  POINTS_FOR_CORRECT,
  POINTS_FOR_INCORRECT,
} from '../../utils/scoring.ts';

type HomeScreenProps = {
  letters: readonly GeorgianLetter[];
  onGetStarted: () => void;
};

export default function HomeScreen({letters, onGetStarted}: HomeScreenProps) {
  return (
    <Screen className="gap-6">
      <header className="flex flex-col gap-2 pt-2">
        <p className="text-lg font-semibold text-accent" lang="ka">
          ქართული ანბანი
        </p>
        <ScreenHeading
          className="text-[clamp(2rem,9vw,2.5rem)] leading-[1.1]
            tracking-[-0.02em]"
        >
          Learn Georgian
        </ScreenHeading>
        <p className="text-muted">
          Listen to the sound of a Georgian letter, then find it on the letter
          wheel. Train all {letters.length} letters or choose a smaller set.
          Each session asks them in a new random order.
        </p>
      </header>

      <div
        className="flex flex-wrap justify-center gap-2 rounded-3xl bg-surface
          p-4"
        role="img"
        aria-label={`The ${letters.length} letters of the Georgian alphabet`}
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
        <PrimaryButton onClick={onGetStarted}>Get Started</PrimaryButton>
        <p className="text-center text-sm text-muted">
          Two tries per letter · {formatScore(POINTS_FOR_CORRECT)} for a right
          answer, {formatScore(POINTS_FOR_INCORRECT)} for a wrong one
        </p>
      </div>
    </Screen>
  );
}
