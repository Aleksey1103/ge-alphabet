import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

// jsdom doesn't implement media playback. Tests that care spy on these.
Object.assign(HTMLMediaElement.prototype, {
  play: () => Promise.resolve(),
  pause: () => {},
  // Like browsers, reloading resets the playback rate.
  load(this: HTMLMediaElement) {
    this.playbackRate = this.defaultPlaybackRate;
  },
});

// Nor layout observers or media queries, which Embla Carousel and the letter picker use.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.assign(globalThis, {
  ResizeObserver: NoopObserver,
  IntersectionObserver: NoopObserver,
});
window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// Vitest globals are off, so React Testing Library can't register its own cleanup.
afterEach(() => {
  cleanup();
});
