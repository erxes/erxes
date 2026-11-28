import { unique } from './contacts';

/**
 * Field values for a merge: the kept record's own value, or else the first
 * value another record has (in the order they were given).
 */
const fillEmpty = <Row, Key extends keyof Row>(keep: Row, others: Row[], keys: readonly Key[]) => {
  const filled: Partial<Pick<Row, Key>> = {};

  for (const key of keys) {
    const value =
      keep[key] ?? others.find((other) => other[key] !== null && other[key] !== undefined)?.[key];

    if (value !== null && value !== undefined) filled[key] = value;
  }

  return filled;
};

/**
 * Field values for a merge: each picked field takes the value of the record
 * picked for it, the rest are filled as `fillEmpty` does.
 */
export const pickFields = <Row extends { id: string }, Key extends keyof Row>(
  keep: Row,
  others: Row[],
  keys: readonly Key[],
  picks: Partial<Record<Key, string>>,
) => {
  const values = fillEmpty(keep, others, keys);

  for (const key of keys) {
    const from = pickedRow(keep, others, picks[key]);

    if (from !== keep) values[key] = from[key];
  }

  return values;
};

/** The record picked for a field, or else the kept one. */
export const pickedRow = <Row extends { id: string }>(keep: Row, others: Row[], id?: string) =>
  others.find((other) => other.id === id) ?? keep;

/** A primary value plus every list, kept record first; `primary` is the one picked. */
export const combineContacts = (
  keep: { primary: string | null; list: string[] },
  others: { primary: string | null; list: string[] }[],
  primary = keep.primary,
) => {
  const all = unique([
    keep.primary,
    ...keep.list,
    ...others.flatMap((other) => [other.primary, ...other.list]),
  ]);

  return { primary: primary ?? all[0] ?? null, list: unique([primary, ...all]) };
};

/** Custom field values of all records; the kept record's values win. */
export const combineCustomFields = <Value>(
  keep: Record<string, Value>,
  others: Record<string, Value>[],
): Record<string, Value> => ({
  ...Object.fromEntries(others.toReversed().flatMap((other) => Object.entries(other))),
  ...keep,
});
