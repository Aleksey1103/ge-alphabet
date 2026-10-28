import {useEffect, useRef, useState} from 'react';
import {cx} from '../utils/classNames.ts';
import PrimaryButton from './PrimaryButton.tsx';

type PlayerState = 'ready' | 'loading' | 'playing' | 'load-error' | 'blocked';

/**
 * Playback rates: normal, and half speed for listening closely. Browsers keep
 * the pitch by default.
 */
type PlaybackSpeed = 1 | 0.5;
const NORMAL_SPEED: PlaybackSpeed = 1;
const SLOW_SPEED: PlaybackSpeed = 0.5;

const ERROR_MESSAGES: Partial<Record<PlayerState, string>> = {
  'load-error':
    "The sound couldn't be loaded. Check your connection and try again.",
  blocked: 'Your browser blocked the sound. Tap “Try again” to play it.',
};
const MISSING_MESSAGE =
  "The recording for this letter is missing, so this exercise can't be played.";

type Activity = 'playing' | 'loading';

const BUTTON_CLASSES =
  'group flex flex-col items-center gap-tight rounded-2xl p-1 disabled:opacity-50';

function circleClasses(activity: Activity | null, sizeAndLook: string) {
  return cx(
    'relative grid place-items-center rounded-full transition-transform duration-150 group-active:scale-95',
    // Two rings that pulse outwards while the sound plays.
    'before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:border-2 before:border-accent before:opacity-0',
    'after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:border-2 after:border-accent after:opacity-0',
    sizeAndLook,
    activity === 'loading' && 'opacity-75',
    activity === 'playing' &&
      // Without the pulse, a steady ring still shows that the sound is playing.
      'before:animate-ring-pulse after:animate-ring-pulse-late motion-reduce:outline-4 motion-reduce:outline-offset-4 motion-reduce:outline-success',
  );
}

/**
 * The only visible text under a button, shown while its sound loads. When
 * hidden, it still keeps its space so the buttons don't shift.
 */
function loadingLabel(activity: Activity | null) {
  const loading = activity === 'loading';
  return (
    <span
      className={cx('font-semibold text-muted', !loading && 'invisible')}
      aria-hidden={loading ? undefined : true}
    >
      Loading…
    </span>
  );
}

type AudioPlayerProps = {
  /** URL of the recording, or `null` if it's missing. */
  src: string | null;
};

/**
 * Plays one recording. Render it with a `key` per exercise: remounting discards
 * the old `<audio>` element, so a late event from the previous sound can't
 * affect the new exercise.
 */
export default function AudioPlayer({src}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<PlayerState>('ready');
  /**
   * The speed of the current (or last requested) playback, which Try again
   * reuses.
   */
  const [speed, setSpeed] = useState<PlaybackSpeed>(NORMAL_SPEED);

  // Stop the sound when the exercise changes or the screen closes.
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  async function play(playbackSpeed: PlaybackSpeed) {
    const audio = audioRef.current;
    if (!audio) return;
    setSpeed(playbackSpeed);
    // After a failed load, fetch the file again (whichever button was pressed). A blocked play
    // only lacked a user gesture, so the loaded file is reused.
    if (state === 'load-error') audio.load();
    // Show loading only when starting from a stop with too little data to play right away; a
    // buffered clip goes straight to 'playing'. Replaying a sound that's already playing fires no
    // new 'playing' event, so playback is confirmed once play() resolves (unless the short clip
    // has already ended by then).
    if (audio.paused && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA)
      setState('loading');
    // Set after load(), which resets the rate to normal.
    audio.playbackRate = playbackSpeed;
    try {
      if (audio.currentTime > 0) audio.currentTime = 0;
      await audio.play();
      if (!audio.paused) setState('playing');
    } catch (playError) {
      // A newer load() or pause() interrupted this play() call; that one decides the state.
      if (playError instanceof DOMException && playError.name === 'AbortError')
        return;
      const blocked =
        playError instanceof DOMException &&
        playError.name === 'NotAllowedError';
      setState(blocked ? 'blocked' : 'load-error');
    }
  }

  // Stopping only matters while a sound is active; it must not hide an error message.
  const stop = () =>
    setState((current) =>
      current === 'playing' || current === 'loading' ? 'ready' : current,
    );

  const missing = src === null;
  const errorMessage = missing ? MISSING_MESSAGE : ERROR_MESSAGES[state];

  // Each button shows progress only for the speed it plays.
  const activityOf = (target: PlaybackSpeed) =>
    speed === target && (state === 'playing' || state === 'loading')
      ? state
      : null;
  const normalActivity = activityOf(NORMAL_SPEED);
  const slowActivity = activityOf(SLOW_SPEED);

  return (
    <div
      className="flex w-full flex-col items-center gap-tight
        [--play-size:clamp(60px,12dvh,112px)]
        [--slow-size:max(var(--spacing-touch),calc(var(--play-size)*0.55))]"
    >
      {!missing && (
        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          onPlaying={() => setState('playing')}
          onPause={stop}
          onEnded={stop}
          onError={() => setState('load-error')}
        />
      )}
      {/*
       * The main button stays centered; the slow button sits to its right, level with it.
       * minmax(0, …) keeps the side columns equal even though the slow button's label is wide.
       */}
      <div
        className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
          items-center gap-gutter"
      >
        <button
          type="button"
          className={cx(BUTTON_CLASSES, 'col-start-2')}
          disabled={missing}
          onClick={() => void play(NORMAL_SPEED)}
        >
          <span
            className={circleClasses(
              normalActivity,
              'size-(--play-size) bg-accent text-on-accent shadow-glow',
            )}
            aria-hidden="true"
          >
            {playIcon}
          </span>
          <span className="sr-only">{missing ? 'No sound' : 'Play sound'}</span>{' '}
          {loadingLabel(normalActivity)}
        </button>
        <button
          type="button"
          className={cx(BUTTON_CLASSES, 'justify-self-start')}
          disabled={missing}
          onClick={() => void play(SLOW_SPEED)}
        >
          <span
            className={circleClasses(
              slowActivity,
              `size-(--slow-size) border-2 border-accent bg-surface-2
              text-[length:calc(var(--slow-size)*0.3)] font-extrabold text-fg
              tabular-nums`,
            )}
            aria-hidden="true"
          >
            {SLOW_SPEED}×
          </span>
          <span className="sr-only">Slow (half speed)</span>{' '}
          {loadingLabel(slowActivity)}
        </button>
      </div>
      {errorMessage && (
        <div
          className="flex w-full flex-col items-center gap-tight rounded-xl
            bg-error-soft p-gutter text-center text-[0.9375rem]"
          role="alert"
        >
          <p>{errorMessage}</p>
          {!missing && (
            <PrimaryButton
              variant="error"
              compact
              onClick={() => void play(speed)}
            >
              Try again
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}

const playIcon = (
  <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
    <path d="M3 9.5v5a1 1 0 0 0 1 1h3l4.3 3.6a1 1 0 0 0 1.7-.8V5.7a1 1 0 0 0-1.7-.8L7 8.5H4a1 1 0 0 0-1 1Z" />
    <path
      d="M16 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
