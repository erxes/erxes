// ---------------------------------------------------------------------------
// Shared HTML → plain-text helpers.
//
// Two invariants the previous per-file copies violated (flagged by CodeQL):
//  1. Entity decoding must be single-pass — chained .replace() calls let
//     "&amp;lt;" decode twice into "<" (js/double-escaping).
//  2. Script/style end-tag matching must tolerate "</script >" and stray
//     attributes inside the end tag (js/bad-tag-filter).
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

// End tags may legally contain whitespace before ">" ("</script >"), so the
// terminator accepts any junk between the tag name and the closing bracket.
const SCRIPT_BLOCK = /<script\b[\s\S]*?<\/script\b[^>]*>/gi;
const STYLE_BLOCK = /<style\b[\s\S]*?<\/style\b[^>]*>/gi;

/** Remove whole <script>/<style> blocks, end-tag variants included. */
export function stripScriptAndStyleBlocks(html: string): string {
  return html.replace(SCRIPT_BLOCK, ' ').replace(STYLE_BLOCK, ' ');
}
