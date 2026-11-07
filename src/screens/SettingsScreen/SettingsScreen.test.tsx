import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {GEORGIAN_ALPHABET} from '../../data/georgianAlphabet.ts';
import {presetLetterIds} from '../../state/letterSelection.ts';
import SettingsScreen from './SettingsScreen.tsx';

function renderSettings(initialLetterIds = presetLetterIds('all')) {
  const onStart = vi.fn();
  const onLearn = vi.fn();
  const onBack = vi.fn();
  render(
    <SettingsScreen
      letters={GEORGIAN_ALPHABET}
      initialLetterIds={initialLetterIds}
      onStart={onStart}
      onLearn={onLearn}
      onBack={onBack}
    />,
  );
  return {onStart, onLearn, onBack};
}

function select(): HTMLSelectElement {
  return screen.getByRole('combobox', {name: 'Letter set'});
}

function choose(presetId: string) {
  fireEvent.change(select(), {target: {value: presetId}});
}

function tile(character: string): HTMLElement {
  return screen.getByRole('button', {name: character});
}

function checkedLetters(): string {
  return screen
    .getAllByRole('button', {pressed: true})
    .map((element) => element.textContent?.replace('✓', ''))
    .join(' ');
}

function startButton(): HTMLElement {
  return screen.getByRole('button', {name: 'Start Training'});
}

function learnButton(): HTMLElement {
  return screen.getByRole('button', {name: 'Learn Letters'});
}

describe('SettingsScreen', () => {
  it('opens with the given letters checked and their preset selected', () => {
    renderSettings();
    expect(select().value).toBe('all');
    expect(screen.getAllByRole('button', {pressed: true})).toHaveLength(33);
    expect(screen.getByRole('status').textContent).toBe('33 letters selected');
  });

  it('checks exactly the letters of the chosen preset', () => {
    renderSettings();
    choose('vowels');
    expect(checkedLetters()).toBe('ა ე ი ო უ');
    choose('triplets-k');
    expect(checkedLetters()).toBe('კ ქ ყ');
  });

  it('unchecks every letter when Custom is chosen', () => {
    renderSettings();
    choose('custom');
    expect(screen.queryAllByRole('button', {pressed: true})).toHaveLength(0);
    expect(screen.getByRole('status').textContent).toBe('0 letters selected');
  });

  it('toggles one letter at a time and shows the matching preset or Custom', () => {
    renderSettings(presetLetterIds('vowels'));
    fireEvent.click(tile('უ'));
    expect(select().value).toBe('custom');
    expect(checkedLetters()).toBe('ა ე ი ო');

    fireEvent.click(tile('უ'));
    expect(select().value).toBe('vowels');
    expect(checkedLetters()).toBe('ა ე ი ო უ');
  });

  it('switches to a preset once the checked letters match it', () => {
    renderSettings(presetLetterIds('custom'));
    fireEvent.click(tile('პ'));
    expect(select().value).toBe('custom');
    fireEvent.click(tile('ფ'));
    expect(select().value).toBe('twins-p');
  });

  it('keeps Start and Learn disabled, with a hint, until 2 letters are checked', () => {
    const {onStart, onLearn} = renderSettings(presetLetterIds('custom'));
    expect(startButton().getAttribute('aria-disabled')).toBe('true');
    expect(learnButton().getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(tile('ა'));
    expect(screen.getByRole('status').textContent).toBe('1 letter selected');
    expect(startButton().getAttribute('aria-disabled')).toBe('true');
    expect(learnButton().getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText('Choose at least 2 letters')).toBeTruthy();
    fireEvent.click(startButton());
    fireEvent.click(learnButton());
    expect(onStart).not.toHaveBeenCalled();
    expect(onLearn).not.toHaveBeenCalled();

    fireEvent.click(tile('ბ'));
    expect(startButton().getAttribute('aria-disabled')).toBe('false');
    expect(learnButton().getAttribute('aria-disabled')).toBe('false');
    expect(screen.queryByText('Choose at least 2 letters')).toBeNull();
  });

  it('starts with the checked letters', () => {
    const {onStart} = renderSettings();
    choose('twins-t');
    fireEvent.click(tile('ა'));
    fireEvent.click(startButton());
    expect(onStart).toHaveBeenCalledExactlyOnceWith(['ani', 'tani', "t'ari"]);
  });

  it('opens the learning screen with the checked letters, without starting', () => {
    const {onStart, onLearn} = renderSettings();
    choose('vowels');
    fireEvent.click(tile('ა'));
    fireEvent.click(learnButton());
    expect(onLearn).toHaveBeenCalledExactlyOnceWith([
      'eni',
      'ini',
      'oni',
      'uni',
    ]);
    expect(onStart).not.toHaveBeenCalled();
  });

  it('goes back without starting', () => {
    const {onStart, onBack} = renderSettings();
    fireEvent.click(screen.getByRole('button', {name: 'Back to home'}));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onStart).not.toHaveBeenCalled();
  });
});
