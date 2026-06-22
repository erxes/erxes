import type { UIMessage } from 'ai';

// Shared chat domain types. Kept free of React/store imports so any layer
// (store, transport, components, hooks) can depend on them.

// ── AI SDK message model ─────────────────────────────────────────────────────
//
// Live turn state is owned by the AI SDK `Chat`/`useChat`; messages are standard
// `UIMessage`s whose parts the components render directly. erxes-only fields ride
// on the message metadata (set live by the backend `finish` chunk, or rebuilt on
// hydration) and on two transient data parts the backend streams alongside the
// model output.

// erxes-only fields stamped onto an assistant (or user) message.
export interface AgentMessageMetadata {
  // Native message id the thumbs feedback resolves — set live by the stream's
  // final `finish` chunk, or to the Mongo `_id` on hydration.
  messageId?: string;
  interrupted?: boolean;
  // Langfuse trace id for this turn (Plan B) — lets a thumbs rating attach a
  // human score to the right trace.
  langfuseTraceId?: string;
  // ISO timestamp for the message time label (hydrated messages only; live
  // messages fall back to "now").
  createdAt?: string;
  // The caller's own thumbs vote (1 / -1), when one exists.
  rating?: number;
  // Files attached to a user message.
  attachments?: ChatAttachment[];
  // Approve/deny replies are sent to continue a gated turn without showing a
  // visible user bubble; the renderer skips these.
  hidden?: boolean;
}

// Transient data parts the backend streams next to the model output. They flow
// as bytes (delivered to the transport `onData`) but are never added to the
// message — so message.parts only ever holds text/reasoning/tool parts. A type
// alias (not an interface) so it satisfies the AI SDK's `UIDataTypes` constraint
// (`Record<string, unknown>`), which open interfaces do not.
export type AgentDataParts = {
  activity: { text: string };
  'thread-title': { threadId: string; title: string };
  heartbeat: Record<string, never>;
};

export type AgentUIMessage = UIMessage<AgentMessageMetadata, AgentDataParts>;

// ── Approval (erxes-only, unchanged) ─────────────────────────────────────────

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

// ── Attachments ──────────────────────────────────────────────────────────────

// A file attached to a user message. `url` is the storage key returned by
// core's /upload-file (or a full public URL when storage is public).
export interface ChatAttachment {
  url: string;
  name: string;
  type?: string;
  size?: number;
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

// ── Persisted (Mongo) message shape — read by history hydration ──────────────

// One tool invocation as persisted in a turn's meta.
export interface DbToolCall {
  toolCallId?: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
}

// One chronological segment of a persisted assistant turn.
export type DbTurnPart =
  | { kind: 'thinking'; text: string }
  | { kind: 'tool'; call: DbToolCall };

// Persisted-message metadata used to rebuild UIMessage parts on hydration.
export interface DbMessageMeta {
  parts?: Array<{ kind?: string; text?: string; call?: DbToolCall }>;
  thinking?: string;
  toolCalls?: DbToolCall[];
  interrupted?: boolean;
}

// One persisted message as returned by `mastraThreadMessages`.
export interface DbThreadMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  meta?: DbMessageMeta;
  attachments?: ChatAttachment[];
}

// ── Session list (Apollo cache) ──────────────────────────────────────────────

// One persisted chat session (thread) as returned by `mastraThreads` and held in
// the Apollo cache. The session LIST lives in the cache (house convention), not
// in the chat store.
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

// ── Reasoning effort (composer power-user control) ───────────────────────────

// How hard the model should think before answering. Unset = let the agent's
// configured default stand. The backend maps it to the right per-provider
// reasoning option at stream time.
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

// ── Agent shell state (zustand) ──────────────────────────────────────────────

export interface AgentChatState {
  activeThreadId?: string;
  isDraft: boolean; // active session is new and not yet persisted
  // Mastra agentId (the `agentId` field, not the record _id) — backs the
  // per-chat transport and the cached session-list reconciliation.
  mastraAgentId?: string;
  // Power-user reasoning override for this agent's chat view. Unset = default.
  reasoningEffort?: ReasoningEffort;
}

export const EMPTY_AGENT: AgentChatState = {
  activeThreadId: undefined,
  isDraft: false,
  mastraAgentId: undefined,
  reasoningEffort: undefined,
};
