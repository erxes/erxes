// Shared chat domain types. Kept free of React/store imports so any layer
// (store, transport, components, hooks) can depend on them.

// One tool invocation surfaced in the chat UI (expandable args/result detail).
export interface ToolCallInfo {
  toolCallId?: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
}

// One chronological segment of an assistant turn. Thinking bursts and tool
// calls render in the order they happened — a new reasoning burst appears as
// its own section at the bottom, never appended into an earlier one.
export type TurnPart =
  | { kind: 'thinking'; text: string; done?: boolean }
  | { kind: 'tool'; call: ToolCallInfo };

// A file attached to a user message. `url` is the storage key returned by
// core's /upload-file (or a full public URL when storage is public).
export interface ChatAttachment {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

export interface Message {
  // Persisted message _id — present after hydration, or from the stream's
  // `done` event. Required for thumbs feedback.
  id?: string;
  // Stable client-generated id, assigned when the message is first appended.
  // Identifies the live streaming bubble independently of its position so an
  // error/other message appended mid-stream can't be clobbered, and gives the
  // list a stable React key before a persisted `id` exists.
  _clientId?: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  // Assistant-turn artifacts in arrival order (live while streaming,
  // hydrated from meta after).
  parts?: TurnPart[];
  attachments?: ChatAttachment[];
  streaming?: boolean;
  interrupted?: boolean;
  // The caller's own thumbs vote (1 / -1), when one exists.
  rating?: number;
}

// Persisted-message metadata shape used to rebuild turn parts on hydration.
export interface MessageMeta {
  parts?: Array<{ kind?: string; text?: string; call?: ToolCallInfo }>;
  thinking?: string;
  toolCalls?: ToolCallInfo[];
  interrupted?: boolean;
}

export interface SessionMeta {
  threadId: string;
  title: string;
  messageCount: number;
  lastMessageAt?: string;
}

// Per-thread chat state. Keyed by `${agentKey}:${threadId}` so an in-flight
// reply only ever paints into its own session.
export interface ThreadChatState {
  messages: Message[];
  loading: boolean; // awaiting/streaming an assistant reply
  messagesLoading: boolean; // hydrating this thread's messages from the DB
  abort?: AbortController; // in-flight stream — abort() = interrupt
  activity?: string; // server-summarized "what is the agent doing right now"
}

export interface AgentChatState {
  sessions: SessionMeta[];
  sessionsLoaded: boolean;
  activeThreadId?: string;
  isDraft: boolean; // active session is new and not yet persisted
}

// What the conversation view renders: agent-level session state + the active
// thread's view.
export interface AgentChatView extends AgentChatState {
  messages: Message[];
  loading: boolean;
  messagesLoading: boolean;
}

// A file in the composer, before the message is sent.
export interface PendingAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string; // storage key once uploaded
  previewUrl?: string; // local object URL for image thumbnails
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

// Events emitted by POST /pl:erxes-agent/chat/stream (SSE).
export type StreamEventType =
  | 'thinking'
  | 'text'
  | 'text_replace'
  | 'tool_call'
  | 'tool_result'
  | 'activity'
  | 'done'
  | 'thread_title'
  | 'error';

export interface StreamEvent {
  type: StreamEventType;
  text?: string;
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
  reply?: string;
  messageId?: string;
  interrupted?: boolean;
  title?: string;
  threadId?: string;
  message?: string;
}

export const EMPTY_THREAD: ThreadChatState = {
  messages: [],
  loading: false,
  messagesLoading: false,
};

export const EMPTY_AGENT: AgentChatState = {
  sessions: [],
  sessionsLoaded: false,
  activeThreadId: undefined,
  isDraft: false,
};
