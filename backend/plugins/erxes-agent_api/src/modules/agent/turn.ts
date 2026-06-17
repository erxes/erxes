import type { ToolsInput } from '@mastra/core/agent';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { getOrCreateAgent } from '~/mastra/agentRuntime';
import { runWithAuth } from '~/mastra/requestContext';
import { isAdvancedMemoryEnabled } from '~/mastra/memory/config';
import { scopedResource, getMastraMemory } from '~/mastra/memory/mastraMemory';
import { getThreadTitle } from '@/session/nativeStore';
import { deriveResourceId, augmentConvo, MemoryContext } from '~/mastra/memory';
import {
  IMastraChatAttachment,
  IMastraMessageMeta,
} from '@/session/@types/session';
import { IMastraAgentDocument } from '@/agent/@types/agent';
import { IMastraProviderDocument } from '@/provider/@types/provider';
import { IMastraSettingsDocument } from '@/settings/@types/settings';
import { readLearnedDigest } from '~/mastra/learning/digest';
import { buildChatUserContent } from '~/mastra/files/chatContent';

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
  stream(
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

// ─── Turn setup ───────────────────────────────────────────────────────────────

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
  const { agent, tools } = await getOrCreateAgent(
    agentConfig,
    models,
    subdomain,
  );

  // Stable session id — the persisted thread this turn belongs to.
  // typeof guard keeps crafted non-string payloads out of Mongo queries
  // (NoSQL injection via query operators).
  const sessionId =
    typeof threadId === 'string' && threadId ? threadId : `chat-${Date.now()}`;

  const useHistory = agentConfig.memoryEnabled !== false;
  // Advanced memory rides on the agent's own memory toggle.
  const advanced = isAdvancedMemoryEnabled() && useHistory;

  const memCtx: MemoryContext = {
    subdomain,
    resourceId: deriveResourceId({ user, agentId }),
    threadId: sessionId,
    agentId,
  };

  // Mastra Memory (attached to the agent in getOrCreateAgent) is the ONLY chat
  // store: it persists the turn, replays recent history, and runs semantic
  // recall + working memory via the per-turn binding below. Active when advanced
  // memory is on AND we know the tenant. (No tenant → the turn is answered
  // statelessly; there is no custom fallback store.)
  const useMemory = advanced && Boolean(subdomain);
  const memoryBinding = useMemory
    ? {
        thread: sessionId,
        resource: scopedResource(subdomain, memCtx.resourceId),
      }
    : undefined;

  // Ownership gate: a CONTINUED thread must belong to this user. getThreadById
  // without a resource returns the thread whatever its owner; if it exists under
  // a different resource it is someone else's session — reported as "not found"
  // (no existence leak). A fresh sessionId simply doesn't exist yet.
  if (memoryBinding && typeof threadId === 'string' && threadId) {
    const memory = await getMastraMemory(subdomain);
    const existing = (await memory.getThreadById({
      threadId: sessionId,
    } as never)) as { resourceId?: string } | null;
    if (existing && existing.resourceId !== memoryBinding.resource) {
      throw new Error('Thread not found');
    }
  }

  // The tenant's learned digest (shared "Agent knowledge") is woven into the
  // turn — separate from Mastra Memory. Best-effort: null on error.
  const digest = await readLearnedDigest(models, agentId);

  // Mastra Memory replays recent history + recall itself, so generate() gets
  // ONLY the new user message (+ the learned digest). Passing replayed history
  // here would stop Mastra from persisting the turn to its store.
  const convo: TurnMessage[] = augmentConvo({
    recentHistory: [],
    userMessage: message,
    recallBlock: null,
    workingMemoryBlock: null,
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

  return {
    agentConfig,
    settings,
    providers,
    // The published Agent generics type tool results as wire chunks; the
    // runtime objects this pipeline reads are the duck-typed shapes in
    // ToolResultLike, hence the structural cast (cf. titler.ts).
    agent: agent as unknown as TurnAgent,
    tools,
    sessionId,
    convo,
    authCtx,
    advanced,
    useMemory,
    memoryBinding,
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
  const { prepared, reply, meta } = params;
  const { useMemory, memCtx, agentConfig, attachments } = prepared;

  // Stamp which learnings were in context so a later thumbs rating can be
  // attributed to them (mastraMessageFeedback reads this back).
  const fullMeta: IMastraMessageMeta | undefined = prepared.learningIds?.length
    ? { ...(meta ?? {}), learningIdsInContext: prepared.learningIds }
    : meta;

  // Mastra Memory already persisted the [user, assistant] turn during
  // generate()/stream() — there is no custom store. The title is owned by
  // Mastra's native generateTitle (it sets thread.title once, while empty);
  // read it back so the SSE route can push it to the client.
  const titlePromise: Promise<string | null> =
    reply && prepared.memoryBinding
      ? getThreadTitle(
          memCtx.subdomain,
          prepared.memoryBinding.thread,
          prepared.memoryBinding.resource,
        ).catch(() => null)
      : Promise.resolve<string | null>(null);

  // Enrich the native records with the erxes-only turn artifacts and recover
  // the NATIVE assistant message id — that is what the client rates (feedback
  // resolves the native id). Best-effort: a patch failure never affects the
  // reply.
  let nativeAssistantId: string | null = null;
  if (useMemory && prepared.memoryBinding) {
    try {
      nativeAssistantId = await patchNativeTurn({
        subdomain: memCtx.subdomain,
        binding: prepared.memoryBinding,
        agentId: agentConfig.agentId,
        reply,
        meta: fullMeta,
        attachments,
      });
    } catch (e) {
      console.warn(
        `[native-chat-store] turn patch skipped: ${(e as Error)?.message || e}`,
      );
    }
  }

  return { titlePromise, assistantMessageId: nativeAssistantId };
}

// ─── Native chat store mirror (Phase 2) ─────────────────────────────────────

// The minimal native-message shape the metadata patch reads: the id to target
// and the V2 `content` blob it merges erxes fields into. (Mastra's full
// MastraDBMessage is wider; we only touch these.)
interface NativeChatMessage {
  id: string;
  role: string;
  content?: { metadata?: Record<string, unknown> } & Record<string, unknown>;
}

// Merge an erxes field blob into a native message's content under a namespaced
// `metadata.erxes` key — namespaced so it never collides with Mastra's own
// content.metadata keys — preserving the rest of the V2 content untouched.
function mergeErxesMeta(
  content: NativeChatMessage['content'],
  erxes: Record<string, unknown>,
): Record<string, unknown> {
  const base = (content ?? {}) as Record<string, unknown>;
  const metadata = (base.metadata ?? {}) as Record<string, unknown>;
  const prevErxes = (metadata.erxes ?? {}) as Record<string, unknown>;
  return {
    ...base,
    metadata: { ...metadata, erxes: { ...prevErxes, ...erxes } },
  };
}

// Mirror erxes-only turn fields onto Mastra's natively-persisted turn so the
// native store can later become the chat read source (docs/NATIVE-CHAT-STORE.md,
// Phase 2). Mastra already persisted the [user, assistant] pair during
// generate()/stream(); here we (1) merge the erxes turn meta (ordered parts,
// thinking, tool calls, interrupted flag, learnings-in-context) and attachment
// pointers into each message's content.metadata.erxes, and (2) stamp
// thread.metadata.agentId so the native thread list can filter by agent (a
// binding Mastra has no concept of). Best-effort; the caller swallows errors.
export async function patchNativeTurn(params: {
  subdomain: string;
  binding: MemoryBinding;
  agentId: string;
  reply: string | null;
  meta?: IMastraMessageMeta;
  attachments?: IMastraChatAttachment[];
}): Promise<string | null> {
  const { subdomain, binding, agentId, reply, meta, attachments } = params;
  const memory = await getMastraMemory(subdomain);

  // Recent messages newest-first. No vectorSearchString → recall is a plain
  // recency list (not semantic search, no embedding/LLM work), and an explicit
  // perPage overrides the instance's lastMessages. The turn just persisted sits
  // at the tail, so the newest assistant/user rows are this turn's.
  const recalled = (await memory.recall({
    threadId: binding.thread,
    resourceId: binding.resource,
    perPage: 4,
    page: 0,
    orderBy: { field: 'createdAt', direction: 'DESC' },
  } as never)) as { messages?: NativeChatMessage[] };
  const recent = recalled?.messages ?? [];

  const patches: { id: string; content: Record<string, unknown> }[] = [];

  const assistant = reply
    ? recent.find((m) => m.role === 'assistant')
    : undefined;
  if (assistant && meta) {
    const erxes: Record<string, unknown> = {
      ...(meta.parts ? { parts: meta.parts } : {}),
      ...(meta.thinking ? { thinking: meta.thinking } : {}),
      ...(meta.toolCalls ? { toolCalls: meta.toolCalls } : {}),
      ...(meta.interrupted ? { interrupted: true } : {}),
      ...(meta.learningIdsInContext?.length
        ? { learningIdsInContext: meta.learningIdsInContext }
        : {}),
      // Langfuse trace id for this turn — lets a later thumbs rating attach a
      // human score to the right trace (Plan B; read by findOwnedAssistantMessage).
      ...(meta.langfuseTraceId ? { langfuseTraceId: meta.langfuseTraceId } : {}),
    };
    if (Object.keys(erxes).length) {
      patches.push({ id: assistant.id, content: mergeErxesMeta(assistant.content, erxes) });
    }
  }

  const userMsg = attachments?.length
    ? recent.find((m) => m.role === 'user')
    : undefined;
  if (userMsg) {
    patches.push({
      id: userMsg.id,
      content: mergeErxesMeta(userMsg.content, { attachments }),
    });
  }

  if (patches.length) {
    await memory.updateMessages({ messages: patches } as never);
  }

  // Stamp the erxes thread↔agent binding + tenant. agentId backs the thread-list
  // filter; subdomain lets the learning sweep enumerate a tenant's threads
  // (native listThreads filters by exact resourceId or metadata, and resourceId
  // is per-user). updateThread requires a title, so preserve the current one
  // (native generateTitle / a later rename own it).
  const thread = (await memory.getThreadById({
    threadId: binding.thread,
    resourceId: binding.resource,
  } as never)) as { title?: string; metadata?: Record<string, unknown> } | null;
  const tMeta = (thread?.metadata ?? {}) as {
    agentId?: string;
    subdomain?: string;
  };
  if (thread && (tMeta.agentId !== agentId || tMeta.subdomain !== subdomain)) {
    await memory.updateThread({
      id: binding.thread,
      title: thread.title ?? '',
      metadata: { ...(thread.metadata ?? {}), agentId, subdomain },
    } as never);
  }

  // The native assistant message id — the client rates this (feedback resolves
  // it back via the native store).
  return assistant?.id ?? null;
}

// ─── Turn execution (blocking) ───────────────────────────────────────────────

// Runs a single agent turn over the full conversation array and returns the
// reply text (or null). With native multi-step generate() the model produces
// the final answer itself; only a turn that ends with tool calls but no text
// gets synthesized. Throws a user-facing message on hard failures.
export async function runAgentTurn(params: {
  agent: TurnAgent;
  convo: TurnMessage[];
  message: string;
  authCtx: TurnAuthCtx;
  memory?: MemoryBinding;
}): Promise<string | null> {
  const { agent, convo, message, authCtx, memory } = params;
  const genOpts = memory ? { memory } : undefined;
  // With a memory binding, hand generate() the new user message as a STRING —
  // Mastra Memory only persists (and recalls against) string input; passing the
  // convo array silently skips the save. (Recent history + recall come from
  // Mastra Memory itself; the learned digest is already woven into `message`.)
  const input = memory ? message : convo;

  try {
    const result = await runWithAuth(authCtx, () =>
      agent.generate(input, genOpts),
    );

    if (result.text) return result.text;

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
      authCtx,
      toolResults: uniqueResults,
    });
  } catch (err) {
    throw toUserFacingError(err);
  }
}

// Map a raw failure to a plain-language, non-technical message (the prompt
// rules forbid jargon/ids/HTTP codes in replies — the error path must honour
// that too). First matching rule wins; unmatched errors are logged server-side
// and fall through to a generic message so no raw provider text reaches a user.
const ERROR_RULES: { test: RegExp; message: string }[] = [
  {
    test: /too many requests|rate.?limit|\b429\b/i,
    message:
      'The AI provider is temporarily rate-limited. Please wait a moment and try again.',
  },
  {
    test: /unauthorized|forbidden|permission|access denied|invalid api key|\b401\b|\b403\b/i,
    message:
      "I couldn't complete that — it needs a permission or credential that isn't available. Please check with an admin.",
  },
  {
    test: /timed? ?out|etimedout|econnrefused|econnreset|socket hang up|network|fetch failed|enotfound/i,
    message:
      'The service took too long to respond or was unreachable. Please try again in a moment.',
  },
  {
    test: /bad gateway|service unavailable|internal server error|\b50[0234]\b/i,
    message:
      'The service is temporarily unavailable. Please try again shortly.',
  },
  {
    test: /validation|is required|invalid input|must be a|failed to parse/i,
    message:
      'Some required information was missing or invalid. Please rephrase or add the missing details.',
  },
];

/** Map a raw failure to a plain-language Error safe to show a user (jargon-,
 *  id- and HTTP-code-free); unmatched errors are logged (redacted) and replaced
 *  with a generic message so no raw provider text leaks. */
export function toUserFacingError(err: unknown): Error {
  const msg: string =
    (err as { message?: string } | null | undefined)?.message ?? String(err);
  const rule = ERROR_RULES.find((r) => r.test.test(msg));
  if (rule) return new Error(rule.message);
  // Unmatched: log for operators (never shown to the user), but redact long
  // tokens first — provider errors can echo API keys, bearer tokens, connection
  // strings or hashes that log aggregators shouldn't capture.
  const safe = msg
    .replace(
      /\b(bearer\s+|api[_-]?key=|token=|:)[A-Za-z0-9._-]{16,}/gi,
      '$1[redacted]',
    )
    .replace(/[A-Za-z0-9_-]{32,}/g, '[redacted]');
  console.error('[toUserFacingError] unmatched error:', safe);
  return new Error(
    'Something went wrong while processing your request. Please try again — if it keeps happening, contact support.',
  );
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
  authCtx: TurnAuthCtx;
  toolResults: ToolResultLike[];
}): Promise<string> {
  const { agent, message, authCtx, toolResults } = params;

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
      agent.generate(synthesisMessages, { maxSteps: 1 }),
    );
    return synthesis.text || fallback || 'Done.';
  } catch {
    return fallback || 'Done.';
  }
}
