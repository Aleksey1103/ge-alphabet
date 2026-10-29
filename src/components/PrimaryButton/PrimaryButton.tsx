import type {ButtonHTMLAttributes} from 'react';
import {cx} from '../../utils/classNames.ts';

/**
 * No `className`: callers pick a look with `variant` and `compact` (see
 * AGENTS.md on overrides).
 */
type PrimaryButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled' | 'className'
> & {
  /**
   * `error` is an outline in the error color, for actions inside an error
   * message.
   */
  variant?: 'primary' | 'secondary' | 'error';
  /** Fits the label at the minimum touch height, instead of filling the row. */
  compact?: boolean;
  /**
   * Uses `aria-disabled` instead of `disabled`, so the button keeps keyboard
   * focus when it becomes unavailable (e.g. right after Confirm is pressed).
   * Clicks are ignored while disabled.
   */
  disabled?: boolean;
};

const VARIANTS = {
  primary:
    'border-transparent bg-accent text-on-accent hover:not-aria-disabled:bg-accent-hover',
  secondary: 'border-line text-fg hover:not-aria-disabled:bg-surface-2',
  error: 'border-error text-fg hover:not-aria-disabled:bg-surface-2',
};

export default function PrimaryButton({
  variant = 'primary',
  compact = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-disabled={disabled}
      className={cx(
        `inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-6
        py-2`,
        `text-[1.0625rem] font-bold tracking-[0.01em]
        transition-[scale,background-color,opacity]
        duration-[150ms,250ms,250ms]`,
        `active:not-aria-disabled:scale-98 aria-disabled:cursor-not-allowed
        aria-disabled:opacity-45`,
        compact ? 'min-h-touch' : 'min-h-button w-full',
        VARIANTS[variant],
      )}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}
