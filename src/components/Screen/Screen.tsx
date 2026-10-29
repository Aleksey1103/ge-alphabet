import type {ReactNode} from 'react';
import {cx} from '../../utils/classNames.ts';

type ScreenProps = {
  children: ReactNode;
  /**
   * Gap and other properties the screen doesn't set itself (it sets display,
   * flex, size and overflow).
   */
  className?: string;
};

/**
 * A screen's `<main>`: fills the app column and scrolls inside it if its
 * content doesn't fit.
 */
export default function Screen({children, className}: ScreenProps) {
  return (
    <main
      className={cx('flex min-h-0 flex-1 flex-col overflow-y-auto', className)}
    >
      {children}
    </main>
  );
}
