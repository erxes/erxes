import { and, type SQL } from 'drizzle-orm';
import { normalizePhone } from './contacts';
import { containsPattern } from './keyset';

/** The words of a search, at most 8 (`  Bold   Saraa ` → ['Bold', 'Saraa']). */
export const searchWords = (search: string) =>
  search.trim().split(/\s+/).filter(Boolean).slice(0, 8);

/**
 * Every word must match somewhere, in any order ("bold saraa" finds Saraa
 * Bold; "saraa nomad" finds her by name and email domain). `match` gets the
 * `%word%` pattern (literal: `%`, `_`, `\` escaped) and the same for the word
 * with phone formatting removed.
 */
export const matchEveryWord = (
  search: string,
  match: (pattern: string, phonePattern: string) => SQL | undefined,
) =>
  and(
    ...searchWords(search).map((word) =>
      match(containsPattern(word), containsPattern(normalizePhone(word))),
    ),
  );
