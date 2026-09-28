/**
 * A rendered email has no reason to still contain `{{ … }}`.
 *
 * A record with nothing for a field falls back to that field's own default,
 * or to nothing at all — never to the placeholder's own text. So a marker
 * that survived rendering is always something not wired up, not a person
 * whose data was thin, and that difference is the whole point: a campaign
 * that went out with `{{ firstName }}` in it should be answerable without
 * guessing which of the two it was.
 */
const PLACEHOLDER = /\{\{\s*([^{}]+?)\s*\}\}/g;

export const findUnresolvedPlaceholders = (html?: string): string[] => {
  if (!html) {
    return [];
  }

  return Array.from(
    new Set([...html.matchAll(PLACEHOLDER)].map((match) => match[1])),
  );
};

/** What to put in front of someone reading a failure. */
export const describeUnresolvedPlaceholders = (placeholders: string[]) =>
  `unresolved placeholder${placeholders.length > 1 ? 's' : ''}: ${placeholders
    .map((placeholder) => `{{ ${placeholder} }}`)
    .join(', ')}`;
