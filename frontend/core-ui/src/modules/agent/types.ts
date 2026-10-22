/**
 * Shared types for the agents UI.
 *
 * REST shapes mirror the backend routes in
 * `backend/core-api/src/modules/agents/routes.ts`. Messages are the AI SDK v7
 * `UIMessage`s the server streams and `agentsThreadDetail` returns.
 */

import type { UIMessage } from 'ai';

import type { IAgentsFileMeta } from './agentsFiles';
import type { IAgentPageSelectionContext } from './pageSelections';

/** Metadata the agents chat carries on each message. */
export interface IAgentsMessageMetadata {
  createdAt?: string;
  /** Marks an ask_user answer sent as a user turn; never rendered as a bubble. */
  agentsAnswer?: boolean;
}

/** Payload of Mastra's `data-tool-call-suspended` part (ask_user and other suspensions). */
export interface IAgentsToolCallSuspendedData {
  runId?: string;
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  suspendPayload?: unknown;
}

/** The custom data parts the agents chat sends and receives, keyed by name without `data-`. */
export type AgentsDataParts = {
  'tool-call-suspended': IAgentsToolCallSuspendedData;
  'tool-call-approval': IToolCallApprovalData;
  'agents-files': {
    files: IAgentsFileMeta[];
    textFileUrls?: string[];
    textFileIds?: string[];
    displayText?: string;
  };
  'agents-page-selections': {
    selections: IAgentPageSelectionContext[];
    displayText?: string;
  };
};

export type AgentsUIMessage = UIMessage<
  IAgentsMessageMetadata,
  AgentsDataParts
>;
export type AgentsUIMessagePart = AgentsUIMessage['parts'][number];

export interface IAgentsThread {
  id: string;
  title?: string;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
