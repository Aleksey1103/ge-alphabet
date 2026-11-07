import type {LetterPresetId} from '../types/alphabet.ts';
import {formatScore} from '../utils/scoring.ts';
import type {Language} from './language.ts';
import {pluralEn, pluralRu} from './plural.ts';

/**
 * Text placed around a Georgian letter, which the component renders in its own
 * `<span lang="ka">`.
 */
export type AroundLetter = {before: string; after: string};

/**
 * Every piece of interface text, in one language. Both dictionaries must have
 * this exact shape, so a missing translation fails the type check.
 */
export type Messages = {
  /** The browser tab's title. */
  documentTitle: string;
  /** The language switcher's group label. */
  languageSwitcher: string;
  common: {
    exitToHome: string;
    learnLetters: string;
    startTraining: string;
  };
  home: {
    title: string;
    description: (letterCount: number) => string;
    alphabetLabel: (letterCount: number) => string;
    getStarted: string;
    rules: (gain: number, loss: number) => string;
  };
  settings: {
    title: string;
    back: string;
    letterSet: string;
    letters: string;
    clear: string;
    lettersSelected: (count: number) => string;
    minLetters: (min: number) => string;
  };
  /** Preset names. Sound-alike presets get their letters appended. */
  presets: Record<LetterPresetId, string>;
  learning: {
    title: string;
    back: string;
    caption: string;
    letterColumn: string;
    soundColumn: string;
    play: AroundLetter;
    /** Visible next to a disabled button. */
    noSound: string;
    noSoundFor: AroundLetter;
    soundFailed: AroundLetter;
  };
  training: {
    exit: string;
    question: (number: number, total: number) => string;
    score: string;
    progress: string;
    soundSection: string;
    answerSection: string;
    prompt: string;
    letters: string;
    confirm: string;
    correctBadge: string;
    wrongBadge: string;
  };
  feedback: {
    correctFirst: (points: number) => string;
    correctSecond: (points: number) => string;
    retry: (points: number) => string;
    failed: (points: number) => AroundLetter;
  };
  audio: {
    play: string;
    noSound: string;
    slow: string;
    loading: string;
    loadError: string;
    blocked: string;
    missing: string;
    tryAgain: string;
  };
  results: {
    title: string;
    finalScore: string;
    accuracy: (percent: number) => string;
    firstTry: string;
    secondTry: string;
    failed: string;
    totalExercises: string;
    totalAttempts: string;
    accuracyRow: string;
    restart: string;
    newSession: string;
    emptyTitle: string;
    emptyText: string;
    /** The button on the empty results screen. */
    emptyExit: string;
  };
};

const pointsEn = (points: number) =>
  `${formatScore(points)} ${pluralEn(Math.abs(points), {one: 'point', other: 'points'})}`;

const lettersEn = (count: number) =>
  `${count} ${pluralEn(count, {one: 'letter', other: 'letters'})}`;

const en: Messages = {
  documentTitle: 'Learn Alphabet',
  languageSwitcher: 'Interface language',
  common: {
    exitToHome: 'Exit to home',
    learnLetters: 'Learn Letters',
    startTraining: 'Start Training',
  },
  home: {
    title: 'Learn Alphabet',
    description: (count) =>
      'Listen to the sound of a Georgian letter, then find it on the letter ' +
      `wheel. Train all ${count} letters or choose a smaller set. Each ` +
      'session asks them in a new random order.',
    alphabetLabel: (count) => `The ${count} letters of the Georgian alphabet`,
    getStarted: 'Get Started',
    rules: (gain, loss) =>
      `Two tries per letter · ${formatScore(gain)} for a right answer, ` +
      `${formatScore(loss)} for a wrong one`,
  },
  settings: {
    title: 'Choose Letters',
    back: 'Back to home',
    letterSet: 'Letter set',
    letters: 'Letters',
    clear: 'Clear',
    lettersSelected: (count) => `${lettersEn(count)} selected`,
    minLetters: (min) => `Choose at least ${lettersEn(min)}`,
  },
  presets: {
    all: 'All letters',
    vowels: 'Vowels',
    'distinct-sounds': 'Distinct sounds',
    'twins-p': 'P twins',
    'twins-t': 'T twins',
    'twins-ch': 'Ch twins',
    'twins-ts': 'Ts twins',
    'twins-h': 'H twins',
    'triplets-k': 'K triplets',
    'all-twins': 'All twins',
    custom: 'Custom',
  },
  learning: {
    title: 'Learn Letters',
    back: 'Back to settings',
    caption: 'Letters and their sounds',
    letterColumn: 'Letter',
    soundColumn: 'Sound',
    play: {before: 'Play ', after: ''},
    noSound: 'No sound',
    noSoundFor: {before: 'No sound for ', after: ''},
    soundFailed: {
      before: 'The sound for ',
      after: " couldn't be played. Tap it to try again.",
    },
  },
  training: {
    exit: 'Exit training',
    question: (number, total) => `Question ${number} of ${total}`,
    score: 'Score',
    progress: 'Exercises completed',
    soundSection: 'Sound',
    answerSection: 'Answer',
    prompt: 'Listen and find the letter',
    letters: 'Georgian letters',
    confirm: 'Confirm Answer',
    correctBadge: 'correct answer',
    wrongBadge: 'wrong answer',
  },
  feedback: {
    correctFirst: (points) => `Correct! ${pointsEn(points)}`,
    correctSecond: (points) => `Correct on the second try! ${pointsEn(points)}`,
    retry: (points) => `Not quite! ${pointsEn(points)}. Try once more.`,
    failed: (points) => ({
      before: `Incorrect, ${pointsEn(points)}. The correct letter was `,
      after: '',
    }),
  },
  audio: {
    play: 'Play sound',
    noSound: 'No sound',
    slow: 'Slow (half speed)',
    loading: 'Loading…',
    loadError:
      "The sound couldn't be loaded. Check your connection and try again.",
    blocked: 'Your browser blocked the sound. Tap “Try again” to play it.',
    missing:
      "The recording for this letter is missing, so this exercise can't be played.",
    tryAgain: 'Try again',
  },
  results: {
    title: 'Results',
    finalScore: 'Final score',
    accuracy: (percent) => `${percent}% accuracy`,
    firstTry: 'Correct on first try',
    secondTry: 'Correct on second try',
    failed: 'Failed exercises',
    totalExercises: 'Total exercises',
    totalAttempts: 'Total attempts',
    accuracyRow: 'Accuracy',
    restart: 'Restart Training',
    newSession: 'New Session',
    emptyTitle: 'No results yet',
    emptyText: 'Finish a training session to see your score here.',
    emptyExit: 'Exit to Home',
  },
};

const pointsRu = (points: number) =>
  `${formatScore(points)} ${pluralRu(Math.abs(points), {one: 'балл', few: 'балла', many: 'баллов'})}`;

const lettersRu = (count: number) =>
  `${count} ${pluralRu(count, {one: 'буква', few: 'буквы', many: 'букв'})}`;

const ru: Messages = {
  documentTitle: 'Учим алфавит',
  languageSwitcher: 'Язык интерфейса',
  common: {
    exitToHome: 'На главную',
    learnLetters: 'Изучить буквы',
    startTraining: 'Начать тренировку',
  },
  home: {
    title: 'Учим алфавит',
    description: (count) =>
      'Послушайте звук грузинской буквы и найдите её в карусели. ' +
      `Тренируйте все ${lettersRu(count)} или выберите набор поменьше. ` +
      'В каждой тренировке буквы идут в новом случайном порядке.',
    alphabetLabel: (count) => `${lettersRu(count)} грузинского алфавита`,
    getStarted: 'Начать',
    rules: (gain, loss) =>
      `Две попытки на букву · ${formatScore(gain)} за верный ответ, ` +
      `${formatScore(loss)} за неверный`,
  },
  settings: {
    title: 'Выберите буквы',
    back: 'На главную',
    letterSet: 'Набор букв',
    letters: 'Буквы',
    clear: 'Очистить',
    lettersSelected: (count) => `Выбрано: ${lettersRu(count)}`,
    minLetters: (min) => `Выберите хотя бы ${lettersRu(min)}`,
  },
  presets: {
    all: 'Все буквы',
    vowels: 'Гласные',
    'distinct-sounds': 'Непохожие звуки',
    'twins-p': 'Пара П',
    'twins-t': 'Пара Т',
    'twins-ch': 'Пара Ч',
    'twins-ts': 'Пара Ц',
    'twins-h': 'Пара Х',
    'triplets-k': 'Тройка К',
    'all-twins': 'Все пары и тройки',
    custom: 'Свой набор',
  },
  learning: {
    title: 'Изучение букв',
    back: 'Назад к выбору букв',
    caption: 'Буквы и их звуки',
    letterColumn: 'Буква',
    soundColumn: 'Звук',
    play: {before: 'Слушать ', after: ''},
    noSound: 'Нет звука',
    noSoundFor: {before: 'Нет звука для ', after: ''},
    soundFailed: {
      before: 'Не удалось воспроизвести звук ',
      after: '. Нажмите на кнопку ещё раз.',
    },
  },
  training: {
    exit: 'Выйти из тренировки',
    question: (number, total) => `Вопрос ${number} из ${total}`,
    score: 'Счёт',
    progress: 'Выполнено заданий',
    soundSection: 'Звук',
    answerSection: 'Ответ',
    prompt: 'Послушайте и найдите букву',
    letters: 'Грузинские буквы',
    confirm: 'Подтвердить ответ',
    correctBadge: 'правильный ответ',
    wrongBadge: 'неправильный ответ',
  },
  feedback: {
    correctFirst: (points) => `Верно! ${pointsRu(points)}`,
    correctSecond: (points) => `Верно со второй попытки! ${pointsRu(points)}`,
    retry: (points) => `Не совсем! ${pointsRu(points)}. Попробуйте ещё раз.`,
    failed: (points) => ({
      before: `Неверно, ${pointsRu(points)}. Правильная буква — `,
      after: '',
    }),
  },
  audio: {
    play: 'Воспроизвести звук',
    noSound: 'Нет звука',
    slow: 'Медленно (на половинной скорости)',
    loading: 'Загрузка…',
    loadError:
      'Не удалось загрузить звук. Проверьте подключение и попробуйте ещё раз.',
    blocked:
      'Браузер заблокировал звук. Нажмите «Повторить», чтобы его воспроизвести.',
    missing:
      'Для этой буквы нет записи, поэтому это задание нельзя прослушать.',
    tryAgain: 'Повторить',
  },
  results: {
    title: 'Результаты',
    finalScore: 'Итоговый счёт',
    accuracy: (percent) => `Точность ${percent}%`,
    firstTry: 'Верно с первой попытки',
    secondTry: 'Верно со второй попытки',
    failed: 'Неудачные задания',
    totalExercises: 'Всего заданий',
    totalAttempts: 'Всего попыток',
    accuracyRow: 'Точность',
    restart: 'Начать заново',
    newSession: 'Новая тренировка',
    emptyTitle: 'Результатов пока нет',
    emptyText: 'Завершите тренировку, чтобы увидеть здесь свой счёт.',
    emptyExit: 'На главную',
  },
};

export const MESSAGES: Record<Language, Messages> = {en, ru};
