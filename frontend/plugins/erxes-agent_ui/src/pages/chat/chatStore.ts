import { ApolloClient } from '@apollo/client';
import { REACT_APP_API_URL } from 'erxes-ui';
import {
  MASTRA_AGENT_CHAT,
  MASTRA_THREADS,
  MASTRA_THREAD_MESSAGES,
} from '~/graphql/queries';
import { MASTRA_THREAD_REMOVE, MASTRA_THREAD_RENAME } from '~/graphql/mutations';

// One tool invocation surfaced in the chat UI (expandable args/result detail).
export interface ToolCallInfo {
  toolCallId?: string;
  toolName: string;
  args?: any;
  result?: any;
  isError?: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  // Assistant-turn artifacts (live while streaming, hydrated from meta after).
  thinking?: string;
  toolCalls?: ToolCallInfo[];
  streaming?: boolean;
  interrupted?: boolean;
}

export interface SessionMeta {
  threadId: string;
  title: string;
  messageCount: number;
  lastMessageAt?: string;
}

// Per-thread chat state. Keyed by `${agentKey}:${threadId}` so an in-flight
// reply only ever paints into its own session — switching sessions while a
// response streams can no longer leak the typing state or the reply into the
// newly viewed thread.
interface ThreadChatState {
  messages: Message[];
  loading: boolean; // awaiting/streaming an assistant reply
  messagesLoading: boolean; // hydrating this thread's messages from the DB
  abort?: AbortController; // in-flight stream — abort() = interrupt
}

const EMPTY_THREAD: ThreadChatState = {
  messages: [],
  loading: false,
  messagesLoading: false,
};

export interface AgentChatState {
  sessions: SessionMeta[];
  sessionsLoaded: boolean;
  activeThreadId?: string;
  isDraft: boolean; // active session is new and not yet persisted
}

const EMPTY_AGENT: AgentChatState = {
  sessions: [],
  sessionsLoaded: false,
  activeThreadId: undefined,
  isDraft: false,
};

// What ChatPage renders: agent-level session state + the active thread's view.
export interface AgentChatView extends AgentChatState {
  messages: Message[];
  loading: boolean;
  messagesLoading: boolean;
}

function generateThreadId() {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Listener = () => void;

// Wire events emitted by POST /pl:erxes-agent/chat/stream (SSE).
interface StreamEvent {
  type:
    | 'thinking'
    | 'text'
    | 'text_replace'
    | 'tool_call'
    | 'tool_result'
    | 'done'
    | 'error';
  [key: string]: any;
}

// DB-backed chat store. Sessions (threads) and their messages live in MongoDB
// via the erxes-agent_api plugin; this store mirrors them in memory for the UI.
// Replies stream over SSE through the gateway plugin proxy, falling back to
// the blocking GraphQL query when the stream transport is unavailable.
class ChatStore {
  private agents = new Map<string, AgentChatState>();
  private threads = new Map<string, ThreadChatState>();
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

  private ensureAgent(agentKey: string): AgentChatState {
    let state = this.agents.get(agentKey);
    if (!state) {
      state = { ...EMPTY_AGENT };
      this.agents.set(agentKey, state);
    }
    return state;
  }

  private patchAgent(agentKey: string, partial: Partial<AgentChatState>) {
    const state = this.ensureAgent(agentKey);
    this.agents.set(agentKey, { ...state, ...partial });
    this.notify();
  }

  private threadKey(agentKey: string, threadId: string) {
    return `${agentKey}:${threadId}`;
  }

  private getThread(agentKey: string, threadId: string): ThreadChatState {
    return this.threads.get(this.threadKey(agentKey, threadId)) ?? EMPTY_THREAD;
  }

  private patchThread(
    agentKey: string,
    threadId: string,
    partial: Partial<ThreadChatState>,
  ) {
    const key = this.threadKey(agentKey, threadId);
    const state = this.threads.get(key) ?? { ...EMPTY_THREAD };
    this.threads.set(key, { ...state, ...partial });
    this.notify();
  }

  private appendMessage(agentKey: string, threadId: string, msg: Message) {
    const t = this.getThread(agentKey, threadId);
    this.patchThread(agentKey, threadId, { messages: [...t.messages, msg] });
  }

  // Replace the last message of a thread (used to advance the streaming bubble).
  private replaceLastMessage(agentKey: string, threadId: string, msg: Message) {
    const t = this.getThread(agentKey, threadId);
    const messages = t.messages.slice(0, -1).concat(msg);
    this.patchThread(agentKey, threadId, { messages });
  }

  getState(agentKey: string): AgentChatView {
    const agent = this.agents.get(agentKey) ?? EMPTY_AGENT;
    const thread = agent.activeThreadId
      ? this.getThread(agentKey, agent.activeThreadId)
      : EMPTY_THREAD;
    return {
      ...agent,
      messages: thread.messages,
      loading: thread.loading,
      messagesLoading: thread.messagesLoading,
    };
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

      const state = this.ensureAgent(agentKey);
      this.patchAgent(agentKey, { sessions, sessionsLoaded: true });

      // Pick an active session on first load if none is selected yet.
      if (!state.activeThreadId) {
        if (sessions.length > 0) {
          await this.selectSession(apolloClient, agentKey, sessions[0].threadId);
        } else {
          this.newDraft(agentKey);
        }
      }
    } catch {
      this.patchAgent(agentKey, { sessionsLoaded: true });
    }
  }

  // Switch to a persisted session and hydrate its messages from the DB. An
  // in-flight reply in another session keeps streaming into its own thread.
  async selectSession(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    threadId: string,
  ) {
    this.patchAgent(agentKey, { activeThreadId: threadId, isDraft: false });

    // Never clobber a thread that is currently streaming a reply.
    const existing = this.getThread(agentKey, threadId);
    if (existing.loading) return;

    this.patchThread(agentKey, threadId, { messagesLoading: true });
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
        thinking: m.meta?.thinking || undefined,
        toolCalls: m.meta?.toolCalls || undefined,
        interrupted: m.meta?.interrupted || undefined,
      }));
      this.patchThread(agentKey, threadId, { messages, messagesLoading: false });
    } catch {
      this.patchThread(agentKey, threadId, { messagesLoading: false });
    }
  }

  // Open a fresh, unsaved session. It is persisted on the first sent message.
  newDraft(agentKey: string) {
    const threadId = generateThreadId();
    this.patchAgent(agentKey, { activeThreadId: threadId, isDraft: true });
    this.patchThread(agentKey, threadId, { messages: [], loading: false });
  }

  async renameSession(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    threadId: string,
    title: string,
  ) {
    const state = this.ensureAgent(agentKey);
    this.patchAgent(agentKey, {
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

    // Stop any in-flight reply for the deleted thread and drop its state.
    this.getThread(agentKey, threadId).abort?.abort();
    this.threads.delete(this.threadKey(agentKey, threadId));

    const state = this.ensureAgent(agentKey);
    const remaining = state.sessions.filter((s) => s.threadId !== threadId);
    this.patchAgent(agentKey, { sessions: remaining });

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

  // Interrupt the reply streaming into a thread. The backend persists the
  // partial text and marks it interrupted.
  stop(agentKey: string, threadId: string) {
    this.getThread(agentKey, threadId).abort?.abort();
  }

  async sendMessage(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    mastraAgentId: string,
    message: string,
  ) {
    let agent = this.ensureAgent(agentKey);
    if (!agent.activeThreadId) {
      this.newDraft(agentKey);
      agent = this.ensureAgent(agentKey);
    }
    const threadId = agent.activeThreadId!;

    // Optimistically show the user message — in this thread only.
    this.appendMessage(agentKey, threadId, {
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    const abort = new AbortController();
    this.patchThread(agentKey, threadId, { loading: true, abort });

    try {
      const streamed = await this.sendViaStream(
        agentKey,
        threadId,
        mastraAgentId,
        message,
        abort,
      );
      // Stream transport unavailable (older gateway/plugin) — degrade to the
      // blocking GraphQL query.
      if (!streamed) {
        await this.sendViaQuery(apolloClient, agentKey, threadId, mastraAgentId, message);
      }
      this.finishTurn(apolloClient, agentKey, threadId, mastraAgentId);
    } catch (err: any) {
      this.appendMessage(agentKey, threadId, {
        role: 'error',
        content:
          err?.message ?? 'Failed to reach the agent. Check your connection and try again.',
        timestamp: new Date(),
      });
    } finally {
      this.patchThread(agentKey, threadId, { loading: false, abort: undefined });
    }
  }

  // Mark the turn persisted: refresh sessions (titles/ordering/counts) and
  // flag unread when the user is looking at another agent.
  private finishTurn(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    threadId: string,
    mastraAgentId: string,
  ) {
    if (this.currentViewedAgentId !== agentKey) {
      this.unreadAgents.add(agentKey);
    }
    const agent = this.ensureAgent(agentKey);
    if (agent.activeThreadId === threadId && agent.isDraft) {
      this.patchAgent(agentKey, { isDraft: false });
    }
    this.loadSessions(apolloClient, agentKey, mastraAgentId);
  }

  // Stream the reply over SSE. Returns false when the endpoint is unreachable
  // before any event arrived (caller falls back to GraphQL); throws on errors
  // the user should see.
  private async sendViaStream(
    agentKey: string,
    threadId: string,
    mastraAgentId: string,
    message: string,
    abort: AbortController,
  ): Promise<boolean> {
    let response: Response;
    try {
      response = await fetch(`${REACT_APP_API_URL}/pl:erxes-agent/chat/stream`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: mastraAgentId, message, threadId }),
        signal: abort.signal,
      });
    } catch {
      if (abort.signal.aborted) return true; // user stopped before transport settled
      return false; // network-level failure — try the GraphQL fallback
    }

    if (!response.ok || !response.body) {
      if (response.status === 401) throw new Error('Login required');
      return false;
    }

    // The live assistant bubble; advanced in place as events arrive.
    let live: Message | null = null;
    let sawDone = false;

    const upsertLive = (mutate: (m: Message) => Message) => {
      const base: Message =
        live ?? {
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          streaming: true,
        };
      const next = mutate({ ...base, toolCalls: base.toolCalls?.slice() });
      if (live) this.replaceLastMessage(agentKey, threadId, next);
      else this.appendMessage(agentKey, threadId, next);
      live = next;
    };

    const handleEvent = (ev: StreamEvent) => {
      switch (ev.type) {
        case 'thinking':
          upsertLive((m) => ({ ...m, thinking: (m.thinking || '') + ev.text }));
          break;
        case 'text':
          upsertLive((m) => ({ ...m, content: m.content + ev.text }));
          break;
        case 'text_replace':
          upsertLive((m) => ({ ...m, content: ev.text }));
          break;
        case 'tool_call':
          upsertLive((m) => ({
            ...m,
            toolCalls: [
              ...(m.toolCalls || []),
              { toolCallId: ev.toolCallId, toolName: ev.toolName, args: ev.args },
            ],
          }));
          break;
        case 'tool_result':
          upsertLive((m) => {
            const toolCalls = (m.toolCalls || []).slice();
            const idx = ev.toolCallId
              ? toolCalls.findIndex((tc) => tc.toolCallId === ev.toolCallId)
              : toolCalls.length - 1;
            const patch = { result: ev.result, isError: ev.isError };
            if (idx >= 0) toolCalls[idx] = { ...toolCalls[idx], ...patch };
            else toolCalls.push({ toolName: ev.toolName, ...patch });
            return { ...m, toolCalls };
          });
          break;
        case 'done':
          sawDone = true;
          if (live || ev.reply) {
            upsertLive((m) => ({
              ...m,
              content: m.content || ev.reply || '',
              streaming: false,
              interrupted: !!ev.interrupted,
            }));
          }
          if (!ev.reply && !ev.interrupted) {
            this.appendMessage(agentKey, threadId, {
              role: 'error',
              content: 'The agent returned an empty response. Please try again.',
              timestamp: new Date(),
            });
          }
          break;
        case 'error':
          sawDone = true;
          if (live) {
            upsertLive((m) => ({ ...m, streaming: false }));
          }
          this.appendMessage(agentKey, threadId, {
            role: 'error',
            content: ev.message || 'Agent error',
            timestamp: new Date(),
          });
          break;
      }
    };

    try {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          for (const line of rawEvent.split('\n')) {
            if (!line.startsWith('data: ')) continue; // skip heartbeats
            try {
              handleEvent(JSON.parse(line.slice(6)));
            } catch {
              // malformed frame — ignore
            }
          }
        }
      }
    } catch (err: any) {
      if (!abort.signal.aborted) throw err;
    }

    // User pressed stop, or the connection dropped mid-stream: finalize what
    // we have so the partial reply stays visible.
    if (!sawDone && live) {
      upsertLive((m) => ({
        ...m,
        streaming: false,
        interrupted: abort.signal.aborted,
      }));
    }
    if (!sawDone && !live && !abort.signal.aborted) {
      throw new Error('The connection to the agent was lost. Please try again.');
    }

    return true;
  }

  // Legacy blocking transport — single GraphQL query, no intermediate events.
  private async sendViaQuery(
    apolloClient: ApolloClient<any>,
    agentKey: string,
    threadId: string,
    mastraAgentId: string,
    message: string,
  ) {
    const result = await apolloClient.query({
      query: MASTRA_AGENT_CHAT,
      variables: { agentId: mastraAgentId, message, threadId },
      fetchPolicy: 'no-cache',
    });

    const gqlErrors = result.errors;
    const reply: string | null = result?.data?.mastraAgentChat ?? null;

    if (gqlErrors?.length) {
      this.appendMessage(agentKey, threadId, {
        role: 'error',
        content: gqlErrors[0].message,
        timestamp: new Date(),
      });
    } else if (reply) {
      this.appendMessage(agentKey, threadId, {
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      });
    } else {
      this.appendMessage(agentKey, threadId, {
        role: 'error',
        content: 'The agent returned an empty response. Please try again.',
        timestamp: new Date(),
      });
    }
  }
}

export const chatStore = new ChatStore();
