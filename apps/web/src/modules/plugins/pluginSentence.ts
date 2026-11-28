/** A plugin's sentence with `{{name}}` slots, read back from a line it wrote with them filled. */
export interface SentencePattern {
  key: string;
  names: string[];
  pattern: RegExp;
}

const SLOT = /\{\{\s*(\w+)\s*\}\}/g;

const escape = (text: string) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/** The patterns of a plugin's translated sentences that have slots, longest first. */
export const sentencePatterns = (keys: string[]): SentencePattern[] =>
  keys
    .filter((key) => key.includes('{{'))
    .toSorted((a, b) => b.length - a.length)
    .map((key) => {
      const names: string[] = [];

      const source = key
        .split(SLOT)
        .map((part, index) => {
          if (index % 2 === 0) return escape(part);

          names.push(part);

          return '(.+?)';
        })
        .join('');

      return { key, names, pattern: new RegExp(`^${source}$`, 's') };
    });

/** The sentence a line was written from and the values in its slots, if any pattern fits. */
export const matchSentence = (patterns: SentencePattern[], line: string) => {
  for (const { key, names, pattern } of patterns) {
    const found = pattern.exec(line);

    if (found) {
      return {
        key,
        values: Object.fromEntries(names.map((name, index) => [name, found[index + 1]])),
      };
    }
  }

  return null;
};
