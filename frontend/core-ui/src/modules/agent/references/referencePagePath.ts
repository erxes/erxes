import { AGENT_REFERENCE_ID_RE } from './parseAgentReferences';

/** Reject control characters in a decoded page path. */
// eslint-disable-next-line no-control-regex
const PAGE_PATH_BAD_CHAR_RE = /[\x00-\x1f\x7f]/;

/**
 * Decodes a `[[page:<base64url>:<label>]]` token's id back into a client
 * path. Returns null on malformed input — the caller renders the plain
 * pill so a garbage token can never navigate anywhere.
 */
export const decodeAgentPagePath = (encoded: string): string | null => {
  if (!AGENT_REFERENCE_ID_RE.test(encoded)) return null;

  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    // UTF-8 decode without TextDecoder: escape each byte, then URI-decode.
    // Malformed byte sequences throw inside decodeURIComponent → null.
    let escaped = '';
    for (let i = 0; i < binary.length; i++) {
      escaped += `%${binary.charCodeAt(i).toString(16).padStart(2, '0')}`;
    }
    const path = decodeURIComponent(escaped);

    if (
      !path.startsWith('/') ||
      path.startsWith('//') ||
      path.includes('\\') ||
      PAGE_PATH_BAD_CHAR_RE.test(path)
    ) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
};
