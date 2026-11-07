import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import {useEffect, useEffectEvent, useState, type KeyboardEvent} from 'react';
import {useMessages} from '../../hooks/useMessages.ts';
import type {Messages} from '../../i18n/messages.ts';
import type {GeorgianLetter} from '../../types/alphabet.ts';
import type {LetterStatus} from '../../types/training.ts';
import {cx} from '../../utils/classNames.ts';
import {
  findPickable,
  loopOffset,
  nearestSlide,
  wheelItemAngle,
  wheelRadius,
  wheelSlideCount,
} from '../../utils/picker.ts';

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

type LetterCarouselProps = {
  letters: readonly GeorgianLetter[];
  getStatus: (letterId: string) => LetterStatus;
  isSelectable: (letterId: string) => boolean;
  selectedLetterId: string | null;
  /** The letter to turn the wheel to: the selection, or the revealed answer. */
  centeredLetterId: string | null;
  onSelect: (letterId: string) => void;
  /**
   * Called when the user starts turning the wheel: nothing is selected until it
   * stops.
   */
  onDeselect: () => void;
};

/**
 * Embla drags, coasts (`dragFree`) and loops the wheel. Every spin still stops
 * on a letter (see `stopOnLetter` below). The letters never change while the
 * wheel is mounted (each session mounts a new one), and focus is handled here,
 * so neither is watched.
 */
const EMBLA_OPTIONS = {
  axis: 'y',
  loop: true,
  dragFree: true,
  containScroll: false,
  watchSlides: false,
  watchFocus: false,
} as const;

const STATUS_CLASSES: Record<LetterStatus, string> = {
  idle: 'border-transparent',
  selected: 'border-accent bg-accent-soft',
  correct: 'border-success bg-success-soft',
  incorrect: 'cursor-not-allowed border-error bg-error-soft',
};

/** The mark on a resolved letter, and its text for screen readers. */
function badgeOf(
  status: LetterStatus,
  t: Messages,
): {icon: string; text: string; className: string} | null {
  if (status === 'correct')
    return {
      icon: '✓',
      text: t.training.correctBadge,
      className: 'text-success',
    };
  if (status === 'incorrect')
    return {icon: '✕', text: t.training.wrongBadge, className: 'text-error'};
  return null;
}

/**
 * An iOS-style picker wheel that loops through the letters. The letter it stops
 * on is selected. A short set of letters is repeated round the wheel (see
 * `wheelSlideCount`), so it works with slides: slide `i` shows letter
 * `i % letters.length`.
 */
export default function LetterCarousel({
  letters,
  getStatus,
  isSelectable,
  selectedLetterId,
  centeredLetterId,
  onSelect,
  onDeselect,
}: LetterCarouselProps) {
  const t = useMessages();
  const canSpin = letters.some((letter) => isSelectable(letter.id));
  const [emblaRef, emblaApi] = useEmblaCarousel({
    ...EMBLA_OPTIONS,
    watchDrag: canSpin,
  });
  const slides = Array.from(
    {length: wheelSlideCount(letters.length)},
    (_, index) => letters[index % letters.length],
  );
  /**
   * The slide in the selection band when the wheel last stopped, or the one
   * it's turning to after a tap or a key press.
   */
  const [bandIndex, setBandIndex] = useState(0);
  const tabStopLetterId = selectedLetterId ?? centeredLetterId;
  const tabStopLetterIndex = letters.findIndex(
    (letter) => letter.id === tabStopLetterId,
  );
  const tabStopIndex =
    tabStopLetterIndex < 0
      ? bandIndex
      : nearestSlide(
          bandIndex,
          tabStopLetterIndex,
          letters.length,
          slides.length,
        );

  // Embla measures and scrolls the slides, but instead of sliding them, the wheel turns them round
  // a 3D drum. This follows Embla's iOS picker example, which uses these internal engine parts.
  useEffect(() => {
    if (!emblaApi) return;
    let radius = 0;
    /**
     * The angle each letter was last drawn at, so only letters that moved are
     * restyled.
     */
    let drawn: Array<number | null> = [];

    const turn = (api: EmblaApi) => {
      const slides = api.slideNodes();
      const position = api.scrollProgress() * slides.length;
      slides.forEach((slide, index) => {
        const angle = wheelItemAngle(index, position, slides.length);
        if (angle === drawn[index]) return;
        drawn[index] = angle;
        // Letters round the back stay in the DOM for screen readers, but can't be seen or tapped.
        slide.style.opacity = angle === null ? '0' : '1';
        slide.style.pointerEvents = angle === null ? 'none' : '';
        slide.style.transform =
          angle === null
            ? 'none'
            : `translateY(${-index * 100}%) rotateX(${angle}deg) translateZ(${radius}px)`;
      });
    };

    const layout = (api: EmblaApi) => {
      const {translate, slideLooper} = api.internalEngine();
      for (const translator of [
        translate,
        ...slideLooper.loopPoints.map((point) => point.translate),
      ]) {
        translator.clear();
        translator.toggleActive(false);
      }
      radius = wheelRadius(api.slideNodes()[0]?.offsetHeight ?? 0);
      // Pushes the drum back so the letter at the front is drawn at its normal size.
      api.containerNode().style.transform = `translateZ(${-radius}px)`;
      drawn = [];
      turn(api);
    };

    // However far the wheel would coast, it stops on the nearest letter.
    const stopOnLetter = (api: EmblaApi) =>
      api.internalEngine().scrollTo.distance(0, true);

    layout(emblaApi);
    emblaApi
      .on('reInit', layout)
      .on('scroll', turn)
      .on('pointerUp', stopOnLetter);
    return () => {
      emblaApi
        .off('reInit', layout)
        .off('scroll', turn)
        .off('pointerUp', stopOnLetter);
    };
  }, [emblaApi]);

  // The user's spins. Once the user turns the wheel, nothing is selected until it stops; then the
  // letter in the band is. The rejected first answer can't be chosen again, so if the wheel stops
  // on it, it rolls on to the next letter in the direction it was turning.
  const startSpin = useEffectEvent(() => onDeselect());
  const finishSpin = useEffectEvent((api: EmblaApi, step: 1 | -1) => {
    const index = api.selectedScrollSnap();
    const picked = findPickable(index, step, slides.length, (i) =>
      isSelectable(slides[i].id),
    );
    if (picked === null) return;
    onSelect(slides[picked].id);
    if (picked !== index) {
      setBandIndex(picked);
      api.scrollTo(picked, prefersReducedMotion());
    }
  });

  useEffect(() => {
    if (!emblaApi) return;
    /**
     * `pressed`: the user is holding the wheel still. `spinning`: the user has
     * turned it.
     */
    let spin: 'pressed' | 'spinning' | null = null;
    let turning = false;
    let position = 0;
    /** Which way the wheel last turned: 1 is towards later letters. */
    let direction: 1 | -1 = 1;

    const startSpinning = () => {
      if (spin !== 'spinning') startSpin();
      spin = 'spinning';
    };
    // Grabbing a wheel that's still turning catches it, which is part of a spin (as on iOS).
    const grab = () => {
      if (turning || spin === 'spinning') startSpinning();
      else spin = 'pressed';
    };
    const scroll = (api: EmblaApi) => {
      const count = api.slideNodes().length;
      const next = api.scrollProgress() * count;
      const moved = loopOffset(position, next, count);
      position = next;
      if (moved === 0) return;
      turning = true;
      direction = moved > 0 ? 1 : -1;
      if (spin === 'pressed') startSpinning();
    };
    // A press that didn't turn the wheel is a tap, not a spin.
    const release = () => {
      if (spin === 'pressed') spin = null;
    };
    const settle = (api: EmblaApi) => {
      setBandIndex(api.selectedScrollSnap());
      turning = false;
      if (spin === 'spinning') finishSpin(api, direction);
      spin = null;
    };
    const reset = (api: EmblaApi) => {
      spin = null;
      turning = false;
      position = api.scrollProgress() * api.slideNodes().length;
    };

    reset(emblaApi);
    emblaApi
      .on('pointerDown', grab)
      .on('scroll', scroll)
      .on('pointerUp', release)
      .on('settle', settle)
      .on('reInit', reset);
    return () => {
      emblaApi
        .off('pointerDown', grab)
        .off('scroll', scroll)
        .off('pointerUp', release)
        .off('settle', settle)
        .off('reInit', reset);
    };
  }, [emblaApi]);

  // Turn the wheel to the selection, or to the answer revealed after a failed exercise: to the
  // copy of the letter nearest to where the wheel is (or is already turning to).
  const slideCount = slides.length;
  useEffect(() => {
    const index = letters.findIndex((letter) => letter.id === centeredLetterId);
    if (!emblaApi || index < 0) return;
    const slide = nearestSlide(
      emblaApi.selectedScrollSnap(),
      index,
      letters.length,
      slideCount,
    );
    emblaApi.scrollTo(slide, prefersReducedMotion());
  }, [emblaApi, centeredLetterId, letters, slideCount]);

  /** Selects the letter on this slide and turns the wheel to that very slide. */
  function pickSlide(index: number) {
    setBandIndex(index);
    emblaApi?.scrollTo(index, prefersReducedMotion());
    onSelect(slides[index].id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const canPickLetter = (index: number) => isSelectable(letters[index].id);
    const canPickSlide = (index: number) => isSelectable(slides[index].id);
    // Home and End go to the first and last letter, whichever copy is nearest.
    const nearestCopy = (letterIndex: number | null) =>
      letterIndex === null
        ? null
        : nearestSlide(tabStopIndex, letterIndex, letters.length, slideCount);
    let next: number | null;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = findPickable(tabStopIndex + 1, 1, slideCount, canPickSlide);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = findPickable(tabStopIndex - 1, -1, slideCount, canPickSlide);
        break;
      case 'Home':
        next = nearestCopy(findPickable(0, 1, letters.length, canPickLetter));
        break;
      case 'End':
        next = nearestCopy(
          findPickable(letters.length - 1, -1, letters.length, canPickLetter),
        );
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next === null) return;
    pickSlide(next);
    findOption(event.currentTarget, next)?.focus({preventScroll: true});
  }

  return (
    <div
      className={cx(
        `relative min-h-[calc(var(--item-size)*2.5)] grow basis-0
        [--item-size:clamp(var(--spacing-touch),9dvh,72px)]`,
        // Fade the wheel out at the top and bottom into the surface behind it.
        `before:pointer-events-none before:absolute before:inset-x-0
        before:top-0 before:z-1 before:h-[22%] before:bg-linear-to-b
        before:from-surface before:to-transparent`,
        `after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0
        after:z-1 after:h-[22%] after:bg-linear-to-b after:from-transparent
        after:to-surface`,
      )}
    >
      {/* The selection band: the letter that stops here is the chosen one. */}
      <div
        className="absolute inset-x-0 top-1/2 h-[calc(var(--item-size)*1.5)]
          -translate-y-1/2 rounded-2xl bg-surface-2"
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center overflow-hidden">
        {/* Embla's viewport is one letter tall. The other letters are turned out of it in 3D. */}
        <div
          ref={emblaRef}
          className="h-[calc(var(--item-size)*1.5)] w-full touch-pan-x
            touch-pinch-zoom perspective-[1000px] select-none"
        >
          <div
            className="size-full transform-3d"
            role="listbox"
            aria-label={t.training.letters}
            aria-orientation="vertical"
            aria-disabled={!canSpin}
            onKeyDown={handleKeyDown}
          >
            {slides.map((letter, index) => {
              const status = getStatus(letter.id);
              const badge = badgeOf(status, t);
              const canSelect = isSelectable(letter.id);
              return (
                <button
                  // The slides never change while the wheel is mounted.
                  key={index}
                  type="button"
                  role="option"
                  data-letter-id={letter.id}
                  // Copies of a letter are announced by its place in the set ("პ, 1 of 2").
                  aria-setsize={letters.length}
                  aria-posinset={(index % letters.length) + 1}
                  aria-selected={
                    letter.id === selectedLetterId && index === tabStopIndex
                  }
                  aria-disabled={!canSelect}
                  tabIndex={index === tabStopIndex ? 0 : -1}
                  className={cx(
                    `relative flex size-full items-center justify-center
                    rounded-2xl border-2 opacity-0 backface-hidden
                    transition-[background-color,border-color]
                    focus-visible:-outline-offset-5`,
                    STATUS_CLASSES[status],
                    !canSelect && status !== 'incorrect' && 'cursor-default',
                    status !== 'selected' &&
                      'hover:not-aria-disabled:border-line',
                  )}
                  onClick={() => {
                    if (canSelect) pickSlide(index);
                  }}
                >
                  <span
                    lang="ka"
                    className={cx(
                      `text-[length:calc(var(--item-size)*0.75)] leading-none
                      font-semibold`,
                      status === 'incorrect' && 'opacity-60',
                    )}
                  >
                    {letter.character}
                  </span>
                  {badge && (
                    <span
                      className={cx(
                        'absolute right-4 text-xl font-bold',
                        badge.className,
                      )}
                    >
                      <span aria-hidden="true">{badge.icon}</span>
                      <span className="sr-only">{badge.text}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function findOption(list: HTMLElement, index: number): HTMLElement | null {
  return list.querySelectorAll<HTMLElement>('[role=option]')[index] ?? null;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
