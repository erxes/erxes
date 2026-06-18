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
import {
  generateThreadId,
  partsFromMeta,
  randomIdSuffix,
} from '~/modules/chat/utils';
import {
  prependThreadToCache,
  refetchThreadsIntoCache,
  setThreadTitleInCache,
} from '~/modules/chat/threadsCache';
import { readStreamEvents } from '~/modules/chat/lib/streamTransport';
import {
  ApplyOps,
  applyStreamEvent,
  LiveState,
} from '~/modules/chat/lib/applyEvent';

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

  // Replace a message by its stable `_clientId` rather than by position, so an
  // error (or any message) appended between two stream events can't be
  // overwritten by the live bubble's next update. Appends if it's gone (e.g.
  // the first live event, or a thread cleared mid-stream).
  const replaceMessageById = (
    agentKey: string,
    threadId: string,
    clientId: string,
    msg: Message,
  ) => {
    const t = getThread(agentKey, threadId);
    const idx = t.messages.findIndex((m) => m._clientId === clientId);
    if (idx < 0) {
      patchThread(agentKey, threadId, { messages: [...t.messages, msg] });
      return;
    }
    const messages = t.messages.slice();
    messages[idx] = msg;
    patchThread(agentKey, threadId, { messages });
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

    // The live assistant bubble; advanced in place as events arrive. Keyed by a
    // stable client id so its updates land on the same row even if another
    // message is appended mid-stream.
    let live: Message | null = null;
    const liveClientId = `m-${randomIdSuffix(8)}`;
    const liveState: LiveState = { sawDone: false, hasLive: false };

    // Coalesce store writes to one per animation frame. A fast provider emits
    // many tokens per frame; without this the live bubble re-renders (and
    // re-parses its whole growing markdown) on every token, pegging the main
    // thread so streaming stutters. `live` still advances synchronously so each
    // event builds on the latest; only the store write — and the React render
    // it triggers — is throttled to ~60fps. `flushLive` is called synchronously
    // at every terminal point so the final state is never left in the buffer.
    let flushScheduled = false;
    let liveDirty = false;

    const flushLive = () => {
      flushScheduled = false;
      if (!liveDirty || !live) return;
      liveDirty = false;
      // replaceMessageById appends when the row isn't in the store yet (the
      // first flush), so this one call covers both append and in-place update.
      replaceMessageById(agentKey, threadId, liveClientId, live);
      // Bump a monotonic tick so the view can follow streamed output off a
      // single dependency, rather than inferring growth from message contents.
      patchThread(agentKey, threadId, {
        streamTick: (getThread(agentKey, threadId).streamTick ?? 0) + 1,
      });
    };

    const scheduleFlush = () => {
      if (flushScheduled) return;
      flushScheduled = true;
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(flushLive);
      } else {
        setTimeout(flushLive, 16);
      }
    };

    const upsertLive = (mutate: (m: Message) => Message) => {
      const base: Message = live ?? {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true,
        _clientId: liveClientId,
      };
      live = mutate({ ...base, parts: base.parts?.slice() });
      liveState.hasLive = true;
      liveDirty = true;
      scheduleFlush();
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
      setSessionTitle: (tid, title) =>
        setThreadTitleInCache(client, mastraAgentId, tid, title),
      fallbackThreadId: threadId,
    };

    try {
      for await (const ev of readStreamEvents(response)) {
        applyStreamEvent(ops, ev, liveState);
      }
    } catch (err) {
      if (!abort.signal.aborted) {
        // Persist whatever streamed before the failure, then surface the error.
        flushLive();
        throw err;
      }
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

    // Write the final buffered state synchronously — the last events (done /
    // finalize above) may still be sitting in the coalesced frame.
    flushLive();

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
  discardThread: (agentKey: string, threadId: string) =>
    useChatStore.getState().discardThread(agentKey, threadId),
  stop: (agentKey: string, threadId: string) =>
    useChatStore.getState().stop(agentKey, threadId),
  sendMessage: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    message: string,
    attachments?: ChatAttachment[],
    approvedOperations?: ApprovedOp[],
    hidden?: boolean,
  ) =>
    useChatStore
      .getState()
      .sendMessage(
        client,
        agentKey,
        mastraAgentId,
        message,
        attachments,
        approvedOperations,
        hidden,
      ),
};
