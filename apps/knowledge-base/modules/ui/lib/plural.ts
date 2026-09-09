/**
 * Labels a count with its noun, adding the English plural `s` past one. Counts
 * reach the portal already resolved, so this only ever picks between the two
 * forms — it never formats the number itself.
 */
export const plural = (count: number, singular: string): string =>
  `${count} ${count === 1 ? singular : `${singular}s`}`;
