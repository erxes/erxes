import { ApolloClient } from '@apollo/client';
import {
  MASTRA_AGENT_CHAT,
  MASTRA_THREADS,
  MASTRA_THREAD_MESSAGES,
} from '~/graphql/queries';
import { MASTRA_THREAD_REMOVE, MASTRA_THREAD_RENAME } from '~/graphql/mutations';

export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
}

export interface SessionMeta {
  threadId: string;
  title: string;
  messageCount: number;
  lastMessageAt?: string;
}

export interface AgentChatState {
  sessions: SessionMeta[];
  sessionsLoaded: boolean;
  activeThreadId?: string;
  messages: Message[];
  loading: boolean; // awaiting an assistant reply
  messagesLoading: boolean; // hydrating a session's messages
  isDraft: boolean; // active session is new and not yet persisted
}

const EMPTY_STATE: AgentChatState = {
  sessions: [],
  sessionsLoaded: false,
  activeThreadId: undefined,
  messages: [],
  loading: false,
  messagesLoading: false,
  isDraft: false,
};

function generateThreadId() {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Listener = () => void;

// DB-backed chat store. Sessions (threads) and their messages live in MongoDB
// via the mastra_api plugin; this store mirrors them in memory for the UI and
// drives sends/loads through Apollo. State is keyed by the UI agent id (_id);
// the backend mastra agentId is passed into methods that hit the API.
class ChatStore {
  private agents = new Map<string, AgentChatState>();
  private unreadAgents = new Set<string>();
  private listeners = new Set<Listener>();
  private currentViewedAgentId: string | undefined;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private ensure(agentKey: string): AgentChatState {
    let state = this.agents.get(agentKey);
    if (!state) {
      state = { ...EMPTY_STATE };
      this.agents.set(agentKey, state);
    }
    return state;
  }

  private patch(agentKey: string, partial: Partial<AgentChatState>) {
    const state = this.ensure(agentKey);
    this.agents.set(agentKey, { ...state, ...partial });
    this.notify();
  }

  getState(agentKey: string): AgentChatState {
    return this.agents.get(agentKey) ?? EMPTY_STATE;
  }

  // ── Unread tracking (for agent sidebar / nav badges) ──────────────────────

  setCurrentAgent(agentId: string | undefined) {
    this.currentViewedAgentId = agentId;
    if (agentId) this.markRead(agentId);
  }

  hasUnread(agentKey: string): boolean {
    return this.unreadAgents.has(agentKey);
  }

  hasAnyActivity(): boolean {
    return this.unreadAgents.size > 0;
  }

  markRead(agentKey: string) {
    if (this.unreadAgents.has(agentKey)) {
      this.unreadAgents.delete(agentKey);
      this.notify();
    }
  }

  // ── Sessions ──────────────────────────────────────────────────────────────

  // Load the agent's persisted sessions. On first load, auto-select the most
  // recent session (and hydrate it), or open a fresh draft when there are none.
  async loadSessions(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    mastraAgentId: string,
  ) {
    try {
      const { data } = await apolloClient.query({
        query: MASTRA_THREADS,
        variables: { agentId: mastraAgentId },
        fetchPolicy: 'network-only',
      });
      const sessions: SessionMeta[] = (data?.mastraThreads || []).map((t: any) => ({
        threadId: t.threadId,
        title: t.title || 'New chat',
        messageCount: t.messageCount ?? 0,
        lastMessageAt: t.lastMessageAt,
      }));

      const state = this.ensure(agentKey);
      this.patch(agentKey, { sessions, sessionsLoaded: true });

      // Pick an active session on first load if none is selected yet.
      if (!state.activeThreadId) {
        if (sessions.length > 0) {
          await this.selectSession(apolloClient, agentKey, sessions[0].threadId);
        } else {
          this.newDraft(agentKey);
        }
      }
    } catch {
      this.patch(agentKey, { sessionsLoaded: true });
    }
  }

  // Switch to a persisted session and hydrate its messages from the DB.
  async selectSession(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    threadId: string,
  ) {
    this.patch(agentKey, {
      activeThreadId: threadId,
      isDraft: false,
      messagesLoading: true,
      messages: [],
    });
    try {
      const { data } = await apolloClient.query({
        query: MASTRA_THREAD_MESSAGES,
        variables: { threadId },
        fetchPolicy: 'network-only',
      });
      const messages: Message[] = (data?.mastraThreadMessages || []).map((m: any) => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
      }));
      this.patch(agentKey, { messages, messagesLoading: false });
    } catch {
      this.patch(agentKey, { messagesLoading: false });
    }
  }

  // Open a fresh, unsaved session. It is persisted on the first sent message.
  newDraft(agentKey: string) {
    this.patch(agentKey, {
      activeThreadId: generateThreadId(),
      messages: [],
      isDraft: true,
      loading: false,
    });
  }

  async renameSession(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    threadId: string,
    title: string,
  ) {
    const state = this.ensure(agentKey);
    this.patch(agentKey, {
      sessions: state.sessions.map((s) =>
        s.threadId === threadId ? { ...s, title } : s,
      ),
    });
    try {
      await apolloClient.mutate({
        mutation: MASTRA_THREAD_RENAME,
        variables: { threadId, title },
      });
    } catch {
      // best-effort; optimistic update already applied
    }
  }

  async deleteSession(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    mastraAgentId: string,
    threadId: string,
  ) {
    try {
      await apolloClient.mutate({
        mutation: MASTRA_THREAD_REMOVE,
        variables: { threadId },
      });
    } catch {
      return;
    }

    const state = this.ensure(agentKey);
    const remaining = state.sessions.filter((s) => s.threadId !== threadId);
    this.patch(agentKey, { sessions: remaining });

    // If the deleted session was active, fall back to the next one or a draft.
    if (state.activeThreadId === threadId) {
      if (remaining.length > 0) {
        await this.selectSession(apolloClient, agentKey, remaining[0].threadId);
      } else {
        this.newDraft(agentKey);
      }
    }
  }

  // ── Sending ─────────────────────────────────────────────────────────────

  async sendMessage(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    mastraAgentId: string,
    message: string,
  ) {
    let state = this.ensure(agentKey);
    if (!state.activeThreadId) {
      this.newDraft(agentKey);
      state = this.ensure(agentKey);
    }
    const threadId = state.activeThreadId!;

    // Optimistically show the user message.
    this.patch(agentKey, {
      messages: [
        ...this.getState(agentKey).messages,
        { role: 'user', content: message, timestamp: new Date() },
      ],
      loading: true,
    });

    try {
      const result = await apolloClient.query({
        query: MASTRA_AGENT_CHAT,
        variables: { agentId: mastraAgentId, message, threadId },
        fetchPolicy: 'no-cache',
      });

      const gqlErrors = result.errors;
      const reply: string | null = result?.data?.mastraAgentChat ?? null;

      if (gqlErrors?.length) {
        this.appendMessage(agentKey, {
          role: 'error',
          content: gqlErrors[0].message,
          timestamp: new Date(),
        });
      } else if (reply) {
        this.appendMessage(agentKey, {
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        });
        if (this.currentViewedAgentId !== agentKey) {
          this.unreadAgents.add(agentKey);
        }
        // The turn is now persisted server-side — refresh the session list so a
        // new session appears (titled) and ordering/counts update.
        this.patch(agentKey, { isDraft: false });
        this.loadSessions(apolloClient, agentKey, mastraAgentId);
      } else {
        this.appendMessage(agentKey, {
          role: 'error',
          content: 'The agent returned an empty response. Please try again.',
          timestamp: new Date(),
        });
      }
    } catch (err: any) {
      this.appendMessage(agentKey, {
        role: 'error',
        content:
          err?.message ?? 'Failed to reach the agent. Check your connection and try again.',
        timestamp: new Date(),
      });
    } finally {
      this.patch(agentKey, { loading: false });
    }
  }

  private appendMessage(agentKey: string, msg: Message) {
    this.patch(agentKey, { messages: [...this.getState(agentKey).messages, msg] });
  }
}

export const chatStore = new ChatStore();
