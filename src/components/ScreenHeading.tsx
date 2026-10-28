import {useEffect, useRef, type ReactNode} from 'react';
import {cx} from '../utils/classNames.ts';

type ScreenHeadingProps = {
  children: ReactNode;
  /** Sizing and spacing. The heading is already bold. */
  className?: string;
  /**
   * Focus moves to the heading when the screen opens and again whenever this
   * changes.
   */
  focusKey?: string | number;
};

/**
 * The screen's `<h1>`. Taking focus on screen changes makes screen readers
 * announce the new screen.
 */
export default function ScreenHeading({
  children,
  className,
  focusKey,
}: ScreenHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, [focusKey]);

  return (
    // Focusable only from code (for screen readers), so it never shows a focus ring.
    <h1
      ref={ref}
      tabIndex={-1}
      className={cx('font-bold focus:outline-none', className)}
    >
      {children}
    </h1>
  );
}
