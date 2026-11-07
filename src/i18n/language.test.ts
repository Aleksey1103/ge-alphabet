import {describe, expect, it} from 'vitest';
import {detectLanguage, loadLanguage, saveLanguage} from './language.ts';

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

const brokenStorage = {
  getItem: (): string | null => {
    throw new DOMException('blocked', 'SecurityError');
  },
  setItem: () => {
    throw new DOMException('blocked', 'SecurityError');
  },
};

describe('detectLanguage', () => {
  it('picks Russian when the browser prefers it first', () => {
    expect(detectLanguage(['ru-RU', 'en-US'])).toBe('ru');
    expect(detectLanguage(['ru'])).toBe('ru');
    expect(detectLanguage(['RU-ru'])).toBe('ru');
  });

  it('picks English otherwise', () => {
    expect(detectLanguage(['en-US', 'ru-RU'])).toBe('en');
    expect(detectLanguage(['ka-GE'])).toBe('en');
    expect(detectLanguage(['rue'])).toBe('en');
    expect(detectLanguage([])).toBe('en');
  });
});

describe('loadLanguage', () => {
  it('prefers a saved choice over the browser language', () => {
    expect(loadLanguage(memoryStorage({language: 'en'}), ['ru-RU'])).toBe('en');
    expect(loadLanguage(memoryStorage({language: 'ru'}), ['en-US'])).toBe('ru');
  });

  it('ignores an invalid saved value', () => {
    expect(loadLanguage(memoryStorage({language: 'de'}), ['ru'])).toBe('ru');
  });

  it('falls back to the browser language when storage is unavailable', () => {
    expect(loadLanguage(brokenStorage, ['ru'])).toBe('ru');
    expect(loadLanguage(undefined, ['en'])).toBe('en');
  });
});

describe('saveLanguage', () => {
  it('saves the choice so it loads next time', () => {
    const storage = memoryStorage();
    saveLanguage(storage, 'ru');
    expect(loadLanguage(storage, ['en-US'])).toBe('ru');
  });

  it('does nothing when storage is unavailable', () => {
    expect(() => saveLanguage(brokenStorage, 'ru')).not.toThrow();
    expect(() => saveLanguage(undefined, 'ru')).not.toThrow();
  });
});
