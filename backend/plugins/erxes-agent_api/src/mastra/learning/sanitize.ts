// ---------------------------------------------------------------------------
// Agent Learning — sanitization (the privacy boundary).
//
// The ONLY path from a private conversation into the shared "Agent knowledge"
// runs through this file, in two layers:
//   1. scrubPII   — deterministic redaction of identifier-shaped substrings
//                   (emails, phones, long ids, tokens, URL credentials).
//   2. privacy gate — an LLM judge that answers, per candidate, "could this
//                   statement identify or describe a specific person?".
// Both layers fail CLOSED: a gate parse error or any uncertainty drops the
// candidate. A dropped lesson costs nothing; a leaked one can't be unleaked.
//
// Pure helpers are exported for unit testing; the gate call is orchestrated
// by distill.ts.
// ---------------------------------------------------------------------------

export const REDACTED = '[redacted]';

// Identifier-shaped substrings. Order matters: URLs first (so an email inside
// a URL doesn't leave a half-scrubbed URL behind), then emails, then numbers.
const URL_WITH_QUERY = /(https?:\/\/[^\s?'"<>]+)\?[^\s'"<>]*/gi;
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
// Phone-ish: 8+ digits allowing separators, optionally prefixed with +.
const PHONE = /\+?\d[\d\s().-]{6,}\d/g;
// Long hex / base64-ish tokens (api keys, hashes, mongo ids).
const TOKEN = /\b[a-f0-9]{24,}\b|\b[A-Za-z0-9+/_-]{32,}={0,2}\b/g;

/**
 * Deterministic first pass: redact identifier-shaped substrings. This is a
 * safety net under the extractor's "generalize, no identities" instruction
 * and the LLM gate — not the whole defense.
 */
export function scrubPII(text: string): string {
  return (text ?? '')
    .replace(URL_WITH_QUERY, (_m, base) => base)
    .replace(EMAIL, REDACTED)
    .replace(TOKEN, REDACTED)
    .replace(PHONE, (m) => {
      // Keep short quantities ("around 1000000 MNT") — only redact when it
      // still looks like a dialable number after stripping separators.
      const digits = m.replace(/\D/g, '');
      return digits.length >= 8 ? REDACTED : m;
    });
}

/** True when scrubbing left redaction marks — a hint the statement was about
 * a specific identity and should score lower / be gated harder. */
export function wasRedacted(text: string): boolean {
  return text.includes(REDACTED);
}

// ── LLM privacy gate (pure prompt/parse halves) ──────────────────────────────

export const PRIVACY_GATE_INSTRUCTIONS = `You are a privacy gate for a shared knowledge base used by MANY different users.
You receive candidate "lessons" extracted from one private conversation.
For each candidate decide: is it SAFE to share with every user of this organization?

A candidate is UNSAFE when it:
- names, describes, or could identify a specific person, customer, or their situation
- contains contact details, account numbers, ids, credentials, or quotes private messages
- is about one individual's circumstances rather than a general fact, procedure, or product behavior

A candidate is SAFE only when it is a general lesson that holds regardless of who asked.
When uncertain, answer UNSAFE.

Output ONLY a JSON array of booleans, one per candidate, true = SAFE.
Example: [true, false, true]
No commentary, no code fences.`;

/** Render the numbered candidate list the privacy gate judges. */
export function buildGateUserContent(statements: string[]): string {
  const lines = statements.map((s, i) => `${i + 1}. ${s}`);
  return [
    `Candidates (${statements.length}):`,
    ...lines,
    '',
    `Output a JSON array of exactly ${statements.length} booleans.`,
  ].join('\n');
}

/**
 * Parse the gate's verdicts. FAIL-CLOSED: anything unparseable, wrong-length,
 * or non-boolean yields all-false (every candidate dropped).
 */
export function parseGateVerdicts(raw: string, count: number): boolean[] {
  const closed = new Array(count).fill(false);
  try {
    const match = (raw ?? '').match(/\[[\s\S]*?\]/);
    if (!match) return closed;
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr) || arr.length !== count) return closed;
    if (!arr.every((v) => typeof v === 'boolean')) return closed;
    return arr;
  } catch {
    return closed;
  }
}
