import {
  Message,
  StreamEvent,
  ToolCallInfo,
  TurnPart,
} from '~/modules/chat/types';

// Side effects a stream event can have on the active thread. The store supplies
// these closures (bound to one agent/thread); applyStreamEvent stays a pure
// translation of event → state mutation, so it can be tested with fakes.
export interface ApplyOps {
  // Advance the live assistant bubble in place (append on first call).
  upsertLive: (mutate: (m: Message) => Message) => void;
  appendError: (content: string) => void;
  setActivity: (text: string) => void;
  setSessionTitle: (threadId: string, title: string) => void;
  fallbackThreadId: string;
}

export interface LiveState {
  sawDone: boolean;
  // True once a live assistant bubble has been created this turn. `upsertLive`
  // sets it; the terminal events read it (mirrors the original `live` ref).
  hasLive: boolean;
}

// Any non-thinking event closes the current reasoning burst, so the next
// thinking delta opens a NEW section at the bottom of the turn.
export const closeThinking = (parts?: TurnPart[]): TurnPart[] => {
  const out = (parts ?? []).slice();
  const last = out[out.length - 1];
  if (last?.kind === 'thinking' && !last.done) {
    out[out.length - 1] = { ...last, done: true };
  }
  return out;
};

export const applyStreamEvent = (
  ops: ApplyOps,
  ev: StreamEvent,
  live: LiveState,
): void => {
  switch (ev.type) {
    case 'thinking':
      ops.upsertLive((m) => {
        const parts = (m.parts ?? []).slice();
        const last = parts[parts.length - 1];
        if (last?.kind === 'thinking' && !last.done) {
          parts[parts.length - 1] = {
            ...last,
            text: last.text + (ev.text ?? ''),
          };
        } else {
          parts.push({ kind: 'thinking', text: ev.text ?? '' });
        }
        return { ...m, parts };
      });
      break;
    case 'text':
      ops.upsertLive((m) => ({
        ...m,
        parts: closeThinking(m.parts),
        content: m.content + (ev.text ?? ''),
      }));
      break;
    case 'text_replace':
      ops.upsertLive((m) => ({
        ...m,
        parts: closeThinking(m.parts),
        content: ev.text ?? '',
      }));
      break;
    case 'tool_call':
      ops.upsertLive((m) => ({
        ...m,
        parts: [
          ...closeThinking(m.parts),
          {
            kind: 'tool',
            call: {
              toolCallId: ev.toolCallId,
              toolName: ev.toolName ?? '',
              args: ev.args,
            },
          },
        ],
      }));
      break;
    case 'tool_result':
      ops.upsertLive((m) => {
        const parts = closeThinking(m.parts);
        let idx = -1;
        if (ev.toolCallId) {
          idx = parts.findIndex(
            (p) => p.kind === 'tool' && p.call.toolCallId === ev.toolCallId,
          );
        }
        if (idx < 0) {
          for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            if (p.kind === 'tool' && p.call.result === undefined) {
              idx = i;
              break;
            }
          }
        }
        const patch = { result: ev.result, isError: ev.isError };
        if (idx >= 0) {
          const p = parts[idx] as { kind: 'tool'; call: ToolCallInfo };
          parts[idx] = { kind: 'tool', call: { ...p.call, ...patch } };
        } else {
          parts.push({
            kind: 'tool',
            call: { toolName: ev.toolName ?? '', ...patch },
          });
        }
        return { ...m, parts };
      });
      break;
    case 'done':
      live.sawDone = true;
      if (live.hasLive || ev.reply) {
        ops.upsertLive((m) => ({
          ...m,
          id: ev.messageId || m.id,
          parts: closeThinking(m.parts),
          content: m.content || ev.reply || '',
          streaming: false,
          interrupted: !!ev.interrupted,
        }));
      }
      if (!ev.reply && !ev.interrupted) {
        ops.appendError(
          'The agent returned an empty response. Please try again.',
        );
      }
      break;
    case 'activity':
      if (ev.text) ops.setActivity(ev.text);
      break;
    case 'thread_title':
      // Arrives after `done` while the stream drains — the agent has
      // summarized the conversation into a title.
      if (ev.title)
        ops.setSessionTitle(ev.threadId || ops.fallbackThreadId, ev.title);
      break;
    case 'error':
      live.sawDone = true;
      if (live.hasLive) ops.upsertLive((m) => ({ ...m, streaming: false }));
      ops.appendError(ev.message || 'Agent error');
      break;
  }
};
