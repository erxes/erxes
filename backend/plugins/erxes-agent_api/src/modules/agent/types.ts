import type { ToolsInput } from '@mastra/core/agent';
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

// Per-turn Mastra Memory binding — which thread + (tenant-scoped) resource this
// turn reads/writes. Passed to generate()/stream() so Mastra recalls + persists.
export interface MemoryBinding {
  thread: string;
  resource: string;
}

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
