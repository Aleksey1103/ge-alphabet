import {describe, expect, it} from 'vitest';
import {
  initialLetterPlayback,
  letterPlaybackReducer,
  letterSoundStatus,
  type LetterPlayback,
  type LetterPlaybackEvent,
} from './letterPlayback.ts';

function run(...events: LetterPlaybackEvent[]): LetterPlayback {
  return events.reduce(letterPlaybackReducer, initialLetterPlayback);
}

const request = (letterId: string) => ({type: 'request', letterId}) as const;
const playing = (letterId: string) => ({type: 'playing', letterId}) as const;
const stopped = (letterId: string) => ({type: 'stopped', letterId}) as const;
const failed = (letterId: string) => ({type: 'failed', letterId}) as const;

describe('letterPlaybackReducer', () => {
  it('starts with no letter sounding', () => {
    expect(letterSoundStatus(initialLetterPlayback, 'ani')).toBe('idle');
  });

  it('loads, plays and stops a letter', () => {
    const loading = run(request('ani'));
    expect(letterSoundStatus(loading, 'ani')).toBe('loading');

    const sounding = letterPlaybackReducer(loading, playing('ani'));
    expect(letterSoundStatus(sounding, 'ani')).toBe('playing');

    expect(letterPlaybackReducer(sounding, stopped('ani'))).toBeNull();
  });

  it('keeps a letter playing when it is replayed', () => {
    const state = run(request('ani'), playing('ani'));
    expect(letterPlaybackReducer(state, request('ani'))).toBe(state);
  });

  it('plays one letter at a time', () => {
    const state = run(request('ani'), playing('ani'), request('eni'));
    expect(letterSoundStatus(state, 'ani')).toBe('idle');
    expect(letterSoundStatus(state, 'eni')).toBe('loading');
  });

  it('ignores late events from a replaced letter', () => {
    const state = run(request('ani'), request('eni'), playing('eni'));
    expect(letterPlaybackReducer(state, stopped('ani'))).toBe(state);
    expect(letterPlaybackReducer(state, playing('ani'))).toBe(state);
    expect(letterPlaybackReducer(state, failed('ani'))).toBe(state);
  });

  it('ignores events when no letter is sounding', () => {
    expect(run(playing('ani'))).toBeNull();
    expect(run(failed('ani'))).toBeNull();
  });

  it('shows an error that stopping does not hide, until the letter is retried', () => {
    const state = run(request('ani'), failed('ani'));
    expect(letterSoundStatus(state, 'ani')).toBe('error');
    expect(letterPlaybackReducer(state, stopped('ani'))).toBe(state);

    const retried = letterPlaybackReducer(state, request('ani'));
    expect(letterSoundStatus(retried, 'ani')).toBe('loading');
  });

  it('clears an error when another letter is played', () => {
    const state = run(request('ani'), failed('ani'), request('eni'));
    expect(letterSoundStatus(state, 'ani')).toBe('idle');
    expect(letterSoundStatus(state, 'eni')).toBe('loading');
  });
});
