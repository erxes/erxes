import type { ToolsInput } from '@mastra/core/agent';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { getOrCreateAgent } from '~/mastra/agentRuntime';
import { isLegacyProvider } from '~/mastra/providers';
import { runWithAuth } from '~/mastra/requestContext';
import { isAdvancedMemoryEnabled } from '~/mastra/memory/config';
import {
  recallBlock,
  indexMessages,
  readWorkingMemory,
  refreshWorkingMemory,
  deriveResourceId,
  augmentConvo,
  MemoryContext,
} from '~/mastra/memory';
import {
  IMastraChatAttachment,
  IMastraMessageMeta,
} from '@/session/@types/session';
import { IMastraAgentDocument } from '@/agent/@types/agent';
import { IMastraProviderDocument } from '@/provider/@types/provider';
import { IMastraSettingsDocument } from '@/settings/@types/settings';
import { readLearnedDigest } from '~/mastra/learning/digest';
import { maybeGenerateThreadTitle } from '~/mastra/titler';
import {
  buildChatUserContent,
  historyAttachmentNote,
} from '~/mastra/files/chatContent';

// Shared chat-turn pipeline used by both the blocking GraphQL resolver
// (mastraAgentChat) and the streaming SSE route (/chat/stream). Holds the
// setup (thread ownership, history replay, memory blocks, auth context),
// the turn execution with its tool-call fallbacks, and the persistence of
// the completed exchange.

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

// A search_erxes_operations result is navigational (it lists candidate ops),
// never the final answer — the answer comes from execute_erxes_operation.
export function isSearchResult(tr: ToolResultLike): boolean {
  return (tr?.toolName || tr?.name || '')
    .toLowerCase()
    .includes('search_erxes_operations');
}

// True when a tool's return value carries a real answer worth reporting (vs a
// failure payload or empty/null). Covers query lists, mutation records, the raw
// execute_erxes_operation payload (any non-empty object), arrays, and scalars.
export function isRealToolData(data: unknown): boolean {
  if (data === true) return true;
  if (Array.isArray(data)) return true; // even an empty array is a valid "0 results"
  if (data == null) return false;
  if (typeof data !== 'object')
    return typeof data === 'string' && data.length > 0;
  const record = data as Record<string, unknown>;
  if (record.success === false) return false;
  if (record._id) return true;
  if (record.list !== undefined) return true;
  if (record.success === true) return true;
  return Object.keys(record).length > 0;
}

// The loosely-shaped object payload a tool may return — only the fields the
// fallback builder inspects are declared; everything else stays unknown.
interface FallbackPayload {
  success?: boolean;
  _id?: unknown;
  name?: unknown;
  list?: unknown;
  availableStages?: string[];
  instruction?: string;
  message?: string;
  error?: string;
}

/** Pluralized "Found N result(s)." line shared by the array and list branches. */
function formatFoundCount(count: number): string {
  return `Found ${count} result${count !== 1 ? 's' : ''}.`;
}

/** Surface a failed payload's own guidance (stage list, instruction, message). */
function describeFailedResult(payload: FallbackPayload): string | null {
  if (payload.availableStages?.length) {
    const names = payload.availableStages.join(', ');
    return `Which stage? Available: ${names}.`;
  }
  if (payload.instruction) return payload.instruction;
  const msg = payload.message || payload.error;
  if (msg) return `Failed: ${msg}`;
  return null;
}

/** Outcome line for a created/updated/deleted named record; null when not one. */
function describeNamedRecord(
  payload: FallbackPayload,
  op: string,
): string | null {
  if (!payload._id || !payload.name) return null;
  if (op.includes('add') || op.includes('create'))
    return `"${payload.name}" was created successfully.`;
  if (op.includes('edit') || op.includes('update'))
    return `"${payload.name}" was updated successfully.`;
  if (op.includes('remove') || op.includes('delete'))
    return `"${payload.name}" was deleted.`;
  return `Done: "${payload.name}".`;
}

// Build a plain-text message from tool results when the model produces no text.
export function buildFallbackFromResults(
  toolResults: ToolResultLike[],
): string | null {
  for (const tr of toolResults) {
    if (isSearchResult(tr)) continue;

    const data = tr.result ?? tr;

    if (data === true) return 'Action completed successfully.';
    if (Array.isArray(data)) return formatFoundCount(data.length);
    if (!data || typeof data !== 'object') continue;

    const payload = data as FallbackPayload;

    // Explicit failure — surface the tool's own guidance. execute_erxes_operation
    // reports failures under `error`; the GraphQL not-found path uses `message`.
    if (payload.success === false) return describeFailedResult(payload);

    const op: string = (tr.toolName || tr.name || '').toLowerCase();

    const namedOutcome = describeNamedRecord(payload, op);
    if (namedOutcome) return namedOutcome;

    if (payload.list && Array.isArray(payload.list)) {
      return formatFoundCount(payload.list.length);
    }

    if (payload.success === true) return 'Action completed successfully.';
  }
  return null;
}

// ─── Text-based tool call extraction ─────────────────────────────────────────
//
// Some models (e.g. meta/llama-3.1-8b-instruct via NVIDIA NIM) do not support
// the structured tool_calls response field.  Instead they output their function
// call intent as plain JSON text.  We detect those patterns here and execute
// the tool directly, so the agent works even with these models.

export interface TextToolCall {
  name: string;
  args: Record<string, unknown>;
}

/** Detect a tool call a model emitted as plain text; null when none matches. */
export function extractTextToolCall(text: string): TextToolCall | null {
  const trimmed = text.trim();

  // Pattern 1 — OpenAI-style JSON array: [{"id":"...","type":"function","function":{"name":"...","arguments":"{...}"}}]
  try {
    const arr = JSON.parse(trimmed);
    if (
      Array.isArray(arr) &&
      arr[0]?.type === 'function' &&
      arr[0]?.function?.name
    ) {
      const fn = arr[0].function;
      const args =
        typeof fn.arguments === 'string'
          ? JSON.parse(fn.arguments)
          : fn.arguments ?? {};
      return { name: fn.name, args };
    }
  } catch {
    /* not OpenAI-array JSON — try the next pattern */
  }

  // Pattern 2 — Simple object: {"name":"toolName","parameters":{...}} or {"name":"...","arguments":{...}}
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === 'object' && typeof obj.name === 'string') {
      const rawArgs = obj.arguments ?? obj.parameters ?? obj.args ?? {};
      const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
      return { name: obj.name, args };
    }
  } catch {
    /* not a simple tool-call object — try the next pattern */
  }

  // Pattern 3 — <tool_call>...</tool_call> tags. Index scan instead of a
  // lazy [\s\S]*? regex, which backtracks super-linearly on bad input.
  const lowerT = trimmed.toLowerCase();
  const openTag = lowerT.indexOf('<tool_call>');
  const closeTag =
    openTag === -1 ? -1 : lowerT.indexOf('</tool_call>', openTag + 11);
  if (openTag !== -1 && closeTag !== -1) {
    try {
      const obj = JSON.parse(trimmed.slice(openTag + 11, closeTag).trim());
      if (obj?.name) {
        const args =
          typeof obj.arguments === 'string'
            ? JSON.parse(obj.arguments)
            : obj.arguments ?? obj.parameters ?? {};
        return { name: obj.name, args };
      }
    } catch {
      /* malformed <tool_call> payload — try the next pattern */
    }
  }

  // Pattern 4 — "The function call that best answers the user's question is: toolName({...})"
  const nimMatch = trimmed.match(
    /function call[^\n]*?:\s*(\w+)\((\{[\s\S]*\})\)/i,
  );
  if (nimMatch) {
    try {
      return { name: nimMatch[1], args: JSON.parse(nimMatch[2]) };
    } catch {
      /* unparsable call arguments — treat as no tool call */
    }
  }

  return null;
}

// ─── Turn setup ───────────────────────────────────────────────────────────────

export interface PreparedTurn {
  agentConfig: IMastraAgentDocument;
  settings: IMastraSettingsDocument | null;
  providers: IMastraProviderDocument[];
  agent: TurnAgent;
  tools: ToolsInput;
  sessionId: string;
  convo: TurnMessage[];
  authCtx: TurnAuthCtx;
  isLegacy: boolean;
  advanced: boolean;
  memCtx: MemoryContext;
  attachments?: IMastraChatAttachment[];
  // Learnings injected into this turn's context — stamped onto the assistant
  // message meta so feedback can be attributed back to them.
  learningIds: string[];
}

// Everything a chat turn needs before the model runs: agent + tools, thread
// ownership check, replayed history, advanced-memory blocks, and the auth
// context tools execute under. Throws user-facing errors on bad agent/thread.
export async function prepareChatTurn(params: {
  models: IModels;
  subdomain: string;
  user: IUserDocument;
  agentId: string;
  message: string;
  threadId?: string;
  attachments?: IMastraChatAttachment[];
}): Promise<PreparedTurn> {
  const { models, subdomain, user, agentId, message, threadId, attachments } =
    params;

  // Same NoSQL-injection guard as sessionId below: agentId arrives from the
  // request body, so a crafted object must never reach a Mongo query.
  if (typeof agentId !== 'string' || !agentId) {
    throw new Error('agentId must be a non-empty string');
  }

  const agentConfig = await models.MastraAgent.findOne({
    agentId,
    isEnabled: true,
  });
  if (!agentConfig) throw new Error(`Agent "${agentId}" not found or disabled`);

  const settings = await models.MastraSettings.findOne({});
  const providers = await models.MastraProvider.find({ isEnabled: true });
  const { agent, tools } = await getOrCreateAgent(agentConfig, models);

  // Stable session id — the persisted thread this turn belongs to.
  // typeof guard keeps crafted non-string payloads out of Mongo queries
  // (NoSQL injection via query operators).
  const sessionId =
    typeof threadId === 'string' && threadId ? threadId : `chat-${Date.now()}`;

  // Ownership gate BEFORE any history is replayed: throws if the thread
  // belongs to another user (prevents reading or continuing someone else's
  // session by passing their threadId). Creates/claims the thread otherwise.
  await models.MastraThread.ensureThread(sessionId, agentId, user._id, message);

  const useHistory = agentConfig.memoryEnabled !== false;
  // Advanced memory rides on top of replay; a memory-disabled agent gets neither.
  const advanced = isAdvancedMemoryEnabled() && useHistory;

  // Build the LLM context from persisted history (the system prompt already
  // lives in the agent's instructions, so only user/assistant turns here).
  const history = useHistory
    ? await models.MastraMessage.getRecent(sessionId, HISTORY_LIMIT)
    : [];
  // Replayed messages keep a pointer to their attachments so files from
  // earlier turns stay readable via the read-attachment tool.
  const recentHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.attachments?.length
      ? `${msg.content}\n\n${historyAttachmentNote(msg.attachments)}`
      : msg.content,
  }));

  const memCtx: MemoryContext = {
    subdomain,
    resourceId: deriveResourceId({ user, agentId }),
    threadId: sessionId,
    agentId,
  };

  // Semantic recall (cross-session long-term memory) + working memory (the
  // persistent user profile) + the tenant's learned digest (shared "Agent
  // knowledge" — PII-free, independent of the per-user memory switch). All
  // injected as plain system context blocks. Best-effort: each returns null
  // on any error, never blocking the turn.
  const [[recall, wmBlock], digest] = await Promise.all([
    advanced
      ? Promise.all([
          recallBlock(message, memCtx),
          readWorkingMemory(models, memCtx),
        ])
      : Promise.resolve([null, null] as [string | null, string | null]),
    readLearnedDigest(models, agentId),
  ]);

  const convo: TurnMessage[] = augmentConvo({
    recentHistory,
    userMessage: message,
    recallBlock: recall,
    workingMemoryBlock: wmBlock,
    learnedDigestBlock: digest?.block,
  });

  // Attachments reshape the final user turn: manifest text + inlined image
  // parts. The persisted message keeps the raw text; only the LLM convo is
  // augmented. (augmentConvo always places the user message last.)
  if (attachments?.length) {
    const content = await buildChatUserContent({
      message,
      attachments,
      erxesApiUrl: settings?.erxesApiUrl || 'http://localhost:4000',
    });
    convo[convo.length - 1] = { role: 'user', content };
  }

  const userHeader = user
    ? Buffer.from(JSON.stringify(user)).toString('base64')
    : undefined;
  const authCtx = { userHeader, token: settings?.erxesApiToken, subdomain };
  const isLegacy = isLegacyProvider(agentConfig.provider, providers);

  return {
    agentConfig,
    settings,
    providers,
    // The published Agent generics type tool results as wire chunks; the
    // runtime objects this pipeline reads are the duck-typed legacy/modern
    // shapes in ToolResultLike, hence the structural cast (cf. titler.ts).
    agent: agent as unknown as TurnAgent,
    tools,
    sessionId,
    convo,
    authCtx,
    isLegacy,
    advanced,
    memCtx,
    attachments,
    learningIds: digest?.ids ?? [],
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

// Persist the completed exchange so the session survives reloads, then index
// it into long-term memory (best-effort). Assistant `meta` carries thinking /
// tool-call artifacts for the chat UI.
//
// Returns `titlePromise`: the conversation auto-titler kicked off in the
// background (resolves to the new title or null). The SSE route awaits it
// briefly after `done` to push the title to the client; other callers can
// ignore it — it self-persists.
export async function persistTurn(params: {
  models: IModels;
  prepared: PreparedTurn;
  message: string;
  reply: string | null;
  meta?: IMastraMessageMeta;
}): Promise<{
  titlePromise: Promise<string | null>;
  // Persisted assistant message id — sent to the client so the reply can be
  // rated (thumbs feedback) without a reload.
  assistantMessageId: string | null;
}> {
  const { models, prepared, message, reply, meta } = params;
  const {
    sessionId,
    advanced,
    memCtx,
    agentConfig,
    providers,
    authCtx,
    isLegacy,
    attachments,
  } = prepared;

  // Stamp which learnings were in context so a later thumbs rating can be
  // attributed to them (mastraMessageFeedback reads this back).
  const fullMeta: IMastraMessageMeta | undefined = prepared.learningIds?.length
    ? { ...(meta ?? {}), learningIdsInContext: prepared.learningIds }
    : meta;

  const userMsg = await models.MastraMessage.addMessage(
    sessionId,
    'user',
    message,
    undefined,
    attachments,
  );
  const asstMsg = reply
    ? await models.MastraMessage.addMessage(
        sessionId,
        'assistant',
        reply,
        fullMeta,
      )
    : null;
  await models.MastraThread.touchThread(sessionId);

  // Rename the thread to an LLM summary of the conversation (replacing the
  // first-message snippet). Runs concurrently with memory indexing; only
  // meaningful once an assistant reply exists.
  const titlePromise = reply
    ? maybeGenerateThreadTitle({
        models,
        threadId: sessionId,
        provider: agentConfig.provider,
        model: agentConfig.model,
        providers,
        authCtx,
        isLegacy,
      })
    : Promise.resolve<string | null>(null);

  // Index the new exchange into Qdrant for future recall (best-effort).
  if (advanced) {
    const toIndex = [
      {
        id: String(userMsg._id),
        role: 'user',
        text: message,
        createdAt: userMsg.createdAt?.toISOString?.(),
      },
    ];
    if (asstMsg && reply) {
      toIndex.push({
        id: String(asstMsg._id),
        role: 'assistant',
        text: reply,
        createdAt: asstMsg.createdAt?.toISOString?.(),
      });
    }
    await indexMessages(memCtx, toIndex);

    // Refresh the user's persistent profile from this exchange. Fire-and-forget
    // (and best-effort) so it never adds latency to the reply.
    if (reply) {
      refreshWorkingMemory({
        models,
        ctx: memCtx,
        exchange: { user: message, assistant: reply },
        provider: agentConfig.provider,
        model: agentConfig.model,
        providers,
        authCtx,
        isLegacy,
      });
    }
  }

  return {
    titlePromise,
    assistantMessageId: asstMsg ? String(asstMsg._id) : null,
  };
}

// ─── Turn execution (blocking) ───────────────────────────────────────────────

// Runs a single agent turn over the full conversation array and returns the
// reply text (or null). Holds the tool-call extraction / synthesis / fallback
// logic; throws a user-facing message on hard failures.
export async function runAgentTurn(params: {
  agent: TurnAgent;
  tools: ToolsInput;
  convo: TurnMessage[];
  message: string;
  isLegacy: boolean;
  authCtx: TurnAuthCtx;
  depth?: number;
}): Promise<string | null> {
  const { agent, tools, convo, message, isLegacy, authCtx, depth = 0 } = params;

  try {
    const result = await runWithAuth(authCtx, () =>
      isLegacy ? agent.generateLegacy(convo) : agent.generate(convo),
    );

    if (result.text) {
      const trimmed = result.text.trimStart();

      // ── Text-based tool call fallback ──────────────────────────────────
      // Models that don't support the tool_calls API field output their
      // function call intent as plain text.  Detect, extract, and execute.
      const extracted = extractTextToolCall(trimmed);
      if (extracted) {
        const handled = await executeTextToolCall({
          agent,
          tools,
          convo,
          message,
          isLegacy,
          authCtx,
          depth,
          extracted,
          rawText: trimmed,
        });
        if (handled !== undefined) return handled;
      }

      // Detect legacy "The function call that best answers..." format (no args extractable)
      if (trimmed.startsWith('The function call that best answers')) {
        throw new Error(
          'This model outputs tool calls as plain text and the call could not be parsed. ' +
            'For reliable tool use, switch to: GPT-4o, Claude Sonnet, Gemini 2.0 Flash, ' +
            'Kimi K2 (kimi-k2-0711-preview), Llama 3.3 70B (Groq or NVIDIA NIM), or Mistral Large.',
        );
      }

      return result.text;
    }

    // Collect tool results from all steps, deduplicated.
    const uniqueResults = dedupeToolResults([
      ...(result.toolResults || []),
      ...(result.steps || []).flatMap((step) => step.toolResults || []),
    ]);

    if (!uniqueResults.length) return null;

    // Diagnostic: what did the agent actually call, and what came back?
    logToolResults(uniqueResults);

    return await synthesizeFromToolResults({
      agent,
      message,
      isLegacy,
      authCtx,
      toolResults: uniqueResults,
    });
  } catch (err) {
    throw toUserFacingError(err);
  }
}

// Normalize provider failures into messages safe to show a non-technical user.
export function toUserFacingError(err: unknown): Error {
  const msg: string =
    (err as { message?: string } | null | undefined)?.message ?? String(err);
  if (
    msg.toLowerCase().includes('too many requests') ||
    msg.includes('429') ||
    msg.toLowerCase().includes('rate limit')
  ) {
    return new Error(
      'The AI provider is temporarily rate-limited. Please wait a moment and try again.',
    );
  }
  return new Error(`Agent execution failed: ${msg}`);
}

/** Drop duplicate tool results gathered across steps, keyed by tool-call id. */
export function dedupeToolResults(
  gathered: ToolResultLike[],
): ToolResultLike[] {
  const seenIds = new Set<string>();
  return gathered.filter((tr) => {
    const id = tr.toolCallId || tr.id || JSON.stringify(tr);
    return seenIds.has(id) ? false : (seenIds.add(id), true);
  });
}

/** Diagnostic log of which tools ran and the shape of what each returned. */
export function logToolResults(uniqueResults: ToolResultLike[]) {
  console.log(
    '[mastraAgentChat] tool results:',
    JSON.stringify(
      uniqueResults.map((tr) => {
        const data = tr.result ?? tr;
        const record =
          data && typeof data === 'object'
            ? (data as Record<string, unknown>)
            : null;
        return {
          tool: tr.toolName || tr.name,
          shape:
            data == null
              ? 'null'
              : Array.isArray(data)
              ? `array(${data.length})`
              : typeof data === 'object'
              ? Object.keys(data).slice(0, 6)
              : typeof data,
          success: record ? record.success : undefined,
          error: record ? record.error || record.message : undefined,
        };
      }),
    ),
  );
}

// Turn a set of tool results into a one-or-two sentence human answer. Skips
// synthesis when nothing real came back (synthesis would fabricate success).
export async function synthesizeFromToolResults(params: {
  agent: TurnAgent;
  message: string;
  isLegacy: boolean;
  authCtx: TurnAuthCtx;
  toolResults: ToolResultLike[];
}): Promise<string> {
  const { agent, message, isLegacy, authCtx, toolResults } = params;

  // search_erxes_operations is navigational; only execute (action) results
  // decide whether the turn produced something real to report.
  const actionResults = toolResults.filter((tr) => !isSearchResult(tr));
  const hasRealResult = actionResults.some((tr) =>
    isRealToolData(tr.result ?? tr),
  );
  const fallback = buildFallbackFromResults(toolResults);

  if (!hasRealResult) {
    return fallback || 'Something went wrong. Please try again.';
  }

  // All tool calls succeeded — synthesise a human-readable summary from the
  // action results (the search listing would only distract the model).
  const toolContext = actionResults
    .map((tr) => {
      const name = tr.toolName || tr.name || 'tool';
      const data = tr.result ?? tr;
      return `[${name}]:\n${
        typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      }`;
    })
    .join('\n\n');

  const synthesisMessages: TurnMessage[] = [
    {
      role: 'user',
      content: `Report the following tool results accurately to the user in one or two sentences. Do not call any tools. Do not invent information not present in the results.\n\nUser request: ${message}\n\n${toolContext}`,
    },
  ];

  try {
    const synthesis = await runWithAuth(authCtx, () =>
      isLegacy
        ? agent.generateLegacy(synthesisMessages)
        : agent.generate(synthesisMessages, { maxSteps: 1 }),
    );
    return synthesis.text || fallback || 'Done.';
  } catch {
    return fallback || 'Done.';
  }
}

// The duck-typed surface of a bound tool the text-call fallback drives: an
// optional id for lookup and the raw execute the agent would have invoked.
interface ExecutableToolLike {
  id?: string;
  execute?: (args: Record<string, unknown>) => Promise<unknown>;
}

// Execute a tool call the model emitted as plain text. Returns the reply text,
// null (caller's fallback applies), or undefined when the tool wasn't found /
// failed and the original model text should be returned as-is.
export async function executeTextToolCall(params: {
  agent: TurnAgent;
  tools: ToolsInput;
  convo: TurnMessage[];
  message: string;
  isLegacy: boolean;
  authCtx: TurnAuthCtx;
  depth: number;
  extracted: TextToolCall;
  rawText: string;
  onToolEvent?: (event: {
    phase: 'call' | 'result';
    toolName: string;
    args?: Record<string, unknown>;
    result?: unknown;
    isError?: boolean;
  }) => void;
}): Promise<string | null | undefined> {
  const {
    agent,
    tools,
    convo,
    message,
    isLegacy,
    authCtx,
    depth,
    extracted,
    rawText,
    onToolEvent,
  } = params;

  // Find the tool by name or by toolId
  const toolMap = tools as unknown as Record<
    string,
    ExecutableToolLike | undefined
  >;
  const tool =
    toolMap[extracted.name] ||
    Object.entries(toolMap).find(
      ([, candidate]) => candidate?.id === extracted.name,
    )?.[1];

  if (!tool?.execute) return undefined;
  // Bound so the auth-context closure below keeps the tool as `this`.
  const executeTool = tool.execute.bind(tool);

  try {
    onToolEvent?.({
      phase: 'call',
      toolName: extracted.name,
      args: extracted.args,
    });
    const toolResult = await runWithAuth(authCtx, () =>
      executeTool(extracted.args),
    );
    onToolEvent?.({
      phase: 'result',
      toolName: extracted.name,
      args: extracted.args,
      result: toolResult,
      isError: !isRealToolData(toolResult),
    });
    const syntheticResults = [
      {
        toolName: extracted.name,
        result: toolResult,
        toolCallId: `text-${Date.now()}`,
      },
    ];

    console.log(
      '[text-tool-call]',
      extracted.name,
      JSON.stringify(extracted.args),
      '→',
      (JSON.stringify(toolResult) || '').slice(0, 300),
    );

    // search_erxes_operations is navigational. The model emitted it as
    // text (no native multi-step), so feed the results back and let it
    // continue to execute_erxes_operation. Bounded to avoid loops.
    if (
      extracted.name.toLowerCase().includes('search_erxes_operations') &&
      depth < 2
    ) {
      const followup = [
        ...convo,
        { role: 'assistant', content: rawText },
        {
          role: 'user',
          content:
            `Available operations (from search_erxes_operations):\n${JSON.stringify(
              toolResult,
            )}\n\n` +
            `Now call execute_erxes_operation with the exact "operation" name and an "args" object to fulfil: "${message}".`,
        },
      ];
      return await runAgentTurn({
        agent,
        tools,
        convo: followup,
        message,
        isLegacy,
        authCtx,
        depth: depth + 1,
      });
    }

    const fallback = buildFallbackFromResults(syntheticResults);
    if (!isRealToolData(toolResult))
      return fallback || 'Something went wrong. Please try again.';

    // Synthesise a human-readable summary.
    const toolContext = `[${extracted.name}]:\n${JSON.stringify(
      toolResult,
      null,
      2,
    )}`;
    const synthesisMessages: TurnMessage[] = [
      {
        role: 'user',
        content: `Report the following tool results accurately to the user in one or two sentences. Do not call any tools.\n\nUser request: ${message}\n\n${toolContext}`,
      },
    ];
    try {
      const synthesis = await runWithAuth(authCtx, () =>
        isLegacy
          ? agent.generateLegacy(synthesisMessages)
          : agent.generate(synthesisMessages, { maxSteps: 1 }),
      );
      return synthesis.text || fallback || 'Done.';
    } catch {
      return fallback || 'Done.';
    }
  } catch {
    // Tool execution failed — let the caller return the original text
    return undefined;
  }
}
