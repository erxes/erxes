export const normalizeEmail = (value: string) => value.trim().toLowerCase();

/** Spaces, brackets and dashes are formatting; dedupe compares the rest. */
export const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '');

export const normalizeName = (value: string) => value.trim();

/**
 * A primary value plus a list, kept as "primary first, no duplicates".
 * Leaving `primary` out keeps the current one while it is still listed;
 * `null` with no list removes the current primary (the next one takes over).
 */
export const resolveContacts = (
  primary: string | null | undefined,
  list: string[] | undefined,
  current: { primary: string | null; list: string[] },
  normalize: (value: string) => string,
) => {
  let values = (list ?? current.list).map(normalize);
  let first: string | null;

  if (primary === undefined) {
    first = current.primary && values.includes(current.primary) ? current.primary : null;
  } else {
    first = primary === null ? null : normalize(primary);
  }

  if (primary === null && list === undefined) {
    values = values.filter((value) => value !== current.primary);
  }

  const all = unique([first, ...values]);

  return { primary: all[0] ?? null, list: all };
};

/** Distinct non-empty values, first occurrence wins. */
export const unique = (values: (string | null | undefined)[]) => [
  ...new Set(values.filter((value): value is string => !!value)),
];
