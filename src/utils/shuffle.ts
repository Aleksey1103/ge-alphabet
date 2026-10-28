/** Returns a number in [0, 1), like `Math.random`. */
export type RandomSource = () => number;

/** Fisher–Yates shuffle. Returns a new array and leaves `items` untouched. */
export function shuffle<T>(
  items: readonly T[],
  random: RandomSource = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
