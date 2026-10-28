import type {GeorgianLetter} from '../types/alphabet.ts';
import type {Feedback} from '../types/training.ts';
import {cx} from '../utils/classNames.ts';
import {
  formatScore,
  POINTS_FOR_CORRECT,
  POINTS_FOR_INCORRECT,
} from '../utils/scoring.ts';

type FeedbackMessageProps = {
  feedback: Feedback | null;
  /** The answer to reveal when an exercise is failed. */
  correctLetter: GeorgianLetter | null;
  /** Shown in place of the message while there's no feedback. */
  prompt: string;
};

/**
 * The prompt, the message and invisible copies of every possible message share
 * one grid cell, so the slot is always as tall as the longest message and
 * showing feedback doesn't shift the layout.
 *
 * The live region stays mounted while the message inside changes, so screen
 * readers announce each new message.
 */
export default function FeedbackMessage({
  feedback,
  correctLetter,
  prompt,
}: FeedbackMessageProps) {
  return (
    <div className="grid w-full place-items-center *:col-start-1 *:row-start-1">
      {ALL_FEEDBACK.map((reserved, index) => (
        <p
          key={index}
          className={cx(MESSAGE_CLASSES, toneOf(reserved).message, 'invisible')}
          aria-hidden="true"
        >
          {messageContent(reserved, correctLetter)}
        </p>
      ))}
      {!feedback && (
        <p className="text-center font-semibold text-muted">{prompt}</p>
      )}
      <div role="status" aria-live="polite" aria-atomic="true">
        {feedback && (
          <p
            key={feedback.kind}
            className={cx(
              MESSAGE_CLASSES,
              toneOf(feedback).message,
              'animate-appear',
            )}
          >
            {messageContent(feedback, correctLetter)}
          </p>
        )}
      </div>
    </div>
  );
}

const MESSAGE_CLASSES =
  'flex items-center gap-2.5 rounded-xl border px-4 py-2.5 font-semibold';

/** Every message the slot reserves space for. */
const ALL_FEEDBACK: readonly Feedback[] = [
  {kind: 'correct', attempt: 1},
  {kind: 'correct', attempt: 2},
  {kind: 'retry'},
  {kind: 'failed'},
];

const TONES = {
  success: {
    message: 'border-success-line bg-success-soft',
    icon: 'bg-success',
  },
  error: {message: 'border-error-line bg-error-soft', icon: 'bg-error'},
};

function toneOf(feedback: Feedback) {
  return feedback.kind === 'correct' ? TONES.success : TONES.error;
}

function messageContent(
  feedback: Feedback,
  correctLetter: GeorgianLetter | null,
) {
  return (
    <>
      <span
        className={cx(
          `grid size-6 flex-none place-items-center rounded-full text-sm
          font-extrabold text-page`,
          toneOf(feedback).icon,
        )}
        aria-hidden="true"
      >
        {feedback.kind === 'correct' ? '✓' : '✕'}
      </span>
      <span>{messageText(feedback, correctLetter)}</span>
    </>
  );
}

const GAINED = `${formatScore(POINTS_FOR_CORRECT)} point`;
const LOST = `${formatScore(POINTS_FOR_INCORRECT)} point`;

function messageText(feedback: Feedback, correctLetter: GeorgianLetter | null) {
  switch (feedback.kind) {
    case 'correct':
      return feedback.attempt === 1
        ? `Correct! ${GAINED}`
        : `Correct on the second try! ${GAINED}`;
    case 'retry':
      return `Not quite! ${LOST}. Try once more.`;
    case 'failed':
      return (
        <>
          Incorrect, {LOST}. The correct letter was{' '}
          <span
            lang="ka"
            className="align-[-0.1em] text-[1.375em] leading-none"
          >
            {correctLetter?.character}
          </span>
        </>
      );
  }
}
