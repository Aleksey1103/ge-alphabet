/**
 * Which letter's sound is active on the learning screen. Only one letter sounds
 * at a time: asking for another letter replaces the current one.
 *
 * - `loading`: asked to play, not started yet
 * - `playing`: the sound is playing
 * - `error`: the sound couldn't be loaded or played; asking again retries it
 */
export type LetterSoundStatus = 'idle' | 'loading' | 'playing' | 'error';

export type LetterPlayback = {
  letterId: string;
  status: Exclude<LetterSoundStatus, 'idle'>;
} | null;

export type LetterPlaybackEventType =
  'request' | 'playing' | 'stopped' | 'failed';

export type LetterPlaybackEvent = {
  type: LetterPlaybackEventType;
  letterId: string;
};

export const initialLetterPlayback: LetterPlayback = null;

// Only a request can change which letter is current. The other events come from a letter's
// recording, and one that arrives late from a replaced letter (its pause, or its play() settling)
// is ignored.
export function letterPlaybackReducer(
  state: LetterPlayback,
  event: LetterPlaybackEvent,
): LetterPlayback {
  const current = state !== null && state.letterId === event.letterId;
  if (event.type === 'request') {
    // Replaying the letter that's playing restarts it, so it stays playing.
    if (current && state.status === 'playing') return state;
    return {letterId: event.letterId, status: 'loading'};
  }
  if (!current) return state;

  switch (event.type) {
    case 'playing':
      return state.status === 'playing' ? state : {...state, status: 'playing'};
    case 'stopped':
      // Stopping must not hide an error message.
      return state.status === 'error' ? state : null;
    case 'failed':
      return state.status === 'error' ? state : {...state, status: 'error'};
  }
}

export function letterSoundStatus(
  state: LetterPlayback,
  letterId: string,
): LetterSoundStatus {
  return state?.letterId === letterId ? state.status : 'idle';
}
