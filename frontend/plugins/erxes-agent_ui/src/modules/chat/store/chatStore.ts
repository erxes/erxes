import { ApolloClient } from '@apollo/client';
import { create } from 'zustand';
import { REACT_APP_API_URL } from 'erxes-ui';
import {
  MASTRA_AGENT_CHAT,
  MASTRA_MESSAGE_FEEDBACKS,
  MASTRA_THREADS,
  MASTRA_THREAD_MESSAGES,
} from '~/graphql/queries';
import {
  MASTRA_MESSAGE_FEEDBACK,
  MASTRA_THREAD_REMOVE,
  MASTRA_THREAD_RENAME,
} from '~/graphql/mutations';
import {
  AgentChatState,
  AgentChatView,
  ChatAttachment,
  EMPTY_AGENT,
  EMPTY_THREAD,
  Message,
  MessageMeta,
  ReasoningEffort,
  REASONING_EFFORT_OPTIONS,
  SessionMeta,
  ThreadChatState,
} from '~/modules/chat/types';
import { generateThreadId, partsFromMeta } from '~/modules/chat/utils';
import { readStreamEvents } from '~/modules/chat/lib/streamTransport';
import {
  ApplyOps,
  applyStreamEvent,
  LiveState,
} from '~/modules/chat/lib/applyEvent';

type Client = ApolloClient<object>;

interface MastraThreadsResponse {
  mastraThreads?: Array<{
    threadId: string;
    title?: string;
    messageCount?: number;
    lastMessageAt?: string;
  }>;
}

interface MastraThreadMessagesResponse {
  mastraThreadMessages?: Array<{
    _id: string;
    role: Message['role'];
    content: string;
    createdAt?: string;
    meta?: MessageMeta;
    attachments?: ChatAttachment[];
  }>;
}

interface MastraMessageFeedbacksResponse {
  mastraMessageFeedbacks?: Record<string, { rating: number }>;
}

interface MastraAgentChatResponse {
  mastraAgentChat?: string | null;
}

const threadKey = (agentKey: string, threadId: string) =>
  `${agentKey}:${threadId}`;

const REASONING_EFFORT_VALUES = REASONING_EFFORT_OPTIONS.map((o) => o.value);

/** localStorage key holding the persisted reasoning choice for one agent. */
const reasoningEffortStorageKey = (agentKey: string) =>
  `erxes-agent:reasoningEffort:${agentKey}`;

// Best-effort read of the persisted choice — localStorage may be unavailable
// (private mode / SSR) and may hold stale values from an older enum.
const loadReasoningEffort = (agentKey: string): ReasoningEffort | undefined => {
  try {
    const raw = localStorage.getItem(reasoningEffortStorageKey(agentKey));
    return raw && REASONING_EFFORT_VALUES.includes(raw as ReasoningEffort)
      ? (raw as ReasoningEffort)
      : undefined;
  } catch {
    return undefined;
  }
};

// DB-backed chat store. Sessions (threads) and their messages live in MongoDB
// via the erxes-agent_api plugin; this store mirrors them in memory for the UI.
// Replies stream over SSE through the gateway plugin proxy, falling back to the
// blocking GraphQL query when the stream transport is unavailable.
interface ChatStoreState {
  agents: Record<string, AgentChatState>;
  threads: Record<string, ThreadChatState>;
  unreadAgents: string[];
  currentViewedAgentId?: string;

  setCurrentAgent: (agentId: string | undefined) => void;
  markRead: (agentKey: string) => void;
  setReasoningEffort: (
    agentKey: string,
    effort: ReasoningEffort | undefined,
  ) => void;
  newDraft: (agentKey: string) => void;
  loadSessions: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
  ) => Promise<void>;
  selectSession: (
    client: Client,
    agentKey: string,
    threadId: string,
  ) => Promise<void>;
  rateMessage: (
    client: Client,
    agentKey: string,
    threadId: string,
    messageId: string,
    rating: 1 | -1,
  ) => Promise<void>;
  renameSession: (
    client: Client,
    agentKey: string,
    threadId: string,
    title: string,
  ) => Promise<void>;
  deleteSession: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    threadId: string,
  ) => Promise<void>;
  stop: (agentKey: string, threadId: string) => void;
  sendMessage: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    message: string,
    attachments?: ChatAttachment[],
  ) => Promise<void>;
}

export const useChatStore = create<ChatStoreState>((set, get) => {
  const getThread = (agentKey: string, threadId: string): ThreadChatState =>
    get().threads[threadKey(agentKey, threadId)] ?? EMPTY_THREAD;

  const ensureAgent = (agentKey: string): AgentChatState =>
    get().agents[agentKey] ?? EMPTY_AGENT;

  const patchAgent = (agentKey: string, partial: Partial<AgentChatState>) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [agentKey]: { ...(s.agents[agentKey] ?? EMPTY_AGENT), ...partial },
      },
    }));

  const patchThread = (
    agentKey: string,
    threadId: string,
    partial: Partial<ThreadChatState>,
  ) =>
    set((s) => {
      const key = threadKey(agentKey, threadId);
      return {
        threads: {
          ...s.threads,
          [key]: { ...(s.threads[key] ?? EMPTY_THREAD), ...partial },
        },
      };
    });

  const appendMessage = (agentKey: string, threadId: string, msg: Message) => {
    const t = getThread(agentKey, threadId);
    patchThread(agentKey, threadId, { messages: [...t.messages, msg] });
  };

  const replaceLastMessage = (
    agentKey: string,
    threadId: string,
    msg: Message,
  ) => {
    const t = getThread(agentKey, threadId);
    patchThread(agentKey, threadId, {
      messages: t.messages.slice(0, -1).concat(msg),
    });
  };

  // Local-only title update — used when the server pushes an auto-generated
  // title over the stream (the server already persisted it).
  const setSessionTitle = (
    agentKey: string,
    threadId: string,
    title: string,
  ) => {
    const agent = ensureAgent(agentKey);
    if (!agent.sessions.some((s) => s.threadId === threadId)) return;
    patchAgent(agentKey, {
      sessions: agent.sessions.map((s) =>
        s.threadId === threadId ? { ...s, title } : s,
      ),
    });
  };

  const hydrateFeedbacks = async (
    client: Client,
    agentKey: string,
    threadId: string,
  ) => {
    try {
      const { data } = await client.query<MastraMessageFeedbacksResponse>({
        query: MASTRA_MESSAGE_FEEDBACKS,
        variables: { threadId },
        fetchPolicy: 'network-only',
      });
      const byMessage = data?.mastraMessageFeedbacks ?? {};
      if (!Object.keys(byMessage).length) return;
      const thread = getThread(agentKey, threadId);
      patchThread(agentKey, threadId, {
        messages: thread.messages.map((m) =>
          m.id && byMessage[m.id]
            ? { ...m, rating: byMessage[m.id].rating }
            : m,
        ),
      });
    } catch {
      // ignore — thumbs just render unselected
    }
  };

  // Mark the turn persisted: refresh sessions (titles/ordering/counts) and flag
  // unread when the user is looking at another agent.
  const finishTurn = (
    client: Client,
    agentKey: string,
    threadId: string,
    mastraAgentId: string,
  ) => {
    if (get().currentViewedAgentId !== agentKey) {
      set((s) =>
        s.unreadAgents.includes(agentKey)
          ? s
          : { unreadAgents: [...s.unreadAgents, agentKey] },
      );
    }
    const agent = ensureAgent(agentKey);
    if (agent.activeThreadId === threadId && agent.isDraft) {
      patchAgent(agentKey, { isDraft: false });
    }
    void get().loadSessions(client, agentKey, mastraAgentId);
  };

  // Legacy blocking transport — single GraphQL query, no intermediate events.
  const sendViaQuery = async (
    client: Client,
    agentKey: string,
    threadId: string,
    mastraAgentId: string,
    message: string,
  ) => {
    const result = await client.query<MastraAgentChatResponse>({
      query: MASTRA_AGENT_CHAT,
      variables: { agentId: mastraAgentId, message, threadId },
      fetchPolicy: 'no-cache',
    });

    const gqlErrors = result.errors;
    const reply = result?.data?.mastraAgentChat ?? null;

    if (gqlErrors?.length) {
      appendMessage(agentKey, threadId, {
        role: 'error',
        content: gqlErrors[0].message,
        timestamp: new Date(),
      });
    } else if (reply) {
      appendMessage(agentKey, threadId, {
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      });
    } else {
      appendMessage(agentKey, threadId, {
        role: 'error',
        content: 'The agent returned an empty response. Please try again.',
        timestamp: new Date(),
      });
    }
  };

  // Stream the reply over SSE. Returns false when the endpoint is unreachable
  // before any event arrived (caller falls back to GraphQL); throws on errors
  // the user should see.
  const sendViaStream = async (
    agentKey: string,
    threadId: string,
    mastraAgentId: string,
    message: string,
    abort: AbortController,
    attachments?: ChatAttachment[],
    reasoningEffort?: ReasoningEffort,
  ): Promise<boolean> => {
    let response: Response;
    try {
      response = await fetch(
        `${REACT_APP_API_URL}/pl:erxes-agent/chat/stream`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: mastraAgentId,
            message,
            threadId,
            attachments: attachments?.length ? attachments : undefined,
            reasoningEffort: reasoningEffort || undefined,
          }),
          signal: abort.signal,
        },
      );
    } catch {
      if (abort.signal.aborted) return true; // user stopped before transport settled
      return false; // network-level failure — try the GraphQL fallback
    }

    if (!response.ok || !response.body) {
      if (response.status === 401) throw new Error('Login required');
      if (response.status === 400) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'The agent rejected this message.');
      }
      return false;
    }

    // The live assistant bubble; advanced in place as events arrive.
    let live: Message | null = null;
    const liveState: LiveState = { sawDone: false, hasLive: false };

    const upsertLive = (mutate: (m: Message) => Message) => {
      const base: Message = live ?? {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true,
      };
      const next = mutate({ ...base, parts: base.parts?.slice() });
      if (live) replaceLastMessage(agentKey, threadId, next);
      else appendMessage(agentKey, threadId, next);
      live = next;
      liveState.hasLive = true;
    };

    const ops: ApplyOps = {
      upsertLive,
      appendError: (content) =>
        appendMessage(agentKey, threadId, {
          role: 'error',
          content,
          timestamp: new Date(),
        }),
      setActivity: (text) =>
        patchThread(agentKey, threadId, { activity: text }),
      setSessionTitle: (tid, title) => setSessionTitle(agentKey, tid, title),
      fallbackThreadId: threadId,
    };

    try {
      for await (const ev of readStreamEvents(response)) {
        applyStreamEvent(ops, ev, liveState);
      }
    } catch (err) {
      if (!abort.signal.aborted) throw err;
    }

    // User pressed stop, or the connection dropped mid-stream: finalize what we
    // have so the partial reply stays visible.
    if (!liveState.sawDone && live) {
      upsertLive((m) => ({
        ...m,
        streaming: false,
        interrupted: abort.signal.aborted,
      }));
    }
    if (!liveState.sawDone && !live && !abort.signal.aborted) {
      throw new Error(
        'The connection to the agent was lost. Please try again.',
      );
    }

    return true;
  };

  return {
    agents: {},
    threads: {},
    unreadAgents: [],
    currentViewedAgentId: undefined,

    setCurrentAgent: (agentId) => {
      set({ currentViewedAgentId: agentId });
      if (agentId) get().markRead(agentId);
    },

    markRead: (agentKey) =>
      set((s) =>
        s.unreadAgents.includes(agentKey)
          ? { unreadAgents: s.unreadAgents.filter((a) => a !== agentKey) }
          : s,
      ),

    // Persist the power-user reasoning choice for this agent's chat view.
    setReasoningEffort: (agentKey, effort) => {
      try {
        const key = reasoningEffortStorageKey(agentKey);
        if (effort) localStorage.setItem(key, effort);
        else localStorage.removeItem(key);
      } catch {
        // localStorage unavailable — the in-memory patch below still applies.
      }
      patchAgent(agentKey, { reasoningEffort: effort });
    },

    newDraft: (agentKey) => {
      const threadId = generateThreadId();
      patchAgent(agentKey, { activeThreadId: threadId, isDraft: true });
      patchThread(agentKey, threadId, { messages: [], loading: false });
    },

    loadSessions: async (client, agentKey, mastraAgentId) => {
      try {
        const { data } = await client.query<MastraThreadsResponse>({
          query: MASTRA_THREADS,
          variables: { agentId: mastraAgentId },
          fetchPolicy: 'network-only',
        });
        const sessions: SessionMeta[] = (data?.mastraThreads ?? []).map(
          (t) => ({
            threadId: t.threadId,
            title: t.title || 'New chat',
            messageCount: t.messageCount ?? 0,
            lastMessageAt: t.lastMessageAt,
          }),
        );

        const before = ensureAgent(agentKey);
        patchAgent(agentKey, { sessions, sessionsLoaded: true });

        if (!before.activeThreadId) {
          if (sessions.length > 0) {
            await get().selectSession(client, agentKey, sessions[0].threadId);
          } else {
            get().newDraft(agentKey);
          }
        }
      } catch {
        patchAgent(agentKey, { sessionsLoaded: true });
      }
    },

    selectSession: async (client, agentKey, threadId) => {
      patchAgent(agentKey, { activeThreadId: threadId, isDraft: false });

      const existing = getThread(agentKey, threadId);
      if (existing.loading) return; // never clobber a streaming thread

      patchThread(agentKey, threadId, { messagesLoading: true });
      try {
        const { data } = await client.query<MastraThreadMessagesResponse>({
          query: MASTRA_THREAD_MESSAGES,
          variables: { threadId },
          fetchPolicy: 'network-only',
        });
        const messages: Message[] = (data?.mastraThreadMessages ?? []).map(
          (m) => ({
            id: m._id,
            role: m.role,
            content: m.content,
            timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
            parts: partsFromMeta(m.meta),
            attachments:
              Array.isArray(m.attachments) && m.attachments.length
                ? m.attachments
                : undefined,
            interrupted: m.meta?.interrupted || undefined,
          }),
        );
        patchThread(agentKey, threadId, { messages, messagesLoading: false });
        void hydrateFeedbacks(client, agentKey, threadId);
      } catch {
        patchThread(agentKey, threadId, { messagesLoading: false });
      }
    },

    rateMessage: async (client, agentKey, threadId, messageId, rating) => {
      const thread = getThread(agentKey, threadId);
      patchThread(agentKey, threadId, {
        messages: thread.messages.map((m) =>
          m.id === messageId ? { ...m, rating } : m,
        ),
      });
      try {
        await client.mutate({
          mutation: MASTRA_MESSAGE_FEEDBACK,
          variables: { messageId, rating },
        });
      } catch {
        patchThread(agentKey, threadId, {
          messages: getThread(agentKey, threadId).messages.map((m) =>
            m.id === messageId ? { ...m, rating: undefined } : m,
          ),
        });
      }
    },

    renameSession: async (client, agentKey, threadId, title) => {
      const agent = ensureAgent(agentKey);
      patchAgent(agentKey, {
        sessions: agent.sessions.map((s) =>
          s.threadId === threadId ? { ...s, title } : s,
        ),
      });
      try {
        await client.mutate({
          mutation: MASTRA_THREAD_RENAME,
          variables: { threadId, title },
        });
      } catch {
        // best-effort; optimistic update already applied
      }
    },

    deleteSession: async (client, agentKey, mastraAgentId, threadId) => {
      try {
        await client.mutate({
          mutation: MASTRA_THREAD_REMOVE,
          variables: { threadId },
        });
      } catch {
        return;
      }

      getThread(agentKey, threadId).abort?.abort();
      set((s) => {
        const next = { ...s.threads };
        delete next[threadKey(agentKey, threadId)];
        return { threads: next };
      });

      const agent = ensureAgent(agentKey);
      const remaining = agent.sessions.filter((s) => s.threadId !== threadId);
      patchAgent(agentKey, { sessions: remaining });

      if (agent.activeThreadId === threadId) {
        if (remaining.length > 0) {
          await get().selectSession(client, agentKey, remaining[0].threadId);
        } else {
          get().newDraft(agentKey);
        }
      }
    },

    stop: (agentKey, threadId) => {
      getThread(agentKey, threadId).abort?.abort();
    },

    sendMessage: async (
      client,
      agentKey,
      mastraAgentId,
      message,
      attachments,
    ) => {
      let agent = ensureAgent(agentKey);
      if (!agent.activeThreadId) {
        get().newDraft(agentKey);
        agent = ensureAgent(agentKey);
      }
      const threadId = agent.activeThreadId!;
      const reasoningEffort =
        agent.reasoningEffort ?? loadReasoningEffort(agentKey);

      // Surface the session in the sidebar the instant the first message is
      // sent — don't wait for the turn to finish. The backend registers + tags
      // the thread at turn start (so a refresh keeps it); this mirrors it into
      // the list optimistically. The streamed thread_title event fills the real
      // title, and loadSessions in finishTurn reconciles title/count/order.
      if (!agent.sessions.some((s) => s.threadId === threadId)) {
        patchAgent(agentKey, {
          sessions: [
            { threadId, title: 'New chat', messageCount: 0 },
            ...agent.sessions,
          ],
          isDraft: false,
        });
      }

      appendMessage(agentKey, threadId, {
        role: 'user',
        content: message,
        timestamp: new Date(),
        attachments: attachments?.length ? attachments : undefined,
      });

      const abort = new AbortController();
      patchThread(agentKey, threadId, { loading: true, abort });

      try {
        const streamed = await sendViaStream(
          agentKey,
          threadId,
          mastraAgentId,
          message,
          abort,
          attachments,
          reasoningEffort,
        );
        if (!streamed) {
          await sendViaQuery(
            client,
            agentKey,
            threadId,
            mastraAgentId,
            message,
          );
        }
        finishTurn(client, agentKey, threadId, mastraAgentId);
      } catch (err) {
        appendMessage(agentKey, threadId, {
          role: 'error',
          content:
            (err as Error)?.message ??
            'Failed to reach the agent. Check your connection and try again.',
          timestamp: new Date(),
        });
      } finally {
        patchThread(agentKey, threadId, {
          loading: false,
          abort: undefined,
          activity: undefined,
        });
      }
    },
  };
});

// ── Selectors (granular reactive reads) ─────────────────────────────────────

export const selectAgentView = (
  s: ChatStoreState,
  agentKey: string,
): AgentChatView => {
  const agent = s.agents[agentKey] ?? EMPTY_AGENT;
  const thread = agent.activeThreadId
    ? (s.threads[threadKey(agentKey, agent.activeThreadId)] ?? EMPTY_THREAD)
    : EMPTY_THREAD;
  return {
    ...agent,
    // Surface the persisted choice even before the agent state is created.
    reasoningEffort: agent.reasoningEffort ?? loadReasoningEffort(agentKey),
    messages: thread.messages,
    loading: thread.loading,
    messagesLoading: thread.messagesLoading,
  };
};

export const selectIsAgentWorking = (
  s: ChatStoreState,
  agentKey: string,
): boolean => {
  const prefix = `${agentKey}:`;
  return Object.entries(s.threads).some(
    ([key, t]) => t.loading && key.startsWith(prefix),
  );
};

export const selectThreadWorking = (
  s: ChatStoreState,
  agentKey: string,
  threadId: string,
): boolean =>
  (s.threads[threadKey(agentKey, threadId)] ?? EMPTY_THREAD).loading;

// One-line summary of what the agent is doing right now. Prefers the
// server-pushed `activity` events; falls back to coarse phase labels until the
// first summary arrives or on older backends.
export const selectAgentActivity = (
  s: ChatStoreState,
  agentKey: string,
): string | undefined => {
  const prefix = `${agentKey}:`;
  for (const [key, t] of Object.entries(s.threads)) {
    if (!t.loading || !key.startsWith(prefix)) continue;
    if (t.activity) return t.activity;
    const last = t.messages[t.messages.length - 1];
    if (!last || last.role !== 'assistant') return 'Waiting for the agent…';
    const part = last.parts?.[last.parts.length - 1];
    if (part?.kind === 'tool' && part.call.result === undefined) {
      return `Running ${part.call.toolName}…`;
    }
    if (part?.kind === 'thinking' && !part.done) return 'Thinking…';
    if (last.content) return 'Writing a reply…';
    return 'Working…';
  }
  return undefined;
};

export const selectHasUnread = (s: ChatStoreState, agentKey: string): boolean =>
  s.unreadAgents.includes(agentKey);

// Imperative facade so call sites keep reading `chatStore.x(...)` while reactive
// reads move to the hooks in ./hooks. Methods delegate to the live store.
export const chatStore = {
  getState: (agentKey: string) =>
    selectAgentView(useChatStore.getState(), agentKey),
  hasUnread: (agentKey: string) =>
    selectHasUnread(useChatStore.getState(), agentKey),
  hasAnyActivity: () => useChatStore.getState().unreadAgents.length > 0,
  isAgentWorking: (agentKey: string) =>
    selectIsAgentWorking(useChatStore.getState(), agentKey),
  getAgentActivity: (agentKey: string) =>
    selectAgentActivity(useChatStore.getState(), agentKey),
  isThreadWorking: (agentKey: string, threadId: string) =>
    selectThreadWorking(useChatStore.getState(), agentKey, threadId),
  setCurrentAgent: (agentId: string | undefined) =>
    useChatStore.getState().setCurrentAgent(agentId),
  markRead: (agentKey: string) => useChatStore.getState().markRead(agentKey),
  setReasoningEffort: (agentKey: string, effort: ReasoningEffort | undefined) =>
    useChatStore.getState().setReasoningEffort(agentKey, effort),
  newDraft: (agentKey: string) => useChatStore.getState().newDraft(agentKey),
  loadSessions: (client: Client, agentKey: string, mastraAgentId: string) =>
    useChatStore.getState().loadSessions(client, agentKey, mastraAgentId),
  selectSession: (client: Client, agentKey: string, threadId: string) =>
    useChatStore.getState().selectSession(client, agentKey, threadId),
  rateMessage: (
    client: Client,
    agentKey: string,
    threadId: string,
    messageId: string,
    rating: 1 | -1,
  ) =>
    useChatStore
      .getState()
      .rateMessage(client, agentKey, threadId, messageId, rating),
  renameSession: (
    client: Client,
    agentKey: string,
    threadId: string,
    title: string,
  ) => useChatStore.getState().renameSession(client, agentKey, threadId, title),
  deleteSession: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    threadId: string,
  ) =>
    useChatStore
      .getState()
      .deleteSession(client, agentKey, mastraAgentId, threadId),
  stop: (agentKey: string, threadId: string) =>
    useChatStore.getState().stop(agentKey, threadId),
  sendMessage: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    message: string,
    attachments?: ChatAttachment[],
  ) =>
    useChatStore
      .getState()
      .sendMessage(client, agentKey, mastraAgentId, message, attachments),
};
