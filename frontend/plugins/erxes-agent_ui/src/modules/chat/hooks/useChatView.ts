import { useShallow } from 'zustand/react/shallow';
import { useChat } from '@ai-sdk/react';
import { AgentChatState, AgentUIMessage } from '~/modules/chat/types';
import {
  selectActiveChat,
  selectAgentActivity,
  selectAgentShell,
  selectHasUnread,
  selectIsAgentWorking,
  selectThreadHydrating,
  selectThreadWorking,
  useChatStore,
} from '~/modules/chat/store/chatStore';

// What the conversation view renders: the agent's shell state plus the active
// thread's live message state, read straight off the bound AI SDK `Chat`.
export interface AgentChatView extends AgentChatState {
  messages: AgentUIMessage[];
  loading: boolean; // a turn is in flight (submitted / streaming)
  messagesLoading: boolean; // hydrating this thread's history from the DB
  error?: Error;
}

// The active agent's session + conversation view. `useChat` binds to the active
// thread's Chat (or a shared empty one), so messages/status re-render granularly
// without the heavy array ever passing through zustand.
export const useAgentChatView = (agentId?: string): AgentChatView => {
  const key = agentId ?? '';
  const shell = useChatStore(useShallow((s) => selectAgentShell(s, key)));
  const chat = useChatStore((s) => selectActiveChat(s, key));
  const messagesLoading = useChatStore((s) => selectThreadHydrating(s, key));
  const { messages, status, error } = useChat({
    chat,
    experimental_throttle: 50,
  });
  return {
    ...shell,
    messages,
    loading: status === 'submitted' || status === 'streaming',
    messagesLoading,
    error,
  };
};

export const useAgentWorking = (agentId: string): boolean =>
  useChatStore((s) => selectIsAgentWorking(s, agentId));

export const useAgentUnread = (agentId: string): boolean =>
  useChatStore((s) => selectHasUnread(s, agentId));

export const useAgentActivity = (agentId: string): string | undefined =>
  useChatStore((s) => selectAgentActivity(s, agentId));

export const useThreadWorking = (agentId: string, threadId: string): boolean =>
  useChatStore((s) => selectThreadWorking(s, agentId, threadId));

export const useHasAnyActivity = (): boolean =>
  useChatStore((s) => s.unreadAgents.length > 0);
