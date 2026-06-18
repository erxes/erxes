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

// A destructive operation the user approves from the chat (echoed back on the
// next turn so the backend runs the otherwise-gated delete/merge).
export interface ApprovedOp {
  operation: string;
  args?: Record<string, unknown>;
}

// A tool result that asks for the user's approval. Two producers, both narrowed
// to this shape: the `request_approval` tool (model-authored `summary` + the
// `operations` it intends) and the execute-guard backstop (a single op the model
// tried directly, no summary).
export interface ApprovalRequest {
  requiresApproval: true;
  summary?: string;
  operations: ApprovedOp[];
}

/** Narrow an unknown tool result to an approval request (either producer). */
export const asApprovalRequest = (result: unknown): ApprovalRequest | null => {
  const r = result as
    | {
        requiresApproval?: unknown;
        summary?: unknown;
        operations?: unknown;
        operation?: unknown;
        args?: unknown;
      }
    | null
    | undefined;
  if (!r || r.requiresApproval !== true) return null;

  // request_approval tool — model-authored summary + the ops to run.
  if (typeof r.summary === 'string' && Array.isArray(r.operations)) {
    const operations: ApprovedOp[] = r.operations
      .filter(
        (o): o is { operation: string; args?: Record<string, unknown> } =>
          !!o && typeof (o as { operation?: unknown }).operation === 'string',
      )
      .map((o) => ({ operation: o.operation, args: o.args }));
    return { requiresApproval: true, summary: r.summary, operations };
  }

  // execute-guard backstop — a single op the model attempted directly.
  if (typeof r.operation === 'string') {
    return {
      requiresApproval: true,
      operations: [
        { operation: r.operation, args: r.args as Record<string, unknown> },
      ],
    };
  }
  return null;
};

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
  // list a stable React key before a persisted `id` exists. Always present on a
  // stored message — the patch helpers assign it on the way in.
  _clientId: string;
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

// One persisted chat session (thread) as returned by `mastraThreads` and held in
// the Apollo cache. The session LIST lives in the cache (house convention), not
// in the chat store — only per-thread streaming/message state stays in the store.
export interface IMastraThread {
  __typename?: 'MastraThread';
  _id: string;
  threadId: string;
  title: string;
  messageCount: number;
  lastMessageAt?: string | null;
  createdAt?: string | null;
}

export interface IMastraThreadsResponse {
  mastraThreads: IMastraThread[];
}

// Per-thread chat state. Keyed by `${agentKey}:${threadId}` so an in-flight
// reply only ever paints into its own session.
export interface ThreadChatState {
  messages: Message[];
  loading: boolean; // awaiting/streaming an assistant reply
  messagesLoading: boolean; // hydrating this thread's messages from the DB
  abort?: AbortController; // in-flight stream — abort() = interrupt
  activity?: string; // server-summarized "what is the agent doing right now"
  // Monotonic counter bumped on every live stream update so the view can drive
  // streaming auto-scroll off a single dependency instead of inferring growth
  // from message contents.
  streamTick?: number;
}

// How hard the model should think before answering. Unset = let the agent's
// configured default stand (current behaviour). The chat composer exposes this
// behind a low-key brain control for power users; the backend maps it to the
// right per-provider reasoning option at stream time.
export type ReasoningEffort = 'off' | 'low' | 'medium' | 'high';

export const REASONING_EFFORT_OPTIONS: {
  value: ReasoningEffort;
  label: string;
  hint: string;
}[] = [
  { value: 'off', label: 'Off', hint: 'Answer directly, no reasoning' },
  { value: 'low', label: 'Low', hint: 'Brief reasoning, fastest' },
  { value: 'medium', label: 'Medium', hint: 'Balanced reasoning' },
  { value: 'high', label: 'High', hint: 'Deep reasoning, slowest' },
];

export interface AgentChatState {
  activeThreadId?: string;
  isDraft: boolean; // active session is new and not yet persisted
  // Power-user reasoning override for this agent's chat view. Unset = default.
  reasoningEffort?: ReasoningEffort;
}

// What the conversation view renders: agent-level session state + the active
// thread's view.
export interface AgentChatView extends AgentChatState {
  messages: Message[];
  loading: boolean;
  messagesLoading: boolean;
  streamTick?: number;
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
  activeThreadId: undefined,
  isDraft: false,
  reasoningEffort: undefined,
};
