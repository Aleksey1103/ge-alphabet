import {useEffect, useRef} from 'react';
import {useMessages} from '../../hooks/useMessages.ts';
import type {
  LetterPlaybackEventType,
  LetterSoundStatus,
} from '../../state/letterPlayback.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import {cx} from '../../utils/classNames.ts';
import SpeakerIcon from '../SpeakerIcon/index.ts';

const CIRCLE_CLASSES = cx(
  `relative grid size-touch shrink-0 place-items-center rounded-full
  transition-[scale,opacity] duration-150 group-active:scale-95`,
  // Two rings that pulse outwards while the sound plays.
  `before:pointer-events-none before:absolute before:inset-0 before:rounded-full
  before:border-2 before:border-accent before:opacity-0`,
  `after:pointer-events-none after:absolute after:inset-0 after:rounded-full
  after:border-2 after:border-accent after:opacity-0`,
);

const STATUS_CLASSES: Record<LetterSoundStatus, string> = {
  idle: 'bg-accent-soft text-accent',
  // Dims only if loading takes a moment, so a buffered clip doesn't flicker.
  loading: 'bg-accent-soft text-accent opacity-60 delay-200',
  // Without the pulse, a steady ring still shows that the sound is playing.
  playing: `bg-accent text-on-accent before:animate-ring-pulse
    after:animate-ring-pulse-late motion-reduce:outline-4
    motion-reduce:outline-offset-4 motion-reduce:outline-success`,
  error: 'border-2 border-error bg-error-soft text-fg',
};

type LetterSoundButtonProps = {
  letter: GeorgianLetter;
  /** This letter's sound, from the screen's `letterPlaybackReducer`. */
  status: LetterSoundStatus;
  /** Reports what happens to this letter's sound. */
  onPlaybackEvent: (type: LetterPlaybackEventType) => void;
};

/**
 * A round button that plays one letter's recording at normal speed. It's
 * `relative` so its `sr-only` label stays inside a scrolling table instead of
 * stretching the page. It owns
 * its `<audio>`, so every event it reports belongs to its letter, and it falls
 * silent when its status goes back to `idle` (another letter started).
 */
export default function LetterSoundButton({
  letter,
  status,
  onPlaybackEvent,
}: LetterSoundButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = useMessages();

  useEffect(() => {
    if (status === 'idle') audioRef.current?.pause();
  }, [status]);

  // Stop the sound when the screen closes.
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  if (letter.audioSrc === null) {
    return (
      <button
        type="button"
        disabled
        className="relative inline-flex items-center gap-tight rounded-full
          text-muted"
      >
        <span className="text-sm" aria-hidden="true">
          {t.learning.noSound}
        </span>
        <span className={cx(CIRCLE_CLASSES, 'bg-surface-2')}>
          <SpeakerIcon size={22} muted />
        </span>
        <span className="sr-only">
          {t.learning.noSoundFor.before}
          <span lang="ka">{letter.character}</span>
          {t.learning.noSoundFor.after}
        </span>
      </button>
    );
  }

  // play() is called right in the click, which iOS needs to allow sound.
  async function play() {
    const audio = audioRef.current;
    if (!audio) return;
    onPlaybackEvent('request');
    // After a failed load, fetch the file again. A blocked play only lacked a user gesture.
    if (audio.error) audio.load();
    try {
      if (audio.currentTime > 0) audio.currentTime = 0;
      await audio.play();
      if (!audio.paused) onPlaybackEvent('playing');
    } catch (playError) {
      // A pause (another letter started) or a reload interrupted this play() call.
      if (playError instanceof DOMException && playError.name === 'AbortError')
        return;
      onPlaybackEvent('failed');
    }
  }

  return (
    <button
      type="button"
      className="group relative rounded-full"
      onClick={() => void play()}
    >
      <audio
        ref={audioRef}
        src={letter.audioSrc}
        preload="auto"
        onPlaying={() => onPlaybackEvent('playing')}
        onPause={() => onPlaybackEvent('stopped')}
        onEnded={() => onPlaybackEvent('stopped')}
        onError={() => onPlaybackEvent('failed')}
      />
      <span className={cx(CIRCLE_CLASSES, STATUS_CLASSES[status])}>
        <SpeakerIcon size={22} />
      </span>
      <span className="sr-only">
        {t.learning.play.before}
        <span lang="ka">{letter.character}</span>
        {t.learning.play.after}
      </span>
    </button>
  );
}
