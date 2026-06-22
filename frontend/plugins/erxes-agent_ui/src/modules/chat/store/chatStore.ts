import { ApolloClient } from '@apollo/client';
import { create } from 'zustand';
import { REACT_APP_API_URL } from 'erxes-ui';
import {
  MASTRA_AGENT_CHAT,
  MASTRA_MESSAGE_FEEDBACKS,
  MASTRA_THREAD_MESSAGES,
} from '~/graphql/queries';
import { MASTRA_MESSAGE_FEEDBACK } from '~/graphql/mutations';
import {
  AgentChatState,
  AgentChatView,
  ChatAttachment,
  ApprovedOp,
  EMPTY_AGENT,
  EMPTY_THREAD,
  Message,
  MessageMeta,
  ReasoningEffort,
  REASONING_EFFORT_OPTIONS,
  ThreadChatState,
} from '~/modules/chat/types';
import { generateThreadId, randomIdSuffix } from '~/modules/chat/lib/ids';
import { partsFromMeta } from '~/modules/chat/lib/messageParts';
import {
  prependThreadToCache,
  refetchThreadsIntoCache,
  setThreadTitleInCache,
} from '~/modules/chat/threadsCache';
import { runStream } from '~/modules/chat/lib/runStream';

type Client = ApolloClient<object>;

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

const REASONING_EFFORT_VALUES: readonly string[] = REASONING_EFFORT_OPTIONS.map(
  (o) => o.value,
);

const isReasoningEffort = (v: unknown): v is ReasoningEffort =>
  typeof v === 'string' && REASONING_EFFORT_VALUES.includes(v);

/** localStorage key holding the persisted reasoning choice for one agent. */
const reasoningEffortStorageKey = (agentKey: string) =>
  `erxes-agent:reasoningEffort:${agentKey}`;

// Best-effort read of the persisted choice — localStorage may be unavailable
// (private mode / SSR) and may hold stale values from an older enum. Read once
// at agent-slice creation (setCurrentAgent), never inside a reactive selector.
const loadReasoningEffort = (agentKey: string): ReasoningEffort | undefined => {
  try {
    const raw = localStorage.getItem(reasoningEffortStorageKey(agentKey));
    return isReasoningEffort(raw) ? raw : undefined;
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
  // Drop a removed thread's local streaming/message state. The cached session
  // list is filtered by useRemoveMastraThread; this only clears store-side state.
  discardThread: (agentKey: string, threadId: string) => void;
  stop: (agentKey: string, threadId: string) => void;
  sendMessage: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    message: string,
    attachments?: ChatAttachment[],
    approvedOperations?: ApprovedOp[],
    // Don't render a user bubble for this send (used by approve/deny — the turn
    // continues without a visible "Approved" message).
    hidden?: boolean,
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

  // Atomically claim a thread for a new turn: check `loading` and set it true in
  // one synchronous step. Returns false when the thread is already streaming, so
  // a concurrent send (regenerate, suggestion, double Enter) can't slip past the
  // guard in the window before `loading` would otherwise be set.
  const claimThread = (agentKey: string, threadId: string): boolean => {
    const key = threadKey(agentKey, threadId);
    if ((get().threads[key] ?? EMPTY_THREAD).loading) return false;
    patchThread(agentKey, threadId, { loading: true });
    return true;
  };

  const appendMessage = (
    agentKey: string,
    threadId: string,
    msg: Omit<Message, '_clientId'> & { _clientId?: string },
  ) => {
    const t = getThread(agentKey, threadId);
    const withId: Message = {
      ...msg,
      _clientId: msg._clientId ?? `m-${randomIdSuffix(8)}`,
    };
    patchThread(agentKey, threadId, { messages: [...t.messages, withId] });
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

  // Mark the turn persisted: reconcile the cached session list
  // (titles/ordering/counts + the real _id) and flag unread when the user is
  // looking at another agent.
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
    void refetchThreadsIntoCache(client, mastraAgentId);
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
    client: Client,
    agentKey: string,
    threadId: string,
    mastraAgentId: string,
    message: string,
    abort: AbortController,
    attachments?: ChatAttachment[],
    reasoningEffort?: ReasoningEffort,
    approvedOperations?: ApprovedOp[],
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
            approvedOperations: approvedOperations?.length
              ? approvedOperations
              : undefined,
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

    await runStream(response, threadId, abort, {
      // Fold the live-bubble write and the streamTick bump into a single store
      // update so a flush re-renders the view once per frame, not twice.
      commitLive: (clientId, msg) =>
        set((s) => {
          const key = threadKey(agentKey, threadId);
          const prev = s.threads[key] ?? EMPTY_THREAD;
          const idx = prev.messages.findIndex((m) => m._clientId === clientId);
          const messages =
            idx < 0
              ? [...prev.messages, msg]
              : prev.messages.map((m, i) => (i === idx ? msg : m));
          return {
            threads: {
              ...s.threads,
              [key]: {
                ...prev,
                messages,
                streamTick: (prev.streamTick ?? 0) + 1,
              },
            },
          };
        }),
      appendError: (content) =>
        appendMessage(agentKey, threadId, {
          role: 'error',
          content,
          timestamp: new Date(),
        }),
      setActivity: (text) =>
        patchThread(agentKey, threadId, { activity: text }),
      setSessionTitle: (tid, title) =>
        setThreadTitleInCache(client, mastraAgentId, tid, title),
    });

    return true;
  };

  return {
    agents: {},
    threads: {},
    unreadAgents: [],
    currentViewedAgentId: undefined,

    setCurrentAgent: (agentId) => {
      set({ currentViewedAgentId: agentId });
      if (agentId) {
        get().markRead(agentId);
        // Hydrate the persisted reasoning choice exactly once, when this
        // agent's slice first comes into view. Reads localStorage a single
        // time so the reactive selector never has to.
        if (!get().agents[agentId]) {
          patchAgent(agentId, {
            reasoningEffort: loadReasoningEffort(agentId),
          });
        }
      }
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
            _clientId: m._id || `m-${randomIdSuffix(8)}`,
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

    discardThread: (agentKey, threadId) => {
      getThread(agentKey, threadId).abort?.abort();
      set((s) => {
        const next = { ...s.threads };
        delete next[threadKey(agentKey, threadId)];
        return { threads: next };
      });
      // Drop the active selection so the view's bootstrap effect re-selects the
      // next session (or opens a fresh draft) from the now-filtered cached list.
      if (ensureAgent(agentKey).activeThreadId === threadId) {
        patchAgent(agentKey, { activeThreadId: undefined, isDraft: false });
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
      approvedOperations,
      hidden,
    ) => {
      let agent = ensureAgent(agentKey);
      if (!agent.activeThreadId) {
        get().newDraft(agentKey);
        agent = ensureAgent(agentKey);
      }
      const threadId = agent.activeThreadId!;
      const reasoningEffort = agent.reasoningEffort;

      // Never start a second stream on a thread that's already streaming — a
      // concurrent send (regenerate, suggestion, double Enter) would overwrite
      // the in-flight AbortController, orphaning the first stream so it can no
      // longer be stopped and letting two replies interleave into one bubble.
      // claimThread checks-and-sets `loading` in one synchronous step so the
      // guard holds even though `abort` is attached further down.
      if (!claimThread(agentKey, threadId)) return;

      // Surface the session in the sidebar the instant the first message is
      // sent — don't wait for the turn to finish. The backend registers + tags
      // the thread at turn start (so a refresh keeps it); this mirrors it into
      // the cached list optimistically. The streamed thread_title event fills
      // the real title, and the finishTurn refetch reconciles title/count/order
      // and the real _id into the same cached query.
      prependThreadToCache(client, mastraAgentId, threadId);
      if (agent.isDraft) patchAgent(agentKey, { isDraft: false });

      if (!hidden) {
        appendMessage(agentKey, threadId, {
          role: 'user',
          content: message,
          timestamp: new Date(),
          attachments: attachments?.length ? attachments : undefined,
        });
      }

      const abort = new AbortController();
      patchThread(agentKey, threadId, { abort });

      try {
        const streamed = await sendViaStream(
          client,
          agentKey,
          threadId,
          mastraAgentId,
          message,
          abort,
          attachments,
          reasoningEffort,
          approvedOperations,
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
    messages: thread.messages,
    loading: thread.loading,
    messagesLoading: thread.messagesLoading,
    streamTick: thread.streamTick,
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

// The store actions exposed verbatim on the imperative facade (same name, same
// signature). Selectors below are kept separate because they compose/rename.
type StoreActionKey =
  | 'setCurrentAgent'
  | 'markRead'
  | 'setReasoningEffort'
  | 'newDraft'
  | 'selectSession'
  | 'rateMessage'
  | 'discardThread'
  | 'stop'
  | 'sendMessage';

type StoreActions = Pick<ChatStoreState, StoreActionKey>;

const ACTION_KEYS: StoreActionKey[] = [
  'setCurrentAgent',
  'markRead',
  'setReasoningEffort',
  'newDraft',
  'selectSession',
  'rateMessage',
  'discardThread',
  'stop',
  'sendMessage',
];

// Each action delegates to the live store rather than being hand-forwarded, so
// adding/changing a store action only touches ACTION_KEYS above.
const actionForwarders = Object.fromEntries(
  ACTION_KEYS.map((key) => [
    key,
    (...args: unknown[]) =>
      (useChatStore.getState()[key] as (...a: unknown[]) => unknown)(...args),
  ]),
) as StoreActions;

// Imperative facade so call sites keep reading `chatStore.x(...)` while reactive
// reads move to the hooks in ./hooks. Selectors compose getState(); actions
// delegate to the live store via actionForwarders.
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
  ...actionForwarders,
};
