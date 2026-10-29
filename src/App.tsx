import {useMemo, useState} from 'react';
import {GEORGIAN_ALPHABET} from './data/georgianAlphabet.ts';
import {useTrainingSession} from './hooks/useTrainingSession.ts';
import HomeScreen from './screens/HomeScreen/index.ts';
import ResultsScreen from './screens/ResultsScreen/index.ts';
import SettingsScreen from './screens/SettingsScreen/index.ts';
import TrainingScreen from './screens/TrainingScreen/index.ts';
import {
  lettersFromIds,
  presetLetterIds,
  type LetterSelection,
} from './state/letterSelection.ts';
import {cx} from './utils/classNames.ts';

const ALL_LETTER_IDS = presetLetterIds('all');

function App() {
  const session = useTrainingSession();
  const {state} = session;
  /** The screen shown while no session is running. */
  const [idleView, setIdleView] = useState<'home' | 'settings'>('home');
  /** The letters of the last session started. The settings screen opens with them. */
  const [sessionLetterIds, setSessionLetterIds] =
    useState<LetterSelection>(ALL_LETTER_IDS);
  const sessionLetters = useMemo(
    () => lettersFromIds(sessionLetterIds),
    [sessionLetterIds],
  );

  // Once the session is over (exit from training or from the results), Home shows again.
  function startSession(letterIds: LetterSelection) {
    setSessionLetterIds(letterIds);
    setIdleView('home');
    session.start(lettersFromIds(letterIds));
  }

  let screen;
  switch (state.phase) {
    case 'idle':
      screen =
        idleView === 'home' ? (
          <HomeScreen
            letters={GEORGIAN_ALPHABET}
            onGetStarted={() => setIdleView('settings')}
          />
        ) : (
          <SettingsScreen
            letters={GEORGIAN_ALPHABET}
            initialLetterIds={sessionLetterIds}
            onStart={startSession}
            onBack={() => setIdleView('home')}
          />
        );
      break;
    case 'answering':
    case 'feedback':
      screen = <TrainingScreen letters={sessionLetters} session={session} />;
      break;
    case 'finished':
      screen = (
        <ResultsScreen
          stats={state.stats}
          totalExercises={state.exercises.length}
          onRestart={() => session.start(sessionLetters)}
          onNewSession={() => {
            setIdleView('settings');
            session.exit();
          }}
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
