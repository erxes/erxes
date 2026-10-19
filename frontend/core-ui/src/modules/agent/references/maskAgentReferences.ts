import type { IAgentReference } from './parseAgentReferences';
import { AGENT_REFERENCE_TYPES } from './parseAgentReferences';
import type { TAgentReferenceType } from './parseAgentReferences';

/**
 * Replaces valid `[[type:id:label]]` tokens with plain alphanumeric
 * placeholders (`AGENTREF<n>XREF`) before markdown parsing.
 *
 * Why this exists: react-markdown splits `[[deal:abc:Big *Order*]]` into
 * emphasis/text nodes long before a renderer sees the token text, so
 * render-time parsing breaks on labels containing markdown syntax.
 * Masked placeholders are ordinary words — they pass through markdown
 * untouched and are swapped back to chips inside text elements.
 *
 * Tokens inside fenced code blocks and inline code spans are left
 * literal: reference chips must never render inside code.
 */

const isReferenceType = (value: string): value is TAgentReferenceType =>
  (AGENT_REFERENCE_TYPES as readonly string[]).includes(value);

const TOKEN_PATTERN = /\[\[([A-Za-z]+):([A-Za-z0-9_-]{1,64}):([^\][]+)\]\]/g;

const FENCE_PATTERN = /^\s{0,3}(`{3,}|~{3,})/;

export interface IMaskedAgentReferences {
  text: string;
  references: IAgentReference[];
}

/**
 * Masks tokens inside a single line, honouring inline code spans. A code
 * span opens at a run of N backticks and closes at the next run of the
 * same length; an unclosed run is literal text, so scanning continues
 * after it.
 */
const maskLine = (
  line: string,
  references: IAgentReference[],
  resolveHandle?: (handle: string) => IAgentReference | undefined,
): string => {
  let out = '';
  let i = 0;

  const maskSegment = (segment: string): string =>
    segment
      .replace(/\[\[ref:([A-Za-z0-9_-]{1,64})\]\]/g, (raw, handle: string) => {
        if (!resolveHandle) return raw;
        const reference = resolveHandle(handle);
        if (!reference) return 'Reference unavailable';
        references.push(reference);
        return `AGENTREF${references.length - 1}XREF`;
      })
      .replace(TOKEN_PATTERN, (match, type, id, label: string) => {
        if (!isReferenceType(type) || !label.trim()) {
          return match;
        }

        references.push({ type, id, label: label.trim() });
        return `AGENTREF${references.length - 1}XREF`;
      });

  while (i < line.length) {
    if (line[i] === '`') {
      let runEnd = i;
      while (line[runEnd] === '`') {
        runEnd += 1;
      }
      const run = line.slice(i, runEnd);
      const closeIndex = line.indexOf(run, runEnd);

      if (closeIndex === -1) {
        // Literal backticks — text after them is still maskable.
        out += maskSegment(line.slice(i, runEnd));
        i = runEnd;
      } else {
        out += line.slice(i, closeIndex + run.length);
        i = closeIndex + run.length;
      }
    } else {
      let end = line.indexOf('`', i);
      if (end === -1) {
        end = line.length;
      }
      out += maskSegment(line.slice(i, end));
      i = end;
    }
  }

  return out;
};

export const maskAgentReferences = (
  text: string,
  resolveHandle?: (handle: string) => IAgentReference | undefined,
): IMaskedAgentReferences => {
  const references: IAgentReference[] = [];
  const lines = text.split('\n');
  let fenced = false;
  let fenceChar = '';
  let fenceLength = 0;

  const masked = lines.map((line) => {
    const fence = line.match(FENCE_PATTERN);

    if (fenced) {
      if (
        fence &&
        fence[1][0] === fenceChar &&
        fence[1].length >= fenceLength
      ) {
        fenced = false;
      }
      return line;
    }

    if (fence) {
      fenced = true;
      fenceChar = fence[1][0];
      fenceLength = fence[1].length;
      return line;
    }

    return maskLine(line, references, resolveHandle);
  });

  return { text: masked.join('\n'), references };
};

/** The placeholder emitted by `maskAgentReferences`. */
export const AGENT_REFERENCE_PLACEHOLDER_PATTERN = /AGENTREF(\d+)XREF/g;
