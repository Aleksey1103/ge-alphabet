import {act, fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GEORGIAN_ALPHABET} from '../../data/georgianAlphabet.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import {wrap, WHEEL_ITEM_ANGLE} from '../../utils/picker.ts';
import LetterCarousel from './LetterCarousel.tsx';

/**
 * Stands in for Embla: tests move the wheel and fire its events. Slides are the
 * real options.
 */
const embla = vi.hoisted(() => {
  type Handler = (api: unknown) => void;
  const handlers = new Map<string, Set<Handler>>();
  const api = {
    snap: 0,
    options: {} as Record<string, unknown>,
    engine: {
      translate: {clear: vi.fn(), toggleActive: vi.fn()},
      slideLooper: {loopPoints: []},
      scrollTo: {distance: vi.fn()},
    },
    on(event: string, handler: Handler) {
      handlers.set(event, (handlers.get(event) ?? new Set()).add(handler));
      return api;
    },
    off(event: string, handler: Handler) {
      handlers.get(event)?.delete(handler);
      return api;
    },
    emit(event: string) {
      handlers.get(event)?.forEach((handler) => handler(api));
    },
    selectedScrollSnap: () => api.snap,
    scrollProgress: () => api.snap / api.slideNodes().length,
    // Like Embla, the wheel's position is the target as soon as it's told to turn.
    scrollTo: vi.fn((index: number) => {
      api.snap = index;
    }),
    slideNodes: () => [
      ...document.querySelectorAll<HTMLElement>('[role=option]'),
    ],
    containerNode: () => document.querySelector<HTMLElement>('[role=listbox]'),
    internalEngine: () => api.engine,
  };
  return api;
});

vi.mock('embla-carousel-react', () => ({
  default: (options: Record<string, unknown>) => {
    embla.options = options;
    return [() => {}, embla];
  },
}));

const letters = GEORGIAN_ALPHABET;
const count = letters.length;
const last = count - 1;

function renderPicker({
  pickerLetters = letters,
  selectable = () => true,
  selectedLetterId = null,
}: {
  pickerLetters?: readonly GeorgianLetter[];
  selectable?: (letterId: string) => boolean;
  selectedLetterId?: string | null;
} = {}) {
  const onSelect = vi.fn();
  const onDeselect = vi.fn();
  const props = {
    letters: pickerLetters,
    getStatus: () => 'idle' as const,
    isSelectable: selectable,
    selectedLetterId,
    centeredLetterId: selectedLetterId,
    onSelect,
    onDeselect,
  };
  const view = render(<LetterCarousel {...props} />);
  return {...view, props, onSelect, onDeselect};
}

/**
 * Turns the wheel `by` letters (negative is upwards), one at a time, wrapping
 * round the loop.
 */
function turnBy(by: number) {
  for (let i = 0; i < Math.abs(by); i++) {
    embla.snap = wrap(embla.snap + Math.sign(by), embla.slideNodes().length);
    embla.emit('scroll');
  }
}

/**
 * The user grabs the wheel at `from`, turns it by `by` letters and lets it
 * stop.
 */
function spin(from: number, by: number) {
  act(() => {
    // Moved without scroll events, so the picker re-reads the position, as after a re-layout.
    embla.snap = from;
    embla.emit('reInit');
    embla.emit('pointerDown');
    turnBy(by);
    embla.emit('pointerUp');
    embla.emit('settle');
  });
}

function option(index: number): HTMLElement {
  const found = screen
    .getAllByRole('option')
    .find((element) => element.dataset.letterId === letters[index].id);
  if (!found) throw new Error(`no option ${index}`);
  return found;
}

beforeEach(() => {
  embla.snap = 0;
  vi.clearAllMocks();
});

describe('LetterCarousel', () => {
  it('clears the selection while the user turns the wheel, then selects where it stops', () => {
    const {onSelect, onDeselect} = renderPicker();
    spin(0, 5);
    expect(onDeselect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(letters[5].id);
  });

  it('selects nothing when the wheel stops without the user turning it', () => {
    const {onSelect, onDeselect} = renderPicker();
    act(() => {
      embla.emit('pointerDown');
      embla.emit('pointerUp');
      embla.emit('settle');
    });
    expect(onSelect).not.toHaveBeenCalled();
    expect(onDeselect).not.toHaveBeenCalled();
  });

  it('counts catching the wheel while it still turns as part of the spin', () => {
    const {onSelect} = renderPicker();
    act(() => {
      embla.emit('pointerDown');
      turnBy(3);
      embla.emit('pointerUp');
      // It's still coasting when the user touches it to stop it.
      embla.emit('pointerDown');
      embla.emit('pointerUp');
      embla.emit('settle');
    });
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(letters[3].id);
  });

  it('rolls past a letter that cannot be chosen, in the direction the wheel turned', () => {
    const {onSelect} = renderPicker({
      selectable: (id) => id !== letters[5].id,
    });
    spin(2, 3);
    expect(onSelect).toHaveBeenLastCalledWith(letters[6].id);
    expect(embla.scrollTo).toHaveBeenLastCalledWith(6, false);
    spin(8, -3);
    expect(onSelect).toHaveBeenLastCalledWith(letters[4].id);
    // A long spin, more than half way round the loop, still keeps its direction.
    spin(6, 32);
    expect(onSelect).toHaveBeenLastCalledWith(letters[6].id);
  });

  it('rolls on across the end of the loop', () => {
    const {onSelect} = renderPicker({
      selectable: (id) => id !== letters[0].id,
    });
    spin(last - 1, 2);
    expect(onSelect).toHaveBeenLastCalledWith(letters[1].id);
  });

  it('selects a tapped letter and turns the wheel to it', () => {
    const {onSelect, rerender, props} = renderPicker();
    fireEvent.click(option(3));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(letters[3].id);
    rerender(
      <LetterCarousel
        {...props}
        selectedLetterId={letters[3].id}
        centeredLetterId={letters[3].id}
      />,
    );
    expect(embla.scrollTo).toHaveBeenLastCalledWith(3, false);
  });

  it('draws the letters round a drum and hides the ones round the back', () => {
    renderPicker();
    act(() => {
      embla.snap = 5;
      embla.emit('scroll');
    });
    expect(option(5).style.transform).toContain('rotateX(0deg)');
    expect(option(4).style.transform).toContain(
      `rotateX(${WHEEL_ITEM_ANGLE}deg)`,
    );
    expect(option(6).style.transform).toContain(
      `rotateX(${-WHEEL_ITEM_ANGLE}deg)`,
    );
    expect(option(5).style.opacity).toBe('1');
    expect(option(20).style.opacity).toBe('0');
    expect(option(20).style.pointerEvents).toBe('none');
  });

  it("replaces Embla's sliding with the drum, and always stops on a letter", () => {
    renderPicker();
    expect(embla.engine.translate.toggleActive).toHaveBeenCalledWith(false);
    act(() => embla.emit('pointerUp'));
    expect(embla.engine.scrollTo.distance).toHaveBeenCalledWith(0, true);
  });

  it("can't be spun while no letter can be chosen", () => {
    const {rerender, props} = renderPicker();
    expect(embla.options.watchDrag).toBe(true);
    rerender(<LetterCarousel {...props} isSelectable={() => false} />);
    expect(embla.options.watchDrag).toBe(false);
    expect(screen.getByRole('listbox').getAttribute('aria-disabled')).toBe(
      'true',
    );
  });

  it('loops round the ends with the arrow keys and skips letters that cannot be chosen', () => {
    const {onSelect, rerender, props} = renderPicker({
      selectedLetterId: letters[last].id,
    });
    const listbox = screen.getByRole('listbox', {name: 'Georgian letters'});
    fireEvent.keyDown(listbox, {key: 'ArrowDown'});
    expect(onSelect).toHaveBeenLastCalledWith(letters[0].id);

    rerender(
      <LetterCarousel
        {...props}
        selectedLetterId={letters[0].id}
        isSelectable={(id) => id !== letters[last].id}
      />,
    );
    fireEvent.keyDown(listbox, {key: 'ArrowUp'});
    expect(onSelect).toHaveBeenLastCalledWith(letters[last - 1].id);
  });

  it('makes the letter in the selection band the tab stop when nothing is selected', () => {
    renderPicker();
    spin(0, 12);
    expect(option(12).tabIndex).toBe(0);
    expect(
      screen.getAllByRole('option').filter((element) => element.tabIndex === 0),
    ).toHaveLength(1);
  });
});

describe('LetterCarousel with a short set of letters', () => {
  // პ and ფ, repeated round the wheel: slide i shows პ when i is even and ფ when it's odd.
  const pair = GEORGIAN_ALPHABET.filter((letter) =>
    ['პ', 'ფ'].includes(letter.character),
  );
  const [p, ph] = pair;

  function slide(index: number): HTMLElement {
    return screen.getAllByRole('option')[index];
  }

  it('repeats the letters round the wheel and announces each by its place in the set', () => {
    renderPicker({pickerLetters: pair});
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(10);
    expect(options.map((option) => option.textContent).join('')).toBe(
      'პფპფპფპფპფ',
    );
    expect(slide(3).getAttribute('aria-setsize')).toBe('2');
    expect(slide(3).getAttribute('aria-posinset')).toBe('2');
  });

  it('selects the letter it stops on, round the end of the loop too', () => {
    const {onSelect} = renderPicker({pickerLetters: pair});
    spin(0, 3);
    expect(onSelect).toHaveBeenLastCalledWith(ph.id);
    // From the last slide, two on: past the end to slide 1.
    spin(9, 2);
    expect(onSelect).toHaveBeenLastCalledWith(ph.id);
    expect(embla.snap).toBe(1);
  });

  it('rolls past the rejected letter to the next copy of the other one', () => {
    const {onSelect} = renderPicker({
      pickerLetters: pair,
      selectable: (id) => id !== p.id,
    });
    spin(1, 1);
    expect(onSelect).toHaveBeenLastCalledWith(ph.id);
    expect(embla.scrollTo).toHaveBeenLastCalledWith(3, false);
  });

  it('turns to the tapped copy, not just any copy of its letter', () => {
    const {onSelect, rerender, props} = renderPicker({pickerLetters: pair});
    fireEvent.click(slide(9));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(ph.id);
    rerender(
      <LetterCarousel
        {...props}
        selectedLetterId={ph.id}
        centeredLetterId={ph.id}
      />,
    );
    expect(embla.scrollTo).toHaveBeenLastCalledWith(9, false);
    expect(slide(9).getAttribute('aria-selected')).toBe('true');
    expect(slide(1).getAttribute('aria-selected')).toBe('false');
    expect(slide(9).tabIndex).toBe(0);
  });

  it('moves copy by copy with the arrow keys, in the direction pressed', () => {
    const {onSelect, rerender, props} = renderPicker({
      pickerLetters: pair,
      selectedLetterId: p.id,
    });
    const listbox = screen.getByRole('listbox', {name: 'Georgian letters'});
    fireEvent.keyDown(listbox, {key: 'ArrowUp'});
    expect(onSelect).toHaveBeenLastCalledWith(ph.id);
    expect(embla.snap).toBe(9);
    expect(document.activeElement).toBe(slide(9));

    rerender(
      <LetterCarousel
        {...props}
        selectedLetterId={ph.id}
        centeredLetterId={ph.id}
      />,
    );
    fireEvent.keyDown(listbox, {key: 'ArrowUp'});
    expect(onSelect).toHaveBeenLastCalledWith(p.id);
    expect(embla.snap).toBe(8);
  });
});
