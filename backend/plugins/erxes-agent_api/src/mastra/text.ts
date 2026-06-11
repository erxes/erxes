// ---------------------------------------------------------------------------
// Linear-time string helpers replacing regex patterns flagged for
// super-linear backtracking (Sonar S5852). Each does a single pass over the
// input, so pathological strings can't pin the event loop.
// ---------------------------------------------------------------------------

/** Trim any of `leading` chars from the start and `trailing` chars from the end. */
export function trimEdgeChars(
  s: string,
  leading: string,
  trailing: string,
): string {
  let start = 0;
  let end = s.length;
  while (start < end && leading.includes(s[start])) start++;
  while (end > start && trailing.includes(s[end - 1])) end--;
  return s.slice(start, end);
}

/** True for an ASCII uppercase letter. */
const isUpper = (ch: string) => ch >= 'A' && ch <= 'Z';
/** True for an ASCII lowercase letter. */
const isLower = (ch: string) => ch >= 'a' && ch <= 'z';

/**
 * Split an identifier into words: separators (`_`, `-`, whitespace) end a
 * word, as do lower→Upper transitions ("dealsAdd" → deals, Add) and the last
 * capital of an acronym run before a lowercase ("HTMLParser" → HTML, Parser).
 */
export function splitCamelWords(input: string): string[] {
  const s = input || '';
  const words: string[] = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '_' || ch === '-' || ch === ' ' || ch === '\t' || ch === '\n') {
      if (cur) {
        words.push(cur);
        cur = '';
      }
      continue;
    }
    if (cur && isUpper(ch)) {
      const prev = cur[cur.length - 1];
      const next = s[i + 1];
      if (!isUpper(prev) || (next !== undefined && isLower(next))) {
        words.push(cur);
        cur = '';
      }
    }
    cur += ch;
  }
  if (cur) words.push(cur);
  return words;
}
