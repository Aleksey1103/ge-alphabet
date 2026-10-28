import type {HTMLAttributes} from 'react';
import {cx} from '../utils/classNames.ts';

type ProgressBarProps = {
  value: number;
  max: number;
  tone?: 'accent' | 'success';
  /**
   * With a label the bar is exposed as a progressbar; without one it's
   * decorative.
   */
  label?: string;
  /**
   * The track's height and background, which depend on what the bar sits on,
   * plus any layout.
   */
  className: string;
};

const TONES = {
  accent: 'bg-accent',
  success: 'bg-success',
};

export default function ProgressBar({
  value,
  max,
  tone = 'accent',
  label,
  className,
}: ProgressBarProps) {
  const fraction = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const a11yProps: HTMLAttributes<HTMLDivElement> = label
    ? {
        role: 'progressbar',
        'aria-label': label,
        'aria-valuemin': 0,
        'aria-valuemax': max,
        'aria-valuenow': value,
      }
    : {'aria-hidden': true};

  return (
    <div
      className={cx('overflow-hidden rounded-full', className)}
      {...a11yProps}
    >
      <div
        className={cx(
          'size-full origin-left rounded-[inherit] transition-transform',
          TONES[tone],
        )}
        style={{transform: `scaleX(${fraction})`}}
      />
    </div>
  );
}
