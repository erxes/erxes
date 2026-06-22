import { MessageMeta, TurnPart } from '~/modules/chat/types';

// Rebuild ordered parts from a persisted message's meta. Older messages only
// carry the flat {thinking, toolCalls} aggregates — synthesize a best-effort
// order for those (one thinking section, then the tools).
export const partsFromMeta = (
  meta: MessageMeta | null | undefined,
): TurnPart[] | undefined => {
  if (!meta) return undefined;
  if (Array.isArray(meta.parts) && meta.parts.length) {
    return meta.parts.map((p) =>
      p.kind === 'tool'
        ? { kind: 'tool' as const, call: p.call ?? { toolName: '' } }
        : { kind: 'thinking' as const, text: p.text ?? '', done: true },
    );
  }
  const parts: TurnPart[] = [];
  if (meta.thinking)
    parts.push({ kind: 'thinking', text: meta.thinking, done: true });
  for (const call of meta.toolCalls ?? []) parts.push({ kind: 'tool', call });
  return parts.length ? parts : undefined;
};
