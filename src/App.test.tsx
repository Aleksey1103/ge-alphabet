import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import App from './App.tsx';
import {
  FAILED_FEEDBACK_DELAY_MS,
  FEEDBACK_DELAY_MS,
} from './hooks/useTrainingSession.ts';
import {wait, withFakeTimers} from './test/timers.ts';

withFakeTimers();

/** Reads the target letter from the recording the app actually loaded. */
function targetCharacter(): string {
  const src = document.querySelector('audio')?.getAttribute('src');
  const match = src && decodeURIComponent(src).match(/([ა-ჰ])\.mp3/);
  if (!match)
    throw new Error(`can't tell the target letter from audio src ${src}`);
  return match[1];
}

function option(character: string): HTMLElement {
  const found = screen
    .getAllByRole('option')
    .find(
      (element) =>
        element.querySelector('[lang="ka"]')?.textContent === character,
    );
  if (!found) throw new Error(`no option for ${character}`);
  return found;
}

function wrongOption(): HTMLElement {
  const target = targetCharacter();
  const found = screen
    .getAllByRole('option')
    .find(
      (element) =>
        element.getAttribute('aria-disabled') !== 'true' &&
        element.querySelector('[lang="ka"]')?.textContent !== target,
    );
  if (!found) throw new Error('no wrong option available');
  return found;
}

function confirmButton(): HTMLElement {
  return screen.getByRole('button', {name: 'Confirm Answer'});
}

function score(): string | null {
  return (
    document.querySelector('header p span:last-child')?.textContent ?? null
  );
}

/** A statistic on the results screen. */
function valueOf(label: string): string | null | undefined {
  return screen.getByText(label).nextElementSibling?.textContent;
}

function openSettings() {
  fireEvent.click(screen.getByRole('button', {name: 'Get Started'}));
}

function chooseLetterSet(label: string) {
  const select = screen.getByRole('combobox', {name: 'Letter set'});
  const option = [...select.querySelectorAll('option')].find(
    (element) => element.textContent === label,
  );
  if (!option) throw new Error(`no letter set ${label}`);
  fireEvent.change(select, {target: {value: option.value}});
}

function letterSet(): string | undefined {
  const select = screen.getByRole<HTMLSelectElement>('combobox', {
    name: 'Letter set',
  });
  return select.selectedOptions[0]?.textContent;
}

/** The distinct letters on the wheel, which repeats a short set. */
function wheelLetters(): string[] {
  const characters = screen
    .getAllByRole('option')
    .map((element) => element.querySelector('[lang="ka"]')?.textContent ?? '');
  return [...new Set(characters)];
}

function startTraining(letterSetLabel?: string) {
  render(<App />);
  openSettings();
  if (letterSetLabel) chooseLetterSet(letterSetLabel);
  fireEvent.click(screen.getByRole('button', {name: 'Start Training'}));
}

describe('App', () => {
  it('starts on the home screen', () => {
    render(<App />);
    expect(screen.getByRole('heading', {name: 'Learn Georgian'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Get Started'})).toBeTruthy();
  });

  it('opens the settings screen with all letters, and goes back home', () => {
    render(<App />);
    openSettings();
    expect(screen.getByRole('heading', {name: 'Choose Letters'})).toBeTruthy();
    expect(letterSet()).toBe('All letters');

    fireEvent.click(screen.getByRole('button', {name: 'Back to home'}));
    expect(screen.getByRole('heading', {name: 'Learn Georgian'})).toBeTruthy();
  });

  it('trains only the chosen letters, and restarts with the same ones', () => {
    startTraining('Vowels');
    expect(screen.getByRole('heading', {name: 'Question 1 of 5'})).toBeTruthy();
    expect(wheelLetters()).toEqual(['ა', 'ე', 'ი', 'ო', 'უ']);

    const played = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const target = targetCharacter();
      played.add(target);
      fireEvent.click(option(target));
      fireEvent.click(confirmButton());
      wait(FEEDBACK_DELAY_MS);
    }
    expect([...played].sort()).toEqual(['ა', 'ე', 'ი', 'ო', 'უ']);
    expect(valueOf('Total exercises')).toBe('5');

    fireEvent.click(screen.getByRole('button', {name: 'Restart Training'}));
    expect(screen.getByRole('heading', {name: 'Question 1 of 5'})).toBeTruthy();
    expect(wheelLetters()).toEqual(['ა', 'ე', 'ი', 'ო', 'უ']);
  });

  it('runs a 2-letter session', () => {
    startTraining('P twins · პ ფ');
    expect(screen.getByRole('heading', {name: 'Question 1 of 2'})).toBeTruthy();
    expect(wheelLetters()).toEqual(['პ', 'ფ']);
    fireEvent.click(option(targetCharacter()));
    fireEvent.click(confirmButton());
    expect(score()).toBe('+1');
  });

  it('goes from the results to a new session or home', () => {
    const finishSession = () => {
      for (let i = 0; i < 2; i++) {
        fireEvent.click(option(targetCharacter()));
        fireEvent.click(confirmButton());
        wait(FEEDBACK_DELAY_MS);
      }
      expect(
        screen.getByRole('heading', {name: 'Training complete'}),
      ).toBeTruthy();
    };
    startTraining('P twins · პ ფ');
    finishSession();

    fireEvent.click(screen.getByRole('button', {name: 'New Session'}));
    expect(screen.getByRole('heading', {name: 'Choose Letters'})).toBeTruthy();
    expect(letterSet()).toBe('P twins · პ ფ');

    fireEvent.click(screen.getByRole('button', {name: 'Start Training'}));
    finishSession();
    fireEvent.click(screen.getByRole('button', {name: 'Exit to home'}));
    expect(screen.getByRole('heading', {name: 'Learn Georgian'})).toBeTruthy();
  });

  it('learns the chosen letters, then goes back, home, or into training', () => {
    const learnLetters = () =>
      fireEvent.click(screen.getByRole('button', {name: 'Learn Letters'}));
    const rowLetters = () =>
      screen.getAllByRole('rowheader').map((cell) => cell.textContent);

    render(<App />);
    openSettings();
    chooseLetterSet('Vowels');
    learnLetters();
    expect(screen.getByRole('heading', {name: 'Learn Letters'})).toBeTruthy();
    expect(rowLetters()).toEqual(['ა', 'ე', 'ი', 'ო', 'უ']);

    // Back keeps the letters checked; Close drops them, as nothing was started.
    fireEvent.click(screen.getByRole('button', {name: 'Back to settings'}));
    expect(letterSet()).toBe('Vowels');
    learnLetters();
    fireEvent.click(screen.getByRole('button', {name: 'Exit to home'}));
    expect(screen.getByRole('heading', {name: 'Learn Georgian'})).toBeTruthy();
    openSettings();
    expect(letterSet()).toBe('All letters');

    chooseLetterSet('Vowels');
    learnLetters();
    fireEvent.click(screen.getByRole('button', {name: 'Start Training'}));
    expect(screen.getByRole('heading', {name: 'Question 1 of 5'})).toBeTruthy();
    expect(wheelLetters()).toEqual(['ა', 'ე', 'ი', 'ო', 'უ']);
  });

  it('reopens the settings with the letters of the last session', () => {
    startTraining('Vowels');
    fireEvent.click(screen.getByRole('button', {name: 'Exit training'}));
    openSettings();
    expect(letterSet()).toBe('Vowels');
  });

  it('starts a 33-question session with all letters in the carousel', () => {
    startTraining();
    expect(
      screen.getByRole('heading', {name: 'Question 1 of 33'}),
    ).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(33);
    expect(confirmButton().getAttribute('aria-disabled')).toBe('true');
  });

  it('selects a letter on tap and enables Confirm', () => {
    startTraining();
    const letter = option('ა');
    fireEvent.click(letter);
    expect(letter.getAttribute('aria-selected')).toBe('true');
    expect(confirmButton().getAttribute('aria-disabled')).toBe('false');
  });

  it('allows one retry after a wrong answer and scores both attempts', () => {
    startTraining();
    const wrong = wrongOption();
    fireEvent.click(wrong);
    fireEvent.click(confirmButton());

    expect(screen.getByRole('status').textContent).toMatch(/Not quite/);
    expect(score()).toBe('−1');
    expect(
      screen.getByRole('heading', {name: 'Question 1 of 33'}),
    ).toBeTruthy();
    expect(wrong.getAttribute('aria-disabled')).toBe('true');
    expect(confirmButton().getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(option(targetCharacter()));
    fireEvent.click(confirmButton());
    expect(screen.getByRole('status').textContent).toMatch(
      /Correct on the second try/,
    );
    expect(score()).toBe('0');

    wait(FEEDBACK_DELAY_MS);
    expect(
      screen.getByRole('heading', {name: 'Question 2 of 33'}),
    ).toBeTruthy();
  });

  it('reveals the correct letter after two wrong answers', () => {
    startTraining();
    const target = targetCharacter();
    fireEvent.click(wrongOption());
    fireEvent.click(confirmButton());
    fireEvent.click(wrongOption());
    fireEvent.click(confirmButton());

    expect(screen.getByRole('status').textContent).toContain(
      `The correct letter was ${target}`,
    );
    expect(option(target).textContent).toContain('correct answer');
    expect(score()).toBe('−2');

    wait(FAILED_FEEDBACK_DELAY_MS);
    expect(
      screen.getByRole('heading', {name: 'Question 2 of 33'}),
    ).toBeTruthy();
  });

  it('ignores rapid repeated taps on Confirm', () => {
    startTraining();
    fireEvent.click(option(targetCharacter()));
    fireEvent.click(confirmButton());
    fireEvent.click(confirmButton());
    fireEvent.click(confirmButton());

    expect(score()).toBe('+1');
    wait(FEEDBACK_DELAY_MS * 3);
    expect(
      screen.getByRole('heading', {name: 'Question 2 of 33'}),
    ).toBeTruthy();
  });

  it('plays every letter once, shows the results after the last one, then restarts or exits', () => {
    startTraining();
    const played = new Set<string>();
    for (let i = 0; i < 33; i++) {
      const target = targetCharacter();
      played.add(target);
      fireEvent.click(option(target));
      fireEvent.click(confirmButton());
      wait(FEEDBACK_DELAY_MS);
    }

    expect(played.size).toBe(33);
    expect(
      screen.getByRole('heading', {name: 'Training complete'}),
    ).toBeTruthy();
    expect(screen.getByText('+33')).toBeTruthy();
    expect(screen.getByText('100% accuracy')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', {name: 'Restart Training'}));
    expect(
      screen.getByRole('heading', {name: 'Question 1 of 33'}),
    ).toBeTruthy();
    expect(score()).toBe('0');

    fireEvent.click(screen.getByRole('button', {name: 'Exit training'}));
    expect(screen.getByRole('heading', {name: 'Learn Georgian'})).toBeTruthy();
  });

  it('exits during feedback without advancing later', () => {
    startTraining();
    fireEvent.click(option(targetCharacter()));
    fireEvent.click(confirmButton());
    fireEvent.click(screen.getByRole('button', {name: 'Exit training'}));
    wait(FAILED_FEEDBACK_DELAY_MS);
    expect(screen.getByRole('heading', {name: 'Learn Georgian'})).toBeTruthy();
  });

  it('supports choosing a letter with the keyboard', () => {
    startTraining();
    const listbox = screen.getByRole('listbox', {name: 'Georgian letters'});
    fireEvent.keyDown(listbox, {key: 'End'});
    expect(option('ჰ').getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(listbox, {key: 'ArrowUp'});
    expect(option('ჯ').getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(listbox, {key: 'Home'});
    expect(option('ა').getAttribute('aria-selected')).toBe('true');
  });
});
