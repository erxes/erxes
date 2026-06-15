// ---------------------------------------------------------------------------
// AgentRunner — one interface over the native vs OpenAI-compatible split.
//
// Native providers (OpenAI/Anthropic/Google) drive a Mastra agent through
// generate()/stream(); OpenAI-compatible ("legacy") providers go through
// generateLegacy()/streamLegacy(). Every caller used to re-decide which method
// to call (`isLegacy ? generateLegacy(m) : generate(m, opts)`), so the branch
// was smeared across the chat turn, the SSE route, the titler, the activity
// narrator, the working-memory extractor and the workflow judge.
//
// makeRunner() binds the agent and its isLegacy flag once and exposes a single
// generate()/stream() pair. Options (notably maxSteps) are forwarded to BOTH
// paths — the legacy methods previously received no per-call options, so a
// one-shot `{ maxSteps: 1 }` synthesis call silently ran with the agent's full
// step budget and could loop into tool calls.
// ---------------------------------------------------------------------------

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

// The slice of a Mastra generate() result the turn pipeline reads.
export interface AgentTurnResult {
  text?: string;
  toolResults?: ToolResultLike[];
  steps?: { toolResults?: ToolResultLike[] }[];
}

// Per-call options that apply to both provider paths. Kept deliberately small:
// only the fields the pipeline actually sets. maxSteps caps the tool-call loop;
// abortSignal cancels a stream when the client disconnects.
export interface RunOptions {
  maxSteps?: number;
  abortSignal?: AbortSignal;
}

// The uniform surface every caller drives. The native/legacy choice lives
// behind this interface, not at the call site.
export interface AgentRunner {
  generate(messages: unknown, options?: RunOptions): Promise<AgentTurnResult>;
  stream(
    messages: unknown,
    options?: RunOptions,
  ): Promise<{ fullStream: unknown }>;
}

// The four methods a Mastra Agent exposes for the two paths. Declared
// structurally so this module needs no static @mastra/core dependency — the
// lazily-built helper agents (titler, extractor, judge) satisfy it too.
interface LegacyCapableAgent {
  generate(messages: unknown, options?: unknown): Promise<AgentTurnResult>;
  generateLegacy(
    messages: unknown,
    options?: unknown,
  ): Promise<AgentTurnResult>;
  stream(
    messages: unknown,
    options?: unknown,
  ): Promise<{ fullStream: unknown }>;
  streamLegacy(
    messages: unknown,
    options?: unknown,
  ): Promise<{ fullStream: unknown }>;
}

/**
 * Bind a Mastra agent and its provider kind into one runner. `isLegacy` is
 * resolved once (from the provider, via isLegacyProvider) and never travels
 * with the call again.
 */
export function makeRunner(agent: unknown, isLegacy: boolean): AgentRunner {
  const mastraAgent = agent as LegacyCapableAgent;
  return {
    generate: (messages, options) =>
      isLegacy
        ? mastraAgent.generateLegacy(messages, options)
        : mastraAgent.generate(messages, options),
    stream: (messages, options) =>
      isLegacy
        ? mastraAgent.streamLegacy(messages, options)
        : mastraAgent.stream(messages, options),
  };
}
