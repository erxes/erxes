/**
 * Shared types for the agents UI.
 *
 * REST shapes mirror the backend routes in
 * `backend/core-api/src/modules/agents/routes.ts`. Stored-message shapes
 * mirror Mastra's `MastraDBMessage.content` (format 2) that the messages
 * route passes through.
 */

export interface IAgentsThread {
  id: string;
  title?: string;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Tool invocation as stored by Mastra memory (format-2 content part).
 * States beyond the legacy set are Mastra's approval extensions.
 */
export interface IStoredToolInvocation {
  toolCallId: string;
  toolName: string;
  args?: unknown;
  state:
    | 'partial-call'
    | 'call'
    | 'result'
    | 'approval-requested'
    | 'approval-responded'
    | 'output-error'
    | 'output-denied';
  result?: unknown;
  isError?: boolean;
  errorText?: string;
  approval?: { id: string; approved?: boolean; reason?: string };
}

/** A single part inside a stored Mastra message (format-2 content). */
export interface IStoredMessagePart {
  type: string;
  text?: string;
  toolInvocation?: IStoredToolInvocation;
  data?: unknown;
  [key: string]: unknown;
}

export interface IStoredMessageContent {
  format?: number;
  parts?: IStoredMessagePart[];
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface IStoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  createdAt?: string;
  content: IStoredMessageContent;
}

/**
 * Payload of the native `data-tool-call-approval` data part emitted by
 * Mastra when a run suspends on a gated tool call.
 */
export interface IToolCallApprovalData {
  runId?: string;
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  resumed?: boolean;
}

/** Input shape of the backend `callTool` agent tool. */
export interface ICallToolInput {
  toolId?: string;
  input?: Record<string, unknown>;
}
