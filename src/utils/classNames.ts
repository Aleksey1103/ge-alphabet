/**
 * Joins the truthy class names: `cx('rounded-2xl', isOn && 'bg-accent')`.
 *
 * It doesn't resolve Tailwind conflicts: with two utilities for the same
 * property (`bg-surface` and `bg-accent`), the order of the generated CSS
 * decides, not the order here. Keep the classes passed together exclusive.
 */
export function cx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ');
}
