/**
 * Parses `[[<type>:<id>:<label>]]` record references the assistant copies
 * from tool results into its replies.
 *
 * Grammar: `type` is one of the supported record types, `id` matches
 * `[A-Za-z0-9_-]{1,64}`, and `label` is everything up to the closing `]]`
 * (it may itself contain `:` — only the first two colons delimit). An
 * unknown type, a malformed id, a bracket or newline inside the token, or
 * an unclosed trailing token (mid-stream) is left as literal text.
 */

export const AGENT_REFERENCE_TYPES = [
  'customer',
  'company',
  'user',
  'product',
  'branch',
  'department',
  'unit',
  'brand',
  'deal',
  'conversation',
  'page',
] as const;

export type TAgentReferenceType = (typeof AGENT_REFERENCE_TYPES)[number];

const REFERENCE_TYPES: ReadonlySet<string> = new Set(AGENT_REFERENCE_TYPES);

export const AGENT_REFERENCE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export interface IAgentReference {
  type: TAgentReferenceType;
  id: string;
  label: string;
  /** Canonical tool metadata for registered page destinations. */
  path?: string;
}

export type TAgentReferenceSegment =
  | { kind: 'text'; text: string }
  | { kind: 'reference'; reference: IAgentReference; raw: string };

const isReferenceType = (value: string): value is TAgentReferenceType =>
  REFERENCE_TYPES.has(value);

/**
 * Splits `text` into plain-text and reference segments. Text segments are
 * always present between references; consecutive text runs are merged.
 */
export const parseAgentReferences = (
  text: string,
): TAgentReferenceSegment[] => {
  if (!text || !text.includes('[[')) {
    return text ? [{ kind: 'text', text }] : [];
  }

  const segments: TAgentReferenceSegment[] = [];
  let cursor = 0;
  let openIndex = text.indexOf('[[');

  while (openIndex !== -1) {
    const closeIndex = text.indexOf(']]', openIndex + 2);

    if (closeIndex === -1) {
      // Unclosed trailing token — mid-stream or malformed; keep it literal.
      break;
    }

    const token = text.slice(openIndex + 2, closeIndex);
    const firstColon = token.indexOf(':');
    const secondColon =
      firstColon === -1 ? -1 : token.indexOf(':', firstColon + 1);

    const type = firstColon === -1 ? '' : token.slice(0, firstColon);
    const id =
      secondColon === -1 ? '' : token.slice(firstColon + 1, secondColon);
    const label = secondColon === -1 ? '' : token.slice(secondColon + 1);

    if (
      isReferenceType(type) &&
      AGENT_REFERENCE_ID_RE.test(id) &&
      label.length > 0 &&
      !label.includes('[') &&
      !label.includes(']') &&
      !/[\r\n]/.test(label)
    ) {
      if (openIndex > cursor) {
        segments.push({ kind: 'text', text: text.slice(cursor, openIndex) });
      }

      segments.push({
        kind: 'reference',
        reference: {
          type,
          id,
          label: label.trim() || id,
        },
        raw: text.slice(openIndex, closeIndex + 2),
      });
      cursor = closeIndex + 2;
      openIndex = text.indexOf('[[', closeIndex + 2);
    } else {
      // Failed token: leave it literal and retry from right after its
      // opening brackets — a nested `[[` may still be a valid token.
      openIndex = text.indexOf('[[', openIndex + 2);
    }
  }

  if (cursor < text.length) {
    segments.push({ kind: 'text', text: text.slice(cursor) });
  }

  return segments;
};
