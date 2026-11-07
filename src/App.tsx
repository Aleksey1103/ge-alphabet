import {useMemo, useState} from 'react';
import {GEORGIAN_ALPHABET} from './data/georgianAlphabet.ts';
import {useLanguagePreference} from './hooks/useLanguagePreference.ts';
import {useTrainingSession} from './hooks/useTrainingSession.ts';
import {LanguageContext} from './i18n/LanguageContext.ts';
import HomeScreen from './screens/HomeScreen/index.ts';
import LearningScreen from './screens/LearningScreen/index.ts';
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

/**
 * The screen shown while no session is running. Settings and learning carry
 * the checked letters between them. Going home drops them, so settings opened
 * from home starts again with all letters.
 */
type IdleView =
  | {screen: 'home'}
  | {screen: 'settings'; letterIds: LetterSelection}
  | {screen: 'learning'; letterIds: LetterSelection};

const HOME: IdleView = {screen: 'home'};

function App() {
  const session = useTrainingSession();
  const {state} = session;
  const language = useLanguagePreference();
  const [idleView, setIdleView] = useState<IdleView>(HOME);
  /** The letters of the last session started, for Restart and New Session. */
  const [sessionLetterIds, setSessionLetterIds] =
    useState<LetterSelection>(ALL_LETTER_IDS);
  const sessionLetters = useMemo(
    () => lettersFromIds(sessionLetterIds),
    [sessionLetterIds],
  );

  // Once the session is over (exit from training or from the results), Home shows again.
  function startSession(letterIds: LetterSelection) {
    setSessionLetterIds(letterIds);
    setIdleView(HOME);
    session.start(lettersFromIds(letterIds));
  }

  function openSettings(letterIds: LetterSelection) {
    setIdleView({screen: 'settings', letterIds});
  }

  function idleScreen(view: IdleView) {
    switch (view.screen) {
      case 'home':
        return (
          <HomeScreen
            letters={GEORGIAN_ALPHABET}
            onGetStarted={() => openSettings(ALL_LETTER_IDS)}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            letters={GEORGIAN_ALPHABET}
            initialLetterIds={view.letterIds}
            onStart={startSession}
            onLearn={(letterIds) =>
              setIdleView({screen: 'learning', letterIds})
            }
            onBack={() => setIdleView(HOME)}
          />
        );
      case 'learning':
        return (
          <LearningScreen
            letters={lettersFromIds(view.letterIds)}
            onBack={() =>
              setIdleView({screen: 'settings', letterIds: view.letterIds})
            }
            onClose={() => setIdleView(HOME)}
            onStart={() => startSession(view.letterIds)}
          />
        );
    }
  }

  let screen;
  switch (state.phase) {
    case 'idle':
      screen = idleScreen(idleView);
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
            openSettings(sessionLetterIds);
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
      <LanguageContext value={language}>{screen}</LanguageContext>
    </div>
  );
}

export default App;
