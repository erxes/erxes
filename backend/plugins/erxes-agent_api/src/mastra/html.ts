// ---------------------------------------------------------------------------
// Shared HTML → plain-text helpers.
//
// Invariants (each one fixed a static-analysis finding — keep them):
//  1. Entity decoding is single-pass — chained .replace() calls let
//     "&amp;lt;" decode twice into "<" (CodeQL js/double-escaping).
//  2. Script/style blocks are removed with a linear index scan, not a regex:
//     regex versions either missed "</script >" end-tag variants (CodeQL
//     js/bad-tag-filter) or backtracked super-linearly (Sonar S5852).
//  3. Tag stripping is likewise a single linear pass (Sonar S5852).
// ---------------------------------------------------------------------------

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&apos;': "'",
};

/**
 * Decode the common HTML entities in a single pass, so the output of one
 * replacement can never be re-matched and decoded by a later one.
 */
export function decodeHtmlEntities(s: string): string {
  return s.replace(
    /&(?:nbsp|amp|lt|gt|quot|apos|#39|#x27);/gi,
    (m) => ENTITY_MAP[m.toLowerCase()] ?? m,
  );
}

// Remove every <tag ...>...</tag ...> block in one forward scan. Unterminated
// blocks are dropped to the end of input — safer than leaving raw script
// source in the extracted text.
function stripBlocks(html: string, tag: string): string {
  const lower = html.toLowerCase();
  const open = `<${tag}`;
  const close = `</${tag}`;
  let out = '';
  let i = 0;
  while (i < html.length) {
    const start = lower.indexOf(open, i);
    if (start === -1) {
      out += html.slice(i);
      break;
    }
    const after = lower[start + open.length];
    // Word boundary: "<scripted>" is not a script tag.
    if (after !== undefined && /[a-z0-9]/.test(after)) {
      out += html.slice(i, start + open.length);
      i = start + open.length;
      continue;
    }
    out += `${html.slice(i, start)} `;
    const endTag = lower.indexOf(close, start + open.length);
    if (endTag === -1) {
      break;
    }
    const gt = html.indexOf('>', endTag + close.length);
    i = gt === -1 ? html.length : gt + 1;
  }
  return out;
}

/** Remove whole <script>/<style> blocks, end-tag variants included. */
export function stripScriptAndStyleBlocks(html: string): string {
  return stripBlocks(stripBlocks(html, 'script'), 'style');
}

/** Replace every <...> tag with a space in one linear pass. */
export function stripAllTags(s: string): string {
  let out = '';
  let i = 0;
  while (i < s.length) {
    const lt = s.indexOf('<', i);
    if (lt === -1) {
      out += s.slice(i);
      break;
    }
    const gt = s.indexOf('>', lt + 1);
    if (gt === -1) {
      out += s.slice(i);
      break;
    }
    out += s.slice(i, lt);
    // "<>" carries no tag name — keep it verbatim like the old regex did.
    out += gt > lt + 1 ? ' ' : s.slice(lt, gt + 1);
    i = gt + 1;
  }
  return out;
}
