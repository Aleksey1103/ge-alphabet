import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import AudioPlayer from './AudioPlayer.tsx';

/** Renders a player for a recording and returns its `<audio>` element. */
function renderPlayer(src = '/audio/ა.mp3'): HTMLAudioElement {
  const {container} = render(<AudioPlayer src={src} />);
  const audio = container.querySelector('audio');
  if (!audio) throw new Error('no <audio> element');
  return audio;
}

/**
 * Lets the pending play() promise settle inside act, so its state updates are
 * applied.
 */
async function settlePlay() {
  await act(async () => {});
}

/** Checks that neither button shows Loading…, which would be part of its name. */
function expectNotLoading() {
  screen.getByRole('button', {name: 'Play sound'});
  screen.getByRole('button', {name: 'Slow (half speed)'});
}

describe('AudioPlayer', () => {
  it('explains when a letter has no recording', () => {
    render(<AudioPlayer src={null} />);
    expect(screen.getByRole('alert').textContent).toMatch(
      /recording for this letter is missing/i,
    );
    expect(screen.getByRole('button', {name: 'No sound'})).toHaveProperty(
      'disabled',
      true,
    );
    expect(
      screen.getByRole('button', {name: 'Slow (half speed)'}),
    ).toHaveProperty('disabled', true);
  });

  it('plays the recording and shows Loading… only until it starts', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    const audio = renderPlayer();
    expect(audio.getAttribute('src')).toBe('/audio/ა.mp3');
    expectNotLoading();

    fireEvent.click(screen.getByRole('button', {name: 'Play sound'}));
    expect(play).toHaveBeenCalledTimes(1);
    screen.getByRole('button', {name: 'Play sound Loading…'});

    fireEvent.playing(audio);
    expectNotLoading();

    fireEvent.ended(audio);
    await settlePlay();
    screen.getByRole('button', {name: 'Play sound'});
  });

  it('plays the recording at half speed from the Slow button', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    const audio = renderPlayer();

    fireEvent.click(screen.getByRole('button', {name: 'Slow (half speed)'}));
    expect(audio.playbackRate).toBe(0.5);
    expect(play).toHaveBeenCalledTimes(1);

    // Only the slow button shows that it's loading.
    screen.getByRole('button', {name: 'Slow (half speed) Loading…'});
    screen.getByRole('button', {name: 'Play sound'});

    // The main button plays at normal speed again.
    fireEvent.playing(audio);
    fireEvent.ended(audio);
    fireEvent.click(await screen.findByRole('button', {name: 'Play sound'}));
    expect(audio.playbackRate).toBe(1);
    expect(play).toHaveBeenCalledTimes(2);
    await settlePlay();
  });

  it("doesn't show Loading… when the sound is replayed while playing", async () => {
    const audio = renderPlayer();
    fireEvent.click(screen.getByRole('button', {name: 'Play sound'}));
    fireEvent.playing(audio);
    Object.defineProperty(audio, 'paused', {
      configurable: true,
      value: false,
    });

    fireEvent.click(screen.getByRole('button', {name: 'Play sound'}));
    await settlePlay();
    expectNotLoading();
  });

  it('shows a message and a retry button when the file fails to load', async () => {
    const audio = renderPlayer();
    fireEvent.error(audio);
    expect(screen.getByRole('alert').textContent).toMatch(
      /couldn't be loaded/i,
    );

    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
    expect(load).toHaveBeenCalledTimes(1);
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.playing(audio);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('retries at the speed that failed, even though reloading resets the rate', async () => {
    const audio = renderPlayer();
    fireEvent.click(screen.getByRole('button', {name: 'Slow (half speed)'}));
    fireEvent.error(audio);
    fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
    expect(audio.playbackRate).toBe(0.5);
    await settlePlay();
  });

  it('reloads the file when Play is pressed after a load error', async () => {
    fireEvent.error(renderPlayer());
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    fireEvent.click(screen.getByRole('button', {name: 'Play sound'}));
    expect(load).toHaveBeenCalledTimes(1);
    await settlePlay();
  });

  it('keeps an error visible when the audio pauses or ends', () => {
    const audio = renderPlayer();
    fireEvent.error(audio);
    fireEvent.pause(audio);
    fireEvent.ended(audio);
    expect(screen.getByRole('alert').textContent).toMatch(
      /couldn't be loaded/i,
    );
  });

  it('explains a blocked play and retries it without downloading the file again', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValueOnce(
        new DOMException('Playback needs a user gesture', 'NotAllowedError'),
      );
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load');
    renderPlayer();
    fireEvent.click(screen.getByRole('button', {name: 'Play sound'}));

    expect((await screen.findByRole('alert')).textContent).toMatch(
      /browser blocked the sound/i,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Try again'}));
    expect(play).toHaveBeenCalledTimes(2);
    expect(load).not.toHaveBeenCalled();
    await settlePlay();
  });

  it('treats any other playback failure as a loading problem', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(
      new DOMException('No supported source', 'NotSupportedError'),
    );
    renderPlayer();
    fireEvent.click(screen.getByRole('button', {name: 'Play sound'}));
    expect((await screen.findByRole('alert')).textContent).toMatch(
      /couldn't be loaded/i,
    );
  });

  it('disables both play buttons while disabled', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    render(<AudioPlayer src="/audio/ა.mp3" disabled />);
    const normal = screen.getByRole('button', {name: 'Play sound'});
    const slow = screen.getByRole('button', {name: 'Slow (half speed)'});
    expect(normal).toHaveProperty('disabled', true);
    expect(slow).toHaveProperty('disabled', true);

    fireEvent.click(normal);
    fireEvent.click(slow);
    expect(play).not.toHaveBeenCalled();
  });

  it('disables Try again while disabled', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play');
    const {container, rerender} = render(<AudioPlayer src="/audio/ა.mp3" />);
    const audio = container.querySelector('audio');
    if (!audio) throw new Error('no <audio> element');
    fireEvent.error(audio);

    rerender(<AudioPlayer src="/audio/ა.mp3" disabled />);
    const retry = screen.getByRole('button', {name: 'Try again'});
    expect(retry.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(retry);
    expect(play).not.toHaveBeenCalled();
  });

  it('stops the sound when it unmounts', () => {
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause');
    const {unmount} = render(<AudioPlayer src="/audio/ა.mp3" />);
    unmount();
    expect(pause).toHaveBeenCalled();
  });
});
