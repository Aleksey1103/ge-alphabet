import {act, fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {getLetterById} from '../../data/georgianAlphabet.ts';
import {lettersFromIds, presetLetterIds} from '../../state/letterSelection.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import LearningScreen from './LearningScreen.tsx';

const VOWELS = lettersFromIds(presetLetterIds('vowels'));

function renderLearning(letters: readonly GeorgianLetter[] = VOWELS) {
  const onBack = vi.fn();
  const onClose = vi.fn();
  const onStart = vi.fn();
  render(
    <LearningScreen
      letters={letters}
      onBack={onBack}
      onClose={onClose}
      onStart={onStart}
    />,
  );
  return {onBack, onClose, onStart};
}

function playButton(character: string): HTMLElement {
  return screen.getByRole('button', {name: `Play ${character}`});
}

function audioOf(character: string): HTMLAudioElement {
  const audio = playButton(character).querySelector('audio');
  if (!audio) throw new Error(`no <audio> for ${character}`);
  return audio;
}

/** Lets a pending play() promise settle inside act. */
async function settlePlay() {
  await act(async () => {});
}

describe('LearningScreen', () => {
  it('lists exactly its letters, in order, each with a play button', () => {
    renderLearning();
    const letters = screen
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent);
    expect(letters).toEqual(['ა', 'ე', 'ი', 'ო', 'უ']);
    for (const character of letters) {
      expect(playButton(character ?? '')).toBeTruthy();
    }
  });

  it("plays the tapped letter's own recording", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    renderLearning();
    fireEvent.click(playButton('ე'));

    expect(play).toHaveBeenCalledOnce();
    expect(play.mock.contexts[0]).toBe(audioOf('ე'));
    expect(decodeURIComponent(audioOf('ე').getAttribute('src') ?? '')).toMatch(
      /ე\.mp3$/,
    );
    await settlePlay();
  });

  it('plays one letter at a time', async () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    renderLearning();
    fireEvent.click(playButton('ა'));
    fireEvent.playing(audioOf('ა'));
    await settlePlay();
    pause.mockClear();

    fireEvent.click(playButton('ე'));
    expect(pause.mock.contexts).toEqual([audioOf('ა')]);
    // The first letter's late pause event doesn't stop the new one.
    fireEvent.pause(audioOf('ა'));
    await settlePlay();
  });

  it('explains a sound that fails to load, and reloads it on the next tap', async () => {
    renderLearning();
    const audio = audioOf('ი');
    fireEvent.click(playButton('ი'));
    await settlePlay();
    Object.defineProperty(audio, 'error', {
      configurable: true,
      value: {code: 4},
    });
    fireEvent.error(audio);
    expect(screen.getByRole('alert').textContent).toBe(
      "The sound for ი couldn't be played. Tap it to try again.",
    );

    // Stopping doesn't hide the message.
    fireEvent.pause(audio);
    expect(screen.getByRole('alert')).toBeTruthy();

    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    fireEvent.click(playButton('ი'));
    expect(load).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).toBeNull();
    await settlePlay();
  });

  it('explains a blocked sound and retries it without reloading', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValueOnce(
        new DOMException('Playback needs a user gesture', 'NotAllowedError'),
      );
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    renderLearning();
    fireEvent.click(playButton('ო'));
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /sound for ო couldn't be played/,
    );

    fireEvent.click(playButton('ო'));
    expect(play).toHaveBeenCalledTimes(2);
    expect(load).not.toHaveBeenCalled();
    await settlePlay();
  });

  it('ignores a play interrupted by another letter', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValueOnce(
      new DOMException('Interrupted by pause()', 'AbortError'),
    );
    renderLearning();
    fireEvent.click(playButton('ა'));
    fireEvent.click(playButton('ე'));
    await settlePlay();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('disables the button of a letter without a recording', () => {
    const ani = getLetterById('ani');
    const bani = getLetterById('bani');
    if (!ani || !bani) throw new Error('missing letter data');
    renderLearning([{...ani, audioSrc: null}, bani]);

    const missing = screen.getByRole('button', {name: 'No sound for ა'});
    expect(missing).toHaveProperty('disabled', true);
    expect(missing.querySelector('audio')).toBeNull();
    expect(missing.textContent).toContain('No sound');
    expect(playButton('ბ')).toHaveProperty('disabled', false);
  });

  it('goes back to the settings, closes, or starts training', () => {
    const {onBack, onClose, onStart} = renderLearning();
    fireEvent.click(screen.getByRole('button', {name: 'Back to settings'}));
    expect(onBack).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', {name: 'Exit to home'}));
    expect(onClose).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', {name: 'Start Training'}));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('stops the sound when it closes', () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    const {unmount} = render(
      <LearningScreen
        letters={VOWELS}
        onBack={() => {}}
        onClose={() => {}}
        onStart={() => {}}
      />,
    );
    pause.mockClear();
    unmount();
    expect(pause).toHaveBeenCalledTimes(VOWELS.length);
  });
});
