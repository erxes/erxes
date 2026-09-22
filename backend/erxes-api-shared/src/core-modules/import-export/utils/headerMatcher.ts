import { ImportHeaderDefinition } from '../types';

export type ImportColumnMatchStatus = 'matched' | 'suggested' | 'unmatched';

export interface ImportColumnMatch {
  index: number;
  header: string;
  key?: string;
  confidence: number;
  status: ImportColumnMatchStatus;
}

/** At or above this score a column is wired up without asking. */
export const AUTO_MATCH_CONFIDENCE = 0.8;

/** Below this score the guess is too weak to show at all. */
export const SUGGEST_CONFIDENCE = 0.55;

const CODE_PATTERN = /\[([^\]]+)\]/g;

/**
 * Fold a header down to the letters and digits it carries.
 *
 * Case, spacing, punctuation and bracketed codes are all noise when a
 * spreadsheet is edited by hand. The rule is deliberately language-agnostic:
 * it strips anything that is not a letter or a number in any script, so it
 * behaves the same for `First Name`, `first_name` and `Нэр  Овог`.
 */
export const normalizeHeader = (value: string): string =>
  String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const extractCodes = (value: string): string[] =>
  [...String(value ?? '').matchAll(CODE_PATTERN)]
    .map((match) => match[1].trim().toLowerCase())
    .filter(Boolean);

const levenshtein = (left: string, right: string): number => {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, i) => i);

  for (let i = 0; i < left.length; i++) {
    const current = [i + 1];

    for (let j = 0; j < right.length; j++) {
      current.push(
        Math.min(
          previous[j + 1] + 1,
          current[j] + 1,
          previous[j] + (left[i] === right[j] ? 0 : 1),
        ),
      );
    }

    previous = current;
  }

  return previous[right.length];
};

const similarity = (left: string, right: string): number => {
  if (!left || !right) return 0;

  const longest = Math.max(left.length, right.length);

  return 1 - levenshtein(left, right) / longest;
};

/** The code a repeating property column carries, e.g. `street#2`. */
const qualifiedCode = (
  definition: ImportHeaderDefinition,
): string | undefined =>
  definition.code
    ? definition.rowIndex
      ? `${definition.code}#${definition.rowIndex}`
      : definition.code
    : undefined;

const scoreHeader = (
  header: string,
  definition: ImportHeaderDefinition,
): number => {
  if (header === definition.label.trim() || header === definition.key.trim()) {
    return 1;
  }

  if (
    definition.aliases?.some((alias) => String(alias || '').trim() === header)
  ) {
    return 0.95;
  }

  const headerCodes = extractCodes(header);

  if (headerCodes.length && definition.code) {
    const qualified = qualifiedCode(definition);

    if (qualified && headerCodes.includes(qualified.toLowerCase())) {
      return 0.95;
    }

    // A bare code carries no row, so it belongs to the group's first row.
    if (
      (!definition.rowIndex || definition.rowIndex === 1) &&
      headerCodes.includes(definition.code.toLowerCase())
    ) {
      return 0.9;
    }

    return 0;
  }

  const normalizedHeader = normalizeHeader(header);

  if (!normalizedHeader) {
    return 0;
  }

  const candidates = [
    definition.label,
    definition.key,
    ...(definition.aliases || []),
  ]
    .map(normalizeHeader)
    .filter(Boolean);

  if (candidates.includes(normalizedHeader)) {
    return 0.85;
  }

  // Fuzzy hits stay below AUTO_MATCH_CONFIDENCE on purpose: a near-miss is a
  // suggestion for a person to confirm, never something to wire up silently.
  const closest = candidates.reduce(
    (best, candidate) =>
      Math.max(best, similarity(normalizedHeader, candidate)),
    0,
  );

  return closest * 0.79;
};

/**
 * Resolve a file's header row against a module's import fields.
 *
 * Every column comes back, including the ones nothing matched — the caller
 * shows them so a mismatch is visible instead of silently dropping data. A
 * target field is claimed at most once; the weaker duplicate is reported
 * unmatched rather than overwriting its sibling.
 */
export const matchImportHeaders = (
  fileHeaders: string[],
  definitions: ImportHeaderDefinition[],
): ImportColumnMatch[] => {
  const matches: ImportColumnMatch[] = fileHeaders.map((rawHeader, index) => {
    const header = String(rawHeader ?? '').trim();

    if (!header) {
      return {
        index,
        header,
        key: undefined,
        confidence: 0,
        status: 'unmatched',
      };
    }

    let bestKey: string | undefined;
    let bestScore = 0;

    for (const definition of definitions) {
      const score = scoreHeader(header, definition);

      if (score > bestScore) {
        bestScore = score;
        bestKey = definition.key;
      }
    }

    if (!bestKey || bestScore < SUGGEST_CONFIDENCE) {
      return {
        index,
        header,
        key: undefined,
        confidence: 0,
        status: 'unmatched',
      };
    }

    return {
      index,
      header,
      key: bestKey,
      confidence: Number(bestScore.toFixed(2)),
      status: bestScore >= AUTO_MATCH_CONFIDENCE ? 'matched' : 'suggested',
    };
  });

  const claimed = new Map<string, ImportColumnMatch>();

  for (const match of matches) {
    if (!match.key) continue;

    const holder = claimed.get(match.key);

    if (!holder) {
      claimed.set(match.key, match);
      continue;
    }

    const loser = holder.confidence >= match.confidence ? match : holder;

    if (loser === holder) {
      claimed.set(match.key, match);
    }

    loser.key = undefined;
    loser.confidence = 0;
    loser.status = 'unmatched';
  }

  return matches;
};
