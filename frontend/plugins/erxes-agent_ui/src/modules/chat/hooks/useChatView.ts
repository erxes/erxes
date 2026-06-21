import { useShallow } from 'zustand/react/shallow';
import { AgentChatView, EMPTY_AGENT, EMPTY_THREAD } from '~/modules/chat/types';
import {
  selectAgentActivity,
  selectAgentView,
  selectHasUnread,
  selectIsAgentWorking,
  selectThreadWorking,
  useChatStore,
} from '~/modules/chat/store/chatStore';

const EMPTY_VIEW: AgentChatView = {
  ...EMPTY_AGENT,
  messages: EMPTY_THREAD.messages,
  loading: EMPTY_THREAD.loading,
  messagesLoading: EMPTY_THREAD.messagesLoading,
};

// The active agent's session + conversation view. Re-renders only when this
// agent's slice (sessions / active thread messages / loading) changes.
export const useAgentChatView = (agentId?: string): AgentChatView =>
  useChatStore(
    useShallow((s) => (agentId ? selectAgentView(s, agentId) : EMPTY_VIEW)),
  );

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
