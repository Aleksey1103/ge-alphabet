import {GEORGIAN_ALPHABET} from './data/georgianAlphabet.ts';
import {useTrainingSession} from './hooks/useTrainingSession.ts';
import HomeScreen from './screens/HomeScreen/index.ts';
import ResultsScreen from './screens/ResultsScreen/index.ts';
import TrainingScreen from './screens/TrainingScreen/index.ts';
import {cx} from './utils/classNames.ts';

function App() {
  const session = useTrainingSession();
  const {state} = session;

  let screen;
  switch (state.phase) {
    case 'idle':
      screen = (
        <HomeScreen letters={GEORGIAN_ALPHABET} onStart={session.start} />
      );
      break;
    case 'answering':
    case 'feedback':
      screen = <TrainingScreen letters={GEORGIAN_ALPHABET} session={session} />;
      break;
    case 'finished':
      screen = (
        <ResultsScreen
          stats={state.stats}
          totalExercises={state.exercises.length}
          onRestart={session.start}
          onExit={session.exit}
        />
      );
      break;
  }

  return (
    <div
      className={cx(
        // A phone-width column: full width on mobile, centered at ~430px on larger screens.
        'mx-auto flex h-dvh w-full max-w-[430px] flex-col',
        `pt-[calc(env(safe-area-inset-top)+var(--spacing-page))]
        pb-[calc(env(safe-area-inset-bottom)+var(--spacing-page))]`,
        `pr-[calc(env(safe-area-inset-right)+1rem)]
        pl-[calc(env(safe-area-inset-left)+1rem)]`,
      )}
    >
      {screen}
    </div>
  );
}

export default App;
