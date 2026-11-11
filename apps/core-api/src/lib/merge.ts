import { unique } from './contacts';

/**
 * Field values for a merge: the kept record's own value, or else the first
 * value another record has (in the order they were given).
 */
export const fillEmpty = <Row, Key extends keyof Row>(
  keep: Row,
  others: Row[],
  keys: readonly Key[],
) =>
  Object.fromEntries(
    keys.map((key) => {
      const value =
        keep[key] ?? others.find((other) => other[key] !== null && other[key] !== undefined)?.[key];

      return [key, value ?? null];
    }),
  ) as Pick<Row, Key>;

/** A primary value plus every list, kept record first. */
export const combineContacts = (
  keep: { primary: string | null; list: string[] },
  others: { primary: string | null; list: string[] }[],
) => {
  const all = unique([
    keep.primary,
    ...keep.list,
    ...others.flatMap((other) => [other.primary, ...other.list]),
  ]);

  return { primary: keep.primary ?? all[0] ?? null, list: unique([keep.primary, ...all]) };
};

/** Custom field values of all records; the kept record's values win. */
export const combineCustomFields = <Value>(
  keep: Record<string, Value>,
  others: Record<string, Value>[],
) => Object.assign({}, ...[...others].reverse(), keep) as Record<string, Value>;
