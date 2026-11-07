import {useEffect, useRef, useState} from 'react';
import {useMessages} from '../../hooks/useMessages.ts';
import type {Messages} from '../../i18n/messages.ts';
import {cx} from '../../utils/classNames.ts';
import PrimaryButton from '../PrimaryButton/index.ts';
import SpeakerIcon from '../SpeakerIcon/index.ts';

type PlayerState = 'ready' | 'loading' | 'playing' | 'load-error' | 'blocked';

/**
 * Playback rates: normal, and half speed for listening closely. Browsers keep
 * the pitch by default.
 */
type PlaybackSpeed = 1 | 0.5;
const NORMAL_SPEED: PlaybackSpeed = 1;
const SLOW_SPEED: PlaybackSpeed = 0.5;

function errorText(
  state: PlayerState,
  missing: boolean,
  t: Messages,
): string | null {
  if (missing) return t.audio.missing;
  if (state === 'load-error') return t.audio.loadError;
  if (state === 'blocked') return t.audio.blocked;
  return null;
}

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
 * hidden, it still keeps its height so the buttons don't shift. It has no
 * width of its own and spills evenly around the button's center, so a long
 * translation (such as «Загрузка…») can't widen the slow button past its
 * column.
 */
function loadingLabel(activity: Activity | null, text: string) {
  const loading = activity === 'loading';
  return (
    <span
      className={cx(
        'flex w-0 justify-center font-semibold whitespace-nowrap text-muted',
        !loading && 'invisible',
      )}
      aria-hidden={loading ? undefined : true}
    >
      {text}
    </span>
  );
}

type AudioPlayerProps = {
  /** URL of the recording, or `null` if it's missing. */
  src: string | null;
  /** Turns off every button that plays the sound, such as while feedback shows. */
  disabled?: boolean;
};

/**
 * Plays one recording. Render it with a `key` per exercise: remounting discards
 * the old `<audio>` element, so a late event from the previous sound can't
 * affect the new exercise.
 */
export default function AudioPlayer({src, disabled = false}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [state, setState] = useState<PlayerState>('ready');
  const t = useMessages();
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
  const errorMessage = errorText(state, missing, t);

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
          disabled={missing || disabled}
          onClick={() => void play(NORMAL_SPEED)}
        >
          <span
            className={circleClasses(
              normalActivity,
              'size-(--play-size) bg-accent text-on-accent shadow-glow',
            )}
            aria-hidden="true"
          >
            <SpeakerIcon size={36} />
          </span>
          <span className="sr-only">
            {missing ? t.audio.noSound : t.audio.play}
          </span>{' '}
          {loadingLabel(normalActivity, t.audio.loading)}
        </button>
        <button
          type="button"
          className={cx(BUTTON_CLASSES, 'justify-self-start')}
          disabled={missing || disabled}
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
          <span className="sr-only">{t.audio.slow}</span>{' '}
          {loadingLabel(slowActivity, t.audio.loading)}
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
              disabled={disabled}
              onClick={() => void play(speed)}
            >
              {t.audio.tryAgain}
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}
