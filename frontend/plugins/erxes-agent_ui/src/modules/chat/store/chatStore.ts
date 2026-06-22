import { ApolloClient } from '@apollo/client';
import { Chat } from '@ai-sdk/react';
import type { ChatStatus } from 'ai';
import { create } from 'zustand';
import {
  MASTRA_MESSAGE_FEEDBACKS,
  MASTRA_THREAD_MESSAGES,
} from '~/graphql/queries';
import { MASTRA_MESSAGE_FEEDBACK } from '~/graphql/mutations';
import {
  AgentChatState,
  AgentUIMessage,
  ApprovedOp,
  ChatAttachment,
  DbThreadMessage,
  EMPTY_AGENT,
  ReasoningEffort,
  REASONING_EFFORT_OPTIONS,
} from '~/modules/chat/types';
import { generateThreadId } from '~/modules/chat/lib/ids';
import { messageText } from '~/modules/chat/lib/uiParts';
import { metaToUIMessages } from '~/modules/chat/lib/messageMapping';
import { createChatTransport } from '~/modules/chat/lib/chatTransport';
import {
  prependThreadToCache,
  refetchThreadsIntoCache,
  setThreadTitleInCache,
} from '~/modules/chat/threadsCache';

type Client = ApolloClient<object>;

interface MastraThreadMessagesResponse {
  mastraThreadMessages?: DbThreadMessage[];
}

interface MastraMessageFeedbacksResponse {
  mastraMessageFeedbacks?: Record<string, { rating: number }>;
}

const threadKey = (agentKey: string, threadId: string) =>
  `${agentKey}:${threadId}`;

const isWorkingStatus = (status?: ChatStatus): boolean =>
  status === 'submitted' || status === 'streaming';

const REASONING_EFFORT_VALUES: readonly string[] = REASONING_EFFORT_OPTIONS.map(
  (o) => o.value,
);

const isReasoningEffort = (v: unknown): v is ReasoningEffort =>
  typeof v === 'string' && REASONING_EFFORT_VALUES.includes(v);

/** localStorage key holding the persisted reasoning choice for one agent. */
const reasoningEffortStorageKey = (agentKey: string) =>
  `erxes-agent:reasoningEffort:${agentKey}`;

// Best-effort read of the persisted choice — localStorage may be unavailable
// (private mode / SSR) and may hold stale values from an older enum.
const loadReasoningEffort = (agentKey: string): ReasoningEffort | undefined => {
  try {
    const raw = localStorage.getItem(reasoningEffortStorageKey(agentKey));
    return isReasoningEffort(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
};

// Status-subscription teardowns, keyed by `${agentKey}:${threadId}`. Kept out of
// zustand (no reactivity needed) so the Chat refs in state stay opaque.
const statusUnsubs = new Map<string, () => void>();

// A stable, transport-less Chat the view binds to whenever no thread is active,
// so `useChat({ chat })` always has a defined instance (hooks can't be skipped).
const EMPTY_CHAT = new Chat<AgentUIMessage>({});

// Registry-backed chat store. The active turn's message state is owned by AI SDK
// `Chat` instances (one per agent+thread); this store keeps only the registry of
// those refs, the agent-level shell state, and a couple of lightweight signals
// (per-thread status + activity) mirrored so the sidebar badges stay reactive for
// agents whose conversation view is NOT mounted (background streaming). The heavy
// `messages` array is never mirrored here — it lives in the Chat.
interface ChatStoreState {
  agents: Record<string, AgentChatState>;
  chats: Record<string, Chat<AgentUIMessage>>;
  threadStatus: Record<string, ChatStatus>;
  threadActivity: Record<string, string | undefined>;
  threadHydrating: Record<string, boolean>;
  unreadAgents: string[];
  currentViewedAgentId?: string;

  setCurrentAgent: (agentId: string | undefined) => void;
  markRead: (agentKey: string) => void;
  setReasoningEffort: (
    agentKey: string,
    effort: ReasoningEffort | undefined,
  ) => void;
  newDraft: (client: Client, agentKey: string, mastraAgentId: string) => void;
  selectSession: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    threadId: string,
  ) => Promise<void>;
  rateMessage: (
    client: Client,
    agentKey: string,
    messageId: string,
    rating: 1 | -1,
  ) => Promise<void>;
  // Drop a removed thread's Chat + signals. The cached session list is filtered
  // by useRemoveMastraThread; this only clears store-side state.
  discardThread: (agentKey: string, threadId: string) => void;
  stop: (agentKey: string) => void;
  sendMessage: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    message: string,
    attachments?: ChatAttachment[],
    approvedOperations?: ApprovedOp[],
    // Don't render a user bubble for this send (approve/deny — the turn
    // continues without a visible "Approved" message).
    hidden?: boolean,
  ) => void;
  // Re-ask the question that produced the last reply (with its attachments).
  regenerate: (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
  ) => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => {
  const patchAgent = (agentKey: string, partial: Partial<AgentChatState>) =>
    set((s) => ({
      agents: {
        ...s.agents,
        [agentKey]: { ...(s.agents[agentKey] ?? EMPTY_AGENT), ...partial },
      },
    }));

  const setThreadActivity = (key: string, text: string | undefined) =>
    set((s) => ({ threadActivity: { ...s.threadActivity, [key]: text } }));

  // Mark the turn persisted: clear activity, reconcile the cached session list
  // (titles/ordering/counts + the real _id), and flag unread when the user is
  // looking at another agent.
  const finishTurn = (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    threadId: string,
  ) => {
    const key = threadKey(agentKey, threadId);
    setThreadActivity(key, undefined);
    if (get().currentViewedAgentId !== agentKey) {
      set((s) =>
        s.unreadAgents.includes(agentKey)
          ? s
          : { unreadAgents: [...s.unreadAgents, agentKey] },
      );
    }
    const agent = get().agents[agentKey];
    if (agent?.activeThreadId === threadId && agent.isDraft) {
      patchAgent(agentKey, { isDraft: false });
    }
    void refetchThreadsIntoCache(client, mastraAgentId);
  };

  // Create + register a Chat for one agent+thread, wiring the transport and the
  // signal bridge (status → threadStatus, data-activity → threadActivity,
  // data-thread-title → cache). Returns the existing ref when already present so
  // a background-streaming thread is never recreated.
  const ensureChat = (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    threadId: string,
    initialMessages: AgentUIMessage[],
  ): Chat<AgentUIMessage> => {
    const key = threadKey(agentKey, threadId);
    const existing = get().chats[key];
    if (existing) return existing;

    const chat = new Chat<AgentUIMessage>({
      id: threadId,
      messages: initialMessages,
      transport: createChatTransport(mastraAgentId, threadId),
      onData: (part) => {
        if (part.type === 'data-activity') {
          setThreadActivity(key, part.data.text);
        } else if (part.type === 'data-thread-title') {
          setThreadTitleInCache(
            client,
            mastraAgentId,
            part.data.threadId || threadId,
            part.data.title,
          );
        }
        // data-heartbeat is dropped — it only keeps the proxy socket warm.
      },
      onFinish: () => finishTurn(client, agentKey, mastraAgentId, threadId),
      onError: () => setThreadActivity(key, undefined),
    });

    // Mirror the Chat's status into the store so background threads keep the
    // sidebar badges reactive even when their conversation view is unmounted.
    const unsub = chat['~registerStatusCallback'](() =>
      set((s) => ({ threadStatus: { ...s.threadStatus, [key]: chat.status } })),
    );
    statusUnsubs.set(key, unsub);

    set((s) => ({
      chats: { ...s.chats, [key]: chat },
      threadStatus: { ...s.threadStatus, [key]: chat.status },
    }));
    return chat;
  };

  const hydrateFeedbacks = async (
    client: Client,
    chat: Chat<AgentUIMessage>,
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
      chat.messages = chat.messages.map((m) => {
        const id = m.metadata?.messageId;
        return id && byMessage[id]
          ? { ...m, metadata: { ...m.metadata, rating: byMessage[id].rating } }
          : m;
      });
    } catch {
      // ignore — thumbs just render unselected
    }
  };

  // Shared send path used by sendMessage + regenerate.
  const doSend = (
    client: Client,
    agentKey: string,
    mastraAgentId: string,
    message: string,
    attachments?: ChatAttachment[],
    approvedOperations?: ApprovedOp[],
    hidden?: boolean,
  ) => {
    let agent = get().agents[agentKey] ?? EMPTY_AGENT;
    if (!agent.activeThreadId) {
      get().newDraft(client, agentKey, mastraAgentId);
      agent = get().agents[agentKey] ?? EMPTY_AGENT;
    }
    const threadId = agent.activeThreadId;
    if (!threadId) return;

    const chat = ensureChat(client, agentKey, mastraAgentId, threadId, []);
    // Never start a second turn on a thread that's already streaming — a
    // concurrent send (regenerate, suggestion, double Enter) would interleave
    // two replies. `status` is the AI SDK's own in-flight guard.
    if (chat.status !== 'ready') return;

    // Surface the session in the sidebar the instant the first message is sent.
    prependThreadToCache(client, mastraAgentId, threadId);
    if (agent.isDraft) patchAgent(agentKey, { isDraft: false });

    void chat.sendMessage(
      { text: message, ...(hidden ? { metadata: { hidden: true } } : {}) },
      {
        body: {
          ...(agent.reasoningEffort
            ? { reasoningEffort: agent.reasoningEffort }
            : {}),
          ...(attachments?.length ? { attachments } : {}),
          ...(approvedOperations?.length ? { approvedOperations } : {}),
        },
      },
    );
  };

  return {
    agents: {},
    chats: {},
    threadStatus: {},
    threadActivity: {},
    threadHydrating: {},
    unreadAgents: [],
    currentViewedAgentId: undefined,

    setCurrentAgent: (agentId) => {
      set({ currentViewedAgentId: agentId });
      if (agentId) {
        get().markRead(agentId);
        // Hydrate the persisted reasoning choice exactly once, when this agent's
        // slice first comes into view.
        if (!get().agents[agentId]) {
          patchAgent(agentId, { reasoningEffort: loadReasoningEffort(agentId) });
        }
      }
    },

    markRead: (agentKey) =>
      set((s) =>
        s.unreadAgents.includes(agentKey)
          ? { unreadAgents: s.unreadAgents.filter((a) => a !== agentKey) }
          : s,
      ),

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

    newDraft: (client, agentKey, mastraAgentId) => {
      const threadId = generateThreadId();
      ensureChat(client, agentKey, mastraAgentId, threadId, []);
      patchAgent(agentKey, {
        activeThreadId: threadId,
        isDraft: true,
        mastraAgentId,
      });
    },

    selectSession: async (client, agentKey, mastraAgentId, threadId) => {
      patchAgent(agentKey, {
        activeThreadId: threadId,
        isDraft: false,
        mastraAgentId,
      });

      const key = threadKey(agentKey, threadId);
      // An existing Chat (revisited, or streaming in the background) keeps its
      // live state — never reload over it.
      if (get().chats[key]) return;

      const chat = ensureChat(client, agentKey, mastraAgentId, threadId, []);
      set((s) => ({ threadHydrating: { ...s.threadHydrating, [key]: true } }));
      try {
        const { data } = await client.query<MastraThreadMessagesResponse>({
          query: MASTRA_THREAD_MESSAGES,
          variables: { threadId },
          fetchPolicy: 'network-only',
        });
        chat.messages = metaToUIMessages(data?.mastraThreadMessages ?? []);
        await hydrateFeedbacks(client, chat, threadId);
      } catch {
        // leave the chat empty — the composer still works
      } finally {
        set((s) => ({
          threadHydrating: { ...s.threadHydrating, [key]: false },
        }));
      }
    },

    rateMessage: async (client, agentKey, messageId, rating) => {
      const agent = get().agents[agentKey];
      const chat = agent?.activeThreadId
        ? get().chats[threadKey(agentKey, agent.activeThreadId)]
        : undefined;
      if (!chat) return;
      const apply = (value: number | undefined) => {
        chat.messages = chat.messages.map((m) =>
          m.metadata?.messageId === messageId
            ? { ...m, metadata: { ...m.metadata, rating: value } }
            : m,
        );
      };
      apply(rating);
      try {
        await client.mutate({
          mutation: MASTRA_MESSAGE_FEEDBACK,
          variables: { messageId, rating },
        });
      } catch {
        apply(undefined);
      }
    },

    discardThread: (agentKey, threadId) => {
      const key = threadKey(agentKey, threadId);
      void get().chats[key]?.stop();
      statusUnsubs.get(key)?.();
      statusUnsubs.delete(key);
      set((s) => {
        const chats = { ...s.chats };
        const threadStatus = { ...s.threadStatus };
        const threadActivity = { ...s.threadActivity };
        const threadHydrating = { ...s.threadHydrating };
        delete chats[key];
        delete threadStatus[key];
        delete threadActivity[key];
        delete threadHydrating[key];
        return { chats, threadStatus, threadActivity, threadHydrating };
      });
      // Drop the active selection so the view's bootstrap re-selects the next
      // session (or opens a fresh draft) from the now-filtered cached list.
      if (get().agents[agentKey]?.activeThreadId === threadId) {
        patchAgent(agentKey, { activeThreadId: undefined, isDraft: false });
      }
    },

    stop: (agentKey) => {
      const agent = get().agents[agentKey];
      if (!agent?.activeThreadId) return;
      void get().chats[threadKey(agentKey, agent.activeThreadId)]?.stop();
    },

    sendMessage: (
      client,
      agentKey,
      mastraAgentId,
      message,
      attachments,
      approvedOperations,
      hidden,
    ) =>
      doSend(
        client,
        agentKey,
        mastraAgentId,
        message,
        attachments,
        approvedOperations,
        hidden,
      ),

    regenerate: (client, agentKey, mastraAgentId) => {
      const agent = get().agents[agentKey];
      if (!agent?.activeThreadId) return;
      const chat = get().chats[threadKey(agentKey, agent.activeThreadId)];
      if (!chat || chat.status !== 'ready') return;
      // Skip hidden approve/deny replies — re-ask the real question.
      const lastUser = [...chat.messages]
        .reverse()
        .find((m) => m.role === 'user' && !m.metadata?.hidden);
      if (!lastUser) return;
      doSend(
        client,
        agentKey,
        mastraAgentId,
        messageText(lastUser),
        lastUser.metadata?.attachments,
      );
    },
  };
});

// ── Selectors (granular reactive reads) ─────────────────────────────────────

export const selectAgentShell = (
  s: ChatStoreState,
  agentKey: string,
): AgentChatState => s.agents[agentKey] ?? EMPTY_AGENT;

export const selectActiveChat = (
  s: ChatStoreState,
  agentKey: string,
): Chat<AgentUIMessage> => {
  const threadId = s.agents[agentKey]?.activeThreadId;
  return (threadId && s.chats[threadKey(agentKey, threadId)]) || EMPTY_CHAT;
};

export const selectThreadHydrating = (
  s: ChatStoreState,
  agentKey: string,
): boolean => {
  const threadId = s.agents[agentKey]?.activeThreadId;
  return threadId ? !!s.threadHydrating[threadKey(agentKey, threadId)] : false;
};

export const selectIsAgentWorking = (
  s: ChatStoreState,
  agentKey: string,
): boolean => {
  const prefix = `${agentKey}:`;
  return Object.entries(s.threadStatus).some(
    ([key, status]) => key.startsWith(prefix) && isWorkingStatus(status),
  );
};

export const selectThreadWorking = (
  s: ChatStoreState,
  agentKey: string,
  threadId: string,
): boolean => isWorkingStatus(s.threadStatus[threadKey(agentKey, threadId)]);

// One-line summary of what the agent is doing right now: the server-pushed
// activity for any working thread of this agent, or a coarse fallback.
export const selectAgentActivity = (
  s: ChatStoreState,
  agentKey: string,
): string | undefined => {
  const prefix = `${agentKey}:`;
  for (const [key, status] of Object.entries(s.threadStatus)) {
    if (!key.startsWith(prefix) || !isWorkingStatus(status)) continue;
    return s.threadActivity[key] ?? 'Working…';
  }
  return undefined;
};

export const selectHasUnread = (s: ChatStoreState, agentKey: string): boolean =>
  s.unreadAgents.includes(agentKey);

// Imperative facade so call sites keep reading `chatStore.x(...)`. Each action
// delegates to the live store; reactive reads use the hooks in ./hooks.
type StoreActionKey =
  | 'setCurrentAgent'
  | 'markRead'
  | 'setReasoningEffort'
  | 'newDraft'
  | 'selectSession'
  | 'rateMessage'
  | 'discardThread'
  | 'stop'
  | 'sendMessage'
  | 'regenerate';

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
  'regenerate',
];

export const chatStore = Object.fromEntries(
  ACTION_KEYS.map((key) => [
    key,
    (...args: unknown[]) =>
      (useChatStore.getState()[key] as (...a: unknown[]) => unknown)(...args),
  ]),
) as StoreActions;
