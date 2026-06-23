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
// Phone-ish: 8+ digits allowing separators, optionally prefixed with +. Each
// digit after the first consumes its own separators — no ambiguous overlap.
const PHONE = /\+?\d(?:[\s().-]*\d){7,}/g;
// Long hex / base64-ish tokens (api keys, hashes, mongo ids).
const TOKEN = /\b[a-f0-9]{24,}\b|\b[A-Za-z0-9+/_-]{32,}={0,2}\b/g;

const EMAIL_LOCAL_CHARS = new Set('abcdefghijklmnopqrstuvwxyz0123456789._%+-');
const EMAIL_DOMAIN_CHARS = new Set('abcdefghijklmnopqrstuvwxyz0123456789.-');

/**
 * Linear single-pass email redaction — Sonar scores every quantified-class
 * regex shape here as super-linear (S5852), so emails are found by scanning
 * for '@' and expanding over the local/domain character sets instead.
 * Deliberately coarse: over-matching is acceptable when redacting.
 */
function redactEmails(text: string): string {
  const lower = text.toLowerCase();
  let out = '';
  let segStart = 0;
  let i = 0;
  while (i < text.length) {
    if (text[i] !== '@') {
      i++;
      continue;
    }
    let localStart = i;
    while (
      localStart > segStart &&
      EMAIL_LOCAL_CHARS.has(lower[localStart - 1])
    ) {
      localStart--;
    }
    let domainEnd = i + 1;
    while (
      domainEnd < text.length &&
      EMAIL_DOMAIN_CHARS.has(lower[domainEnd])
    ) {
      domainEnd++;
    }
    if (localStart < i && domainEnd > i + 1) {
      out += text.slice(segStart, localStart) + REDACTED;
      segStart = domainEnd;
      i = domainEnd;
    } else {
      i++;
    }
  }
  return out + text.slice(segStart);
}

/**
 * Deterministic first pass: redact identifier-shaped substrings. This is a
 * safety net under the extractor's "generalize, no identities" instruction
 * and the LLM gate — not the whole defense.
 */
export function scrubPII(text: string): string {
  return redactEmails((text ?? '').replace(URL_WITH_QUERY, (_m, base) => base))
    .replace(TOKEN, REDACTED)
    .replace(PHONE, (match) => {
      // Keep short quantities ("around 1000000 MNT") — only redact when it
      // still looks like a dialable number after stripping separators.
      const digits = match.replace(/\D/g, '');
      return digits.length >= 8 ? REDACTED : match;
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
  const lines = statements.map(
    (statement, index) => `${index + 1}. ${statement}`,
  );
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
    const text = raw ?? '';
    const open = text.indexOf('[');
    const close = open === -1 ? -1 : text.indexOf(']', open + 1);
    if (close === -1) return closed;
    const arr = JSON.parse(text.slice(open, close + 1));
    if (!Array.isArray(arr) || arr.length !== count) return closed;
    if (!arr.every((verdict) => typeof verdict === 'boolean')) return closed;
    return arr;
  } catch {
    return closed;
  }
}
