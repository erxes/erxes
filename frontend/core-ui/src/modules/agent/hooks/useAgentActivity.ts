import type { UIMessage } from 'ai';
import { useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';

import { useAgentsConnection } from './useAgentsConnection';
import {
  messageHasPendingSuspension,
  type IUseAgentsChatResult,
} from './useAgentsChat';
import {
  agentActivityState,
  type AgentActivityPhase,
} from '../states/agentActivityState';

// Local predicate, like `utils/agentWorkSteps.ts` — `ai` is ESM-only and
// hooks must stay importable from jest (CJS).
const isToolPart = (part: UIMessage['parts'][number]) =>
  part.type === 'dynamic-tool' || part.type.startsWith('tool-');

const lastAssistantOf = (messages: UIMessage[]): UIMessage | undefined =>
  [...messages].reverse().find((message) => message.role === 'assistant');

/** The last assistant message has a tool call still gathering input. */
const lastAssistantHasRunningTool = (chat: IUseAgentsChatResult): boolean =>
  lastAssistantOf(chat.messages)?.parts.some((part) => {
    const state = (part as { state?: string }).state;
    return (
      isToolPart(part) &&
      (state === 'input-streaming' || state === 'input-available')
    );
  }) ?? false;

const phaseOf = (chat: IUseAgentsChatResult): AgentActivityPhase => {
  if (chat.error) {
    return 'error';
  }

  const lastAssistant = lastAssistantOf(chat.messages);

  if (messageHasPendingSuspension(lastAssistant)) {
    return 'awaiting';
  }

  if (chat.status === 'streaming') {
    return lastAssistantHasRunningTool(chat) ? 'working' : 'thinking';
  }

  if (chat.status === 'submitted') {
    return 'thinking';
  }

  return 'idle';
};

const BUSY_PHASES: ReadonlySet<AgentActivityPhase> = new Set([
  'thinking',
  'working',
]);

/**
 * Writes `agentActivityState` from the side-panel chat: phase, unread
 * replies (a finished turn while the panel is closed counts), error and
 * finish timestamps, and the BYOK connection gate — the signals the
 * top-bar Assistant button uses for its unread indicator. Mounted once with the
 * inner panel and kept alive while the panel is hidden.
 */
export const useAgentActivity = (
  chat: IUseAgentsChatResult,
  panelOpen: boolean,
) => {
  const setActivity = useSetAtom(agentActivityState);
  const { connections, loading } = useAgentsConnection();
  const wasBusyRef = useRef(false);

  const phase = phaseOf(chat);
  const busy = BUSY_PHASES.has(phase);

  useEffect(() => {
    const finishedAt = wasBusyRef.current && !busy ? Date.now() : null;

    wasBusyRef.current = busy;

    setActivity((previous) => ({
      phase,
      // A finished turn the user cannot see counts as unread; opening
      // the panel reads it.
      unread:
        finishedAt !== null && !panelOpen
          ? previous.unread + 1
          : panelOpen
          ? 0
          : previous.unread,
      finishedAt: finishedAt ?? (busy ? null : previous.finishedAt),
      errorAt:
        phase === 'error' && previous.phase !== 'error'
          ? Date.now()
          : previous.errorAt,
      hasConnection: loading ? previous.hasConnection : connections.length > 0,
    }));
  }, [phase, busy, panelOpen, loading, connections.length, setActivity]);
};
