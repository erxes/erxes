import {
  AgentUIMessage,
  DbThreadMessage,
  DbToolCall,
  DbTurnPart,
} from '~/modules/chat/types';

// History hydration: rebuild AI SDK UIMessage parts from a persisted message's
// Mongo `meta` (ordered `parts`, or the flat thinking/toolCalls aggregates on
// older rows). The reverse direction — UIMessage chunks → persisted meta — lives
// in the backend turn pipeline. Replaces the old `partsFromMeta`.

type MessagePart = AgentUIMessage['parts'][number];

// A `dynamic-tool` error part needs a string errorText, so stringify a
// non-string persisted result rather than dropping its detail.
const errorTextOf = (result: unknown): string => {
  if (typeof result === 'string') return result;
  try {
    return JSON.stringify(result) || 'Tool failed';
  } catch {
    return 'Tool failed';
  }
};

// One persisted tool call → a `dynamic-tool` UIMessage part (the erxes tools are
// runtime-registered, so they render via the dynamic-tool variant). The part is
// built per-state so it satisfies the discriminated union.
const toToolPart = (call: DbToolCall, fallbackId: string): MessagePart => {
  const toolCallId = call.toolCallId || fallbackId;
  const base = {
    type: 'dynamic-tool' as const,
    toolName: call.toolName,
    toolCallId,
  };
  if (call.isError) {
    return {
      ...base,
      state: 'output-error',
      input: call.args,
      errorText: errorTextOf(call.result),
    };
  }
  if (call.result !== undefined) {
    return { ...base, state: 'output-available', input: call.args, output: call.result };
  }
  return { ...base, state: 'input-available', input: call.args };
};

// Ordered turn parts from meta, preferring the chronological `parts`; older rows
// only carry the flat aggregates, so synthesize a best-effort order for those
// (one thinking section, then the tools).
const turnParts = (meta: DbThreadMessage['meta']): DbTurnPart[] => {
  if (!meta) return [];
  if (Array.isArray(meta.parts) && meta.parts.length) {
    return meta.parts.map((p) =>
      p.kind === 'tool'
        ? { kind: 'tool' as const, call: p.call ?? { toolName: '' } }
        : { kind: 'thinking' as const, text: p.text ?? '' },
    );
  }
  const parts: DbTurnPart[] = [];
  if (meta.thinking) parts.push({ kind: 'thinking', text: meta.thinking });
  for (const call of meta.toolCalls ?? []) parts.push({ kind: 'tool', call });
  return parts;
};

const assistantParts = (m: DbThreadMessage): MessagePart[] => {
  const parts: MessagePart[] = [];
  turnParts(m.meta).forEach((part, i) => {
    if (part.kind === 'thinking') {
      parts.push({ type: 'reasoning', text: part.text, state: 'done' });
    } else {
      parts.push(toToolPart(part.call, `${m._id}-tool-${i}`));
    }
  });
  if (m.content) parts.push({ type: 'text', text: m.content, state: 'done' });
  return parts;
};

/** Convert persisted thread messages into seed UIMessages for a `Chat`. */
export const metaToUIMessages = (
  messages: DbThreadMessage[],
): AgentUIMessage[] =>
  messages.map((m) => {
    if (m.role === 'user') {
      return {
        id: m._id,
        role: 'user',
        parts: m.content ? [{ type: 'text', text: m.content }] : [],
        metadata: {
          messageId: m._id,
          createdAt: m.createdAt,
          attachments: m.attachments?.length ? m.attachments : undefined,
        },
      };
    }
    return {
      id: m._id,
      role: 'assistant',
      parts: assistantParts(m),
      metadata: {
        messageId: m._id,
        createdAt: m.createdAt,
        interrupted: m.meta?.interrupted || undefined,
      },
    };
  });
