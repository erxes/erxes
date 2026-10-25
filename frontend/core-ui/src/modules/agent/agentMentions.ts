import type { UIMessage } from 'ai';
import { z } from 'zod';
import { AGENT_REFERENCE_ID_RE } from './references/parseAgentReferences';
import {
  AGENT_MENTION_TYPES,
  agentMentionsFromText,
  type IAgentMention,
} from './utils/mentionText';

export const AGENTS_MENTIONS_DATA_TYPE = 'data-agents-mentions';
export const AGENTS_MENTION_MAX_PER_TURN = 10;

/** The text keeps one `[[type:id:label]]` token per mention; this list is its
 * structured copy. Keep this wire schema in sync with the other side of the
 * agents REST boundary (core-api `mentions.ts`), which re-reads every record
 * as the signed-in user before the model sees it. */
export const agentMentionSchema = z.object({
  type: z.enum(AGENT_MENTION_TYPES),
  id: z.string().regex(AGENT_REFERENCE_ID_RE),
  label: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .refine((label) => !/[[\]\r\n]/.test(label)),
});

export const agentMentionsSchema = z
  .array(agentMentionSchema)
  .min(1)
  .max(AGENTS_MENTION_MAX_PER_TURN);

export const agentMentionsPart = (
  mentions: IAgentMention[],
): UIMessage['parts'][number] => ({
  type: AGENTS_MENTIONS_DATA_TYPE,
  data: { mentions },
});

/** Mention parts for wire text; empty when the text has no mention tokens. */
export const agentMentionsPartsForText = (text: string): UIMessage['parts'] => {
  const mentions = agentMentionsFromText(text);
  return mentions.length ? [agentMentionsPart(mentions)] : [];
};

export const readAgentMentions = (parts: UIMessage['parts']): IAgentMention[] =>
  parts.flatMap((part) => {
    if (part.type !== AGENTS_MENTIONS_DATA_TYPE || !('data' in part)) return [];
    const result = z
      .object({ mentions: agentMentionsSchema })
      .safeParse(part.data);
    return result.success ? result.data.mentions : [];
  });

/** Stored text with canonical mention tokens; the model-facing text part
 * reads `@Label` plus a verified list instead. */
export const agentMentionsDisplayText = (
  parts: UIMessage['parts'],
): string | undefined => {
  for (const part of parts) {
    if (part.type !== AGENTS_MENTIONS_DATA_TYPE || !('data' in part)) continue;
    const result = z
      .object({ mentions: agentMentionsSchema, displayText: z.string() })
      .safeParse(part.data);
    if (result.success) return result.data.displayText;
  }
  return undefined;
};

/** Replaces a turn's mention part with the mentions of its new text. */
export const withAgentMentionsParts = (
  parts: UIMessage['parts'],
  text: string,
): UIMessage['parts'] => [
  ...parts.filter((part) => part.type !== AGENTS_MENTIONS_DATA_TYPE),
  ...agentMentionsPartsForText(text),
];
