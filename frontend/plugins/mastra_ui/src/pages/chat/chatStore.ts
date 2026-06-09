import { ApolloClient } from '@apollo/client';
import { MASTRA_AGENT_CHAT } from '~/graphql/queries';

export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
}

export interface ThreadState {
  threadId: string;
  messages: Message[];
  loading: boolean;
}

function generateThreadId() {
  return `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Listener = () => void;

class ChatStore {
  private threads = new Map<string, ThreadState>();
  private unreadAgents = new Set<string>();
  private listeners = new Set<Listener>();
  private currentViewedAgentId: string | undefined;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  setCurrentAgent(agentId: string | undefined) {
    this.currentViewedAgentId = agentId;
    if (agentId) this.markRead(agentId);
  }

  getThread(agentId: string): ThreadState | undefined {
    return this.threads.get(agentId);
  }

  hasUnread(agentId: string): boolean {
    return this.unreadAgents.has(agentId);
  }

  hasAnyActivity(): boolean {
    return this.unreadAgents.size > 0;
  }

  markRead(agentId: string) {
    if (this.unreadAgents.has(agentId)) {
      this.unreadAgents.delete(agentId);
      this.notify();
    }
  }

  initThread(agentId: string) {
    if (!this.threads.has(agentId)) {
      this.threads.set(agentId, { threadId: generateThreadId(), messages: [], loading: false });
      this.notify();
    }
  }

  newThread(agentId: string) {
    this.threads.set(agentId, { threadId: generateThreadId(), messages: [], loading: false });
    this.unreadAgents.delete(agentId);
    this.notify();
  }

  private setLoading(agentId: string, loading: boolean) {
    const thread = this.threads.get(agentId);
    if (!thread) return;
    this.threads.set(agentId, { ...thread, loading });
    this.notify();
  }

  private addMessage(agentId: string, msg: Message) {
    const thread = this.threads.get(agentId);
    if (!thread) return;
    this.threads.set(agentId, { ...thread, messages: [...thread.messages, msg] });
    this.notify();
  }

  async sendMessage(
    apolloClient: ApolloClient<any>,
    agentId: string,
    mastraAgentId: string,
    message: string,
  ) {
    this.initThread(agentId);
    const thread = this.threads.get(agentId)!;

    this.addMessage(agentId, { role: 'user', content: message, timestamp: new Date() });
    this.setLoading(agentId, true);

    try {
      const result = await apolloClient.query({
        query: MASTRA_AGENT_CHAT,
        variables: { agentId: mastraAgentId, message, threadId: thread.threadId },
        fetchPolicy: 'no-cache',
      });

      const gqlErrors = result.errors;
      const reply: string | null = result?.data?.mastraAgentChat ?? null;

      if (gqlErrors?.length) {
        this.addMessage(agentId, {
          role: 'error',
          content: gqlErrors[0].message,
          timestamp: new Date(),
        });
      } else if (reply) {
        this.addMessage(agentId, { role: 'assistant', content: reply, timestamp: new Date() });
        // Mark unread only when the user is not currently viewing this agent's chat
        if (this.currentViewedAgentId !== agentId) {
          this.unreadAgents.add(agentId);
          this.notify();
        }
      } else {
        this.addMessage(agentId, {
          role: 'error',
          content: 'The agent returned an empty response. Please try again.',
          timestamp: new Date(),
        });
      }
    } catch (err: any) {
      this.addMessage(agentId, {
        role: 'error',
        content: err?.message ?? 'Failed to reach the agent. Check your connection and try again.',
        timestamp: new Date(),
      });
    } finally {
      this.setLoading(agentId, false);
    }
  }
}

export const chatStore = new ChatStore();
