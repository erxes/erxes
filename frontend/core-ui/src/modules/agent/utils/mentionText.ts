import {
  parseAgentReferences,
  type TAgentReferenceType,
} from '../references/parseAgentReferences';
import { referenceIdentity } from '../references/referenceRegistry';

/** Record types a user can mention; `page` tokens come only from findPages. */
export type TAgentMentionType = Exclude<TAgentReferenceType, 'page'>;
export const AGENT_MENTION_TYPES = [
  'customer',
  'company',
  'user',
  'product',
  'structureEntity',
  'brand',
  'deal',
  'conversation',
] as const satisfies readonly TAgentMentionType[];

export interface IAgentMention {
  type: TAgentMentionType;
  id: string;
  label: string;
}

/**
 * A mention inside the composer's visible text. `[start, end)` covers the
 * `@Label` the user sees; the range is valid only while that exact text
 * remains there.
 */
export interface IAgentMentionRange {
  start: number;
  end: number;
  mention: IAgentMention;
}

export interface IAgentMentionText {
  value: string;
  mentions: IAgentMentionRange[];
}

export interface IAgentMentionQuery {
  /** Index of the `@` trigger. */
  start: number;
  query: string;
}

export const AGENT_MENTION_LABEL_MAX = 80;
const QUERY_MAX_LENGTH = 40;
const QUERY_MAX_SPACES = 2;
const TRIGGER_BOUNDARY_RE = /[\s([{"'“‘]/;

/** Mirrors the backend's label rules so a token always round-trips. */
export const sanitizeAgentMentionLabel = (value: string): string =>
  value
    .replace(/[[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, AGENT_MENTION_LABEL_MAX)
    .trim();

export const agentMentionDisplay = (mention: IAgentMention) =>
  `@${mention.label}`;

export const agentMentionToken = (mention: IAgentMention) =>
  `[[${mention.type}:${mention.id}:${mention.label}]]`;

const sortRanges = (ranges: IAgentMentionRange[]) =>
  [...ranges].sort((a, b) => a.start - b.start);

/** Ranges that still match the text, sorted and non-overlapping. */
export const validAgentMentionRanges = (
  value: string,
  ranges: IAgentMentionRange[],
): IAgentMentionRange[] => {
  const valid: IAgentMentionRange[] = [];
  let cursor = 0;
  for (const range of sortRanges(ranges)) {
    if (
      range.start >= cursor &&
      value.slice(range.start, range.end) === agentMentionDisplay(range.mention)
    ) {
      valid.push(range);
      cursor = range.end;
    }
  }
  return valid;
};

/** Visible text → wire text: each mention becomes its `[[type:id:label]]`. */
export const serializeAgentMentionText = (
  value: string,
  ranges: IAgentMentionRange[],
): string => {
  let result = '';
  let cursor = 0;
  for (const range of validAgentMentionRanges(value, ranges)) {
    result +=
      value.slice(cursor, range.start) + agentMentionToken(range.mention);
    cursor = range.end;
  }
  return result + value.slice(cursor);
};

/** Wire text → visible text with mention ranges (history edit/restore). */
export const parseAgentMentionText = (text: string): IAgentMentionText => {
  let value = '';
  const mentions: IAgentMentionRange[] = [];
  for (const segment of parseAgentReferences(text)) {
    if (segment.kind === 'text') {
      value += segment.text;
      continue;
    }
    const { type, id } = segment.reference;
    const label = sanitizeAgentMentionLabel(segment.reference.label);
    if (type === 'page' || !label) {
      value += segment.raw;
      continue;
    }
    const mention: IAgentMention = { type, id, label };
    const display = agentMentionDisplay(mention);
    mentions.push({
      start: value.length,
      end: value.length + display.length,
      mention,
    });
    value += display;
  }
  return { value, mentions };
};

/** Copy-friendly text: tokens read as `@Label`. */
export const agentMentionPlainText = (text: string) =>
  parseAgentMentionText(text).value;

/** Unique mentioned records, in order of first appearance. */
export const agentMentionsFromText = (text: string): IAgentMention[] => {
  const seen = new Map<string, IAgentMention>();
  for (const { mention } of parseAgentMentionText(text).mentions) {
    const identity = referenceIdentity(mention);
    if (!seen.has(identity)) seen.set(identity, mention);
  }
  return [...seen.values()];
};

const commonPrefix = (a: string, b: string) => {
  const max = Math.min(a.length, b.length);
  let index = 0;
  while (index < max && a[index] === b[index]) index += 1;
  return index;
};

const commonSuffix = (a: string, b: string) => {
  const max = Math.min(a.length, b.length);
  let index = 0;
  while (index < max && a[a.length - 1 - index] === b[b.length - 1 - index])
    index += 1;
  return index;
};

/**
 * Moves mention ranges through an ordinary text edit. A range before the
 * edit stays, a range after it shifts, and a range the edit touches becomes
 * plain text. `caret` (the selection end after the edit) disambiguates
 * repeated characters, e.g. typing `n` inside `@Ann`.
 */
export const applyAgentMentionEdit = (
  previous: string,
  next: string,
  ranges: IAgentMentionRange[],
  caret?: number,
): IAgentMentionRange[] => {
  const prefix = commonPrefix(previous, next);
  const tail = commonSuffix(previous, next);
  let start: number;
  let suffix: number;
  if (
    caret !== undefined &&
    caret >= 0 &&
    caret <= next.length &&
    next.length - caret <= tail
  ) {
    suffix = next.length - caret;
    start = Math.min(prefix, caret, previous.length - suffix);
  } else {
    start = prefix;
    suffix = Math.min(tail, Math.min(previous.length, next.length) - prefix);
  }
  const previousEnd = previous.length - suffix;
  const delta = next.length - previous.length;
  return validAgentMentionRanges(previous, ranges).flatMap((range) => {
    if (range.end <= start) return [range];
    if (range.start >= previousEnd)
      return [{ ...range, start: range.start + delta, end: range.end + delta }];
    return [];
  });
};

/** The active `@query` before the caret, or null when the menu should close. */
export const findAgentMentionQuery = (
  value: string,
  caret: number,
  ranges: IAgentMentionRange[],
): IAgentMentionQuery | null => {
  const valid = validAgentMentionRanges(value, ranges);
  if (valid.some((range) => caret > range.start && caret <= range.end))
    return null;
  for (
    let index = caret - 1;
    index >= 0 && caret - index <= QUERY_MAX_LENGTH + 1;
    index -= 1
  ) {
    const character = value[index];
    if (character === '\n') return null;
    if (valid.some((range) => index >= range.start && index < range.end))
      return null;
    if (character !== '@') continue;
    if (index > 0 && !TRIGGER_BOUNDARY_RE.test(value[index - 1])) return null;
    const query = value.slice(index + 1, caret);
    if (
      /^\s/.test(query) ||
      /\s{2}/.test(query) ||
      (query.match(/\s/g)?.length ?? 0) > QUERY_MAX_SPACES
    )
      return null;
    return { start: index, query };
  }
  return null;
};

/** Replaces the active `@query` with the picked mention plus one space. */
export const insertAgentMention = (
  value: string,
  ranges: IAgentMentionRange[],
  query: IAgentMentionQuery,
  caret: number,
  mention: IAgentMention,
): IAgentMentionText & { caret: number } => {
  const display = agentMentionDisplay(mention);
  const after = value.slice(caret);
  const spacer = after.startsWith(' ') ? '' : ' ';
  const inserted = display + spacer;
  const delta = inserted.length - (caret - query.start);
  const kept = validAgentMentionRanges(value, ranges).flatMap((range) => {
    if (range.end <= query.start) return [range];
    if (range.start >= caret)
      return [{ ...range, start: range.start + delta, end: range.end + delta }];
    return [];
  });
  return {
    value: value.slice(0, query.start) + inserted + after,
    mentions: sortRanges([
      ...kept,
      { start: query.start, end: query.start + display.length, mention },
    ]),
    caret: query.start + display.length + 1,
  };
};

/**
 * Backspace/Delete next to a mention removes the whole mention, so a chip
 * never degrades into a partial label. Returns null for ordinary edits.
 */
export const removeAgentMentionAtCaret = (
  value: string,
  ranges: IAgentMentionRange[],
  caret: number,
  key: 'Backspace' | 'Delete',
): (IAgentMentionText & { caret: number }) | null => {
  const valid = validAgentMentionRanges(value, ranges);
  const target = valid.find((range) =>
    key === 'Backspace'
      ? caret > range.start && caret <= range.end
      : caret >= range.start && caret < range.end,
  );
  if (!target) return null;
  const length = target.end - target.start;
  return {
    value: value.slice(0, target.start) + value.slice(target.end),
    mentions: valid.flatMap((range) => {
      if (range === target) return [];
      if (range.start >= target.end)
        return [
          { ...range, start: range.start - length, end: range.end - length },
        ];
      return [range];
    }),
    caret: target.start,
  };
};
