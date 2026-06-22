import type { ToolsInput } from '@mastra/core/agent';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IMastraAgentDocument } from '@/agent/@types/agent';
import { IMastraProviderDocument } from '@/provider/@types/provider';
import { IMastraSettingsDocument } from '@/settings/@types/settings';
import { IMastraChatAttachment } from '@/session/@types/session';
import { MemoryContext } from '~/mastra/memory';

// Shared chat-turn types used across the staged turn pipeline (prepare → run →
// persist) and its fallback synthesis. Co-located so each stage file imports
// the same contract without a circular dependency through the orchestrator.

// How many recent messages of a session to replay as LLM context.
// 12 covers most conversations; reduces DB load + LLM token overhead per turn.
export const HISTORY_LIMIT = 12;

// A tool result as gathered from an agent run — modern and legacy result
// shapes expose different subsets of these fields, so all stay optional and
// the payload itself stays unknown.
export interface ToolResultLike {
  toolName?: string;
  name?: string;
  toolCallId?: string;
  id?: string;
  result?: unknown;
}

// The auth context a turn propagates to tools and follow-up LLM calls.
export interface TurnAuthCtx {
  userHeader?: string;
  token?: string;
  subdomain?: string;
}

// One message of the assembled LLM conversation. `content` widens beyond a
// plain string when attachments inline multimodal image parts.
export interface TurnMessage {
  role: string;
  content: string | unknown[];
}

// The slice of a Mastra generate() result the turn pipeline reads.
export interface AgentTurnResult {
  text?: string;
  toolResults?: ToolResultLike[];
  steps?: { toolResults?: ToolResultLike[] }[];
}

// The minimal Mastra agent surface the chat pipeline drives. Declared as
// loose methods so the concrete @mastra/core Agent — whose generics this
// pipeline never relies on — satisfies it structurally.
export interface TurnAgent {
  generate(messages: unknown, options?: unknown): Promise<AgentTurnResult>;
  stream(
    messages: unknown,
    options?: unknown,
  ): Promise<{ fullStream: unknown }>;
}

// One normalized streaming event — the SSE wire shape, also the unit the turn
// accumulator folds. (Mirrors the `data: {json}` events documented on the SSE
// route; `done` carries the final reply/messageId.)
export interface StreamEvent {
  type: string;
  text?: string;
  message?: string;
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  result?: unknown;
  isError?: boolean;
  reply?: string | null;
  interrupted?: boolean;
  messageId?: string | null;
  threadId?: string;
  title?: string;
}

// Per-turn Mastra Memory binding — which thread + (tenant-scoped) resource this
// turn reads/writes. Passed to generate()/stream() so Mastra recalls + persists.
export interface MemoryBinding {
  thread: string;
  resource: string;
}

// Who/what is driving a turn — the one knob that varies across the four
// callers (in-app chat, the GraphQL resolver, the frontline bot webhook, and
// scheduled runs). It decides resource scoping, the auth context, ownership
// gating, and whether memory rides on the agent's history toggle or on the
// message being non-empty. The rest of prepareTurn is shared.
export type TurnIdentity =
  | {
      // In-app user — the SSE route and the mastraAgentChat resolver. Threads
      // are owned/listed by the user's resource; ownership is enforced.
      kind: 'user';
      user: IUserDocument;
    }
  | {
      // The frontline bot webhook — a synthetic resource kept out of users'
      // chat lists. No ownership gate; memory rides on a non-empty message.
      kind: 'bot';
      resourceKey: string;
    }
  | {
      // A scheduled run — a schedule-scoped resource. No ownership gate; the
      // convo is the schedule's prompt (no learned digest woven in).
      kind: 'schedule';
      resourceKey: string;
    };

export interface PreparedTurn {
  agentConfig: IMastraAgentDocument;
  settings: IMastraSettingsDocument | null;
  providers: IMastraProviderDocument[];
  agent: TurnAgent;
  tools: ToolsInput;
  sessionId: string;
  convo: TurnMessage[];
  authCtx: TurnAuthCtx;
  advanced: boolean;
  // True when Mastra Memory is active for this turn (advanced + known tenant).
  useMemory: boolean;
  // Set when useMemory — the thread/resource Mastra Memory binds to.
  memoryBinding?: MemoryBinding;
  memCtx: MemoryContext;
  attachments?: IMastraChatAttachment[];
  // Learnings injected into this turn's context — stamped onto the assistant
  // message meta so feedback can be attributed back to them.
  learningIds: string[];
}
