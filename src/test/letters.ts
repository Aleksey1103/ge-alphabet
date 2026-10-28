import {GEORGIAN_ALPHABET} from '../data/georgianAlphabet.ts';

/**
 * A letter that is neither the target nor an already rejected answer, i.e. a
 * fresh wrong answer.
 */
export function wrongLetterId(
  targetId: string,
  rejectedId: string | null,
): string {
  const letter = GEORGIAN_ALPHABET.find(
    (candidate) => candidate.id !== targetId && candidate.id !== rejectedId,
  );
  if (!letter) throw new Error('no wrong answer available');
  return letter.id;
}
