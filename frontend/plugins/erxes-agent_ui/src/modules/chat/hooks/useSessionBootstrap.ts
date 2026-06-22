import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IMastraThread } from '~/modules/chat/types';
import { chatStore, useChatStore } from '~/modules/chat/store/chatStore';

// Owns the session state-machine that used to live in ChatPage's effects: slug→id
// redirect, ?thread= deep-link, current-agent tracking, and bootstrapping /
// re-homing the active session ("pick the most-recent thread or open a draft").
// Keeps that business logic out of the view; ChatPage retains only view-local
// effects (scroll-pin, focus, textarea autogrow).
export const useSessionBootstrap = (
  selectedAgent: { _id: string; agentId: string } | null,
  threads: IMastraThread[],
  sessionsLoaded: boolean,
) => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const [searchParams] = useSearchParams();

  const activeThreadId = useChatStore((s) =>
    agentId ? s.agents[agentId]?.activeThreadId : undefined,
  );
  const threadParam = searchParams.get('thread');
  const mastraAgentId = selectedAgent?.agentId;

  // Slug routes normalize to the _id route so the chat store stays keyed by _id.
  useEffect(() => {
    if (selectedAgent && agentId && selectedAgent._id !== agentId) {
      const search = searchParams.toString();
      navigate(
        `/erxes-agent/chat/${selectedAgent._id}${search ? `?${search}` : ''}`,
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent?._id, agentId]);

  // Deep link: ?thread=<id> opens that session once sessions have loaded.
  useEffect(() => {
    if (!agentId || !mastraAgentId || !threadParam || !sessionsLoaded) return;
    if (threadParam !== activeThreadId) {
      chatStore.selectSession(apolloClient, agentId, mastraAgentId, threadParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, mastraAgentId, threadParam, sessionsLoaded]);

  // Track the viewed agent (clears its unread badge); clear on navigate away.
  useEffect(() => {
    chatStore.setCurrentAgent(agentId);
    return () => chatStore.setCurrentAgent(undefined);
  }, [agentId]);

  // Bootstrap / re-home the active session: once the cached list has loaded and
  // nothing is selected (first open of this agent, or after deleting the active
  // session), open the most recent session or a fresh draft.
  useEffect(() => {
    if (
      !agentId ||
      !selectedAgent ||
      !mastraAgentId ||
      !sessionsLoaded ||
      activeThreadId
    )
      return;
    if (threads.length > 0) {
      chatStore.selectSession(
        apolloClient,
        agentId,
        mastraAgentId,
        threads[0].threadId,
      );
    } else {
      chatStore.newDraft(apolloClient, agentId, mastraAgentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, mastraAgentId, sessionsLoaded, activeThreadId, threads]);
};
