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
import { IMastraMessageMeta } from '@/session/@types/session';
import { maybeGenerateThreadTitle } from '~/mastra/titler';

// Shared chat-turn pipeline used by both the blocking GraphQL resolver
// (mastraAgentChat) and the streaming SSE route (/chat/stream). Holds the
// setup (thread ownership, history replay, memory blocks, auth context),
// the turn execution with its tool-call fallbacks, and the persistence of
// the completed exchange.

// How many recent messages of a session to replay as LLM context.
export const HISTORY_LIMIT = 20;

// A search_erxes_operations result is navigational (it lists candidate ops),
// never the final answer — the answer comes from execute_erxes_operation.
export function isSearchResult(tr: any): boolean {
  return (tr?.toolName || tr?.name || '').toLowerCase().includes('search_erxes_operations');
}

// True when a tool's return value carries a real answer worth reporting (vs a
// failure payload or empty/null). Covers query lists, mutation records, the raw
// execute_erxes_operation payload (any non-empty object), arrays, and scalars.
export function isRealToolData(data: any): boolean {
  if (data === true) return true;
  if (Array.isArray(data)) return true; // even an empty array is a valid "0 results"
  if (data == null) return false;
  if (typeof data !== 'object') return typeof data === 'string' && data.length > 0;
  if (data.success === false) return false;
  if (data._id) return true;
  if (data.list !== undefined) return true;
  if (data.success === true) return true;
  return Object.keys(data).length > 0;
}

// Build a plain-text message from tool results when the model produces no text.
export function buildFallbackFromResults(toolResults: any[]): string | null {
  for (const tr of toolResults) {
    if (isSearchResult(tr)) continue;

    const data = tr.result ?? tr;

    if (data === true) return 'Action completed successfully.';
    if (Array.isArray(data)) {
      return `Found ${data.length} result${data.length !== 1 ? 's' : ''}.`;
    }
    if (!data || typeof data !== 'object') continue;

    // Explicit failure — surface the tool's own guidance. execute_erxes_operation
    // reports failures under `error`; the GraphQL not-found path uses `message`.
    if (data.success === false) {
      if (data.availableStages?.length) {
        const names = (data.availableStages as string[]).join(', ');
        return `Which stage? Available: ${names}.`;
      }
      if (data.instruction) return data.instruction;
      const msg = data.message || data.error;
      if (msg) return `Failed: ${msg}`;
      return null;
    }

    const op: string = (tr.toolName || tr.name || '').toLowerCase();

    if (data._id && data.name) {
      if (op.includes('add') || op.includes('create')) return `"${data.name}" was created successfully.`;
      if (op.includes('edit') || op.includes('update')) return `"${data.name}" was updated successfully.`;
      if (op.includes('remove') || op.includes('delete')) return `"${data.name}" was deleted.`;
      return `Done: "${data.name}".`;
    }

    if (data.list && Array.isArray(data.list)) {
      return `Found ${data.list.length} result${data.list.length !== 1 ? 's' : ''}.`;
    }

    if (data.success === true) return 'Action completed successfully.';
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
  args: Record<string, any>;
}

export function extractTextToolCall(text: string): TextToolCall | null {
  const t = text.trim();

  // Pattern 1 — OpenAI-style JSON array: [{"id":"...","type":"function","function":{"name":"...","arguments":"{...}"}}]
  try {
    const arr = JSON.parse(t);
    if (Array.isArray(arr) && arr[0]?.type === 'function' && arr[0]?.function?.name) {
      const fn = arr[0].function;
      const args = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : (fn.arguments ?? {});
      return { name: fn.name, args };
    }
  } catch {}

  // Pattern 2 — Simple object: {"name":"toolName","parameters":{...}} or {"name":"...","arguments":{...}}
  try {
    const obj = JSON.parse(t);
    if (obj && typeof obj === 'object' && typeof obj.name === 'string') {
      const rawArgs = obj.arguments ?? obj.parameters ?? obj.args ?? {};
      const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
      return { name: obj.name, args };
    }
  } catch {}

  // Pattern 3 — <tool_call>...</tool_call> tags
  const tagMatch = t.match(/<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/i);
  if (tagMatch) {
    try {
      const obj = JSON.parse(tagMatch[1]);
      if (obj?.name) {
        const args = typeof obj.arguments === 'string' ? JSON.parse(obj.arguments) : (obj.arguments ?? obj.parameters ?? {});
        return { name: obj.name, args };
      }
    } catch {}
  }

  // Pattern 4 — "The function call that best answers the user's question is: toolName({...})"
  const nimMatch = t.match(/function call[^\n]*?:\s*(\w+)\((\{[\s\S]*\})\)/i);
  if (nimMatch) {
    try {
      return { name: nimMatch[1], args: JSON.parse(nimMatch[2]) };
    } catch {}
  }

  return null;
}

// ─── Turn setup ───────────────────────────────────────────────────────────────

export interface PreparedTurn {
  agentConfig: any;
  settings: any;
  providers: any[];
  agent: any;
  tools: Record<string, any>;
  sessionId: string;
  convo: any[];
  authCtx: { userHeader?: string; token?: string; subdomain?: string };
  isLegacy: boolean;
  advanced: boolean;
  memCtx: MemoryContext;
}

// Everything a chat turn needs before the model runs: agent + tools, thread
// ownership check, replayed history, advanced-memory blocks, and the auth
// context tools execute under. Throws user-facing errors on bad agent/thread.
export async function prepareChatTurn(params: {
  models: IModels;
  subdomain: string;
  user: any;
  agentId: string;
  message: string;
  threadId?: string;
}): Promise<PreparedTurn> {
  const { models, subdomain, user, agentId, message, threadId } = params;

  const agentConfig = await models.MastraAgent.findOne({ agentId, isEnabled: true });
  if (!agentConfig) throw new Error(`Agent "${agentId}" not found or disabled`);

  const settings = await models.MastraSettings.findOne({});
  const providers = await models.MastraProvider.find({ isEnabled: true });
  const { agent, tools } = await getOrCreateAgent(agentConfig, models);

  // Stable session id — the persisted thread this turn belongs to.
  const sessionId = threadId || `chat-${Date.now()}`;

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
  const recentHistory = history.map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  const memCtx: MemoryContext = {
    subdomain,
    resourceId: deriveResourceId({ user, agentId }),
    threadId: sessionId,
    agentId,
  };

  // Semantic recall (cross-session long-term memory) + working memory (the
  // persistent user profile). Both injected as plain system context blocks.
  // Best-effort: each returns null on any error, never blocking the turn.
  const [recall, wmBlock] = advanced
    ? await Promise.all([
        recallBlock(message, memCtx),
        readWorkingMemory(models, memCtx),
      ])
    : [null, null];

  const convo = augmentConvo({
    recentHistory,
    userMessage: message,
    recallBlock: recall,
    workingMemoryBlock: wmBlock,
  });

  const userHeader = user
    ? Buffer.from(JSON.stringify(user)).toString('base64')
    : undefined;
  const authCtx = { userHeader, token: settings?.erxesApiToken, subdomain };
  const isLegacy = isLegacyProvider(agentConfig.provider, providers);

  return {
    agentConfig,
    settings,
    providers,
    agent,
    tools,
    sessionId,
    convo,
    authCtx,
    isLegacy,
    advanced,
    memCtx,
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
}): Promise<{ titlePromise: Promise<string | null> }> {
  const { models, prepared, message, reply, meta } = params;
  const { sessionId, advanced, memCtx, agentConfig, providers, authCtx, isLegacy } = prepared;

  const userMsg = await models.MastraMessage.addMessage(sessionId, 'user', message);
  const asstMsg = reply
    ? await models.MastraMessage.addMessage(sessionId, 'assistant', reply, meta)
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
      void refreshWorkingMemory({
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

  return { titlePromise };
}

// ─── Turn execution (blocking) ───────────────────────────────────────────────

// Runs a single agent turn over the full conversation array and returns the
// reply text (or null). Holds the tool-call extraction / synthesis / fallback
// logic; throws a user-facing message on hard failures.
export async function runAgentTurn(params: {
  agent: any;
  tools: Record<string, any>;
  convo: any[];
  message: string;
  isLegacy: boolean;
  authCtx: any;
  depth?: number;
}): Promise<string | null> {
  const { agent, tools, convo, message, isLegacy, authCtx, depth = 0 } = params;

  try {
    const result = await runWithAuth(authCtx, () =>
      (isLegacy
        ? agent.generateLegacy(convo)
        : agent.generate(convo as any)) as Promise<any>,
    );

    if (result.text) {
      const t = result.text.trimStart();

      // ── Text-based tool call fallback ──────────────────────────────────
      // Models that don't support the tool_calls API field output their
      // function call intent as plain text.  Detect, extract, and execute.
      const extracted = extractTextToolCall(t);
      if (extracted) {
        const handled = await executeTextToolCall({
          agent, tools, convo, message, isLegacy, authCtx, depth,
          extracted, rawText: t,
        });
        if (handled !== undefined) return handled;
      }

      // Detect legacy "The function call that best answers..." format (no args extractable)
      if (t.startsWith('The function call that best answers')) {
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
      ...(result.steps || []).flatMap((s: any) => s.toolResults || []),
    ]);

    if (!uniqueResults.length) return null;

    // Diagnostic: what did the agent actually call, and what came back?
    logToolResults(uniqueResults);

    return await synthesizeFromToolResults({
      agent, message, isLegacy, authCtx, toolResults: uniqueResults,
    });
  } catch (err: any) {
    throw toUserFacingError(err);
  }
}

// Normalize provider failures into messages safe to show a non-technical user.
export function toUserFacingError(err: any): Error {
  const msg: string = err?.message ?? String(err);
  if (msg.toLowerCase().includes('too many requests') || msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
    return new Error('The AI provider is temporarily rate-limited. Please wait a moment and try again.');
  }
  return new Error(`Agent execution failed: ${msg}`);
}

export function dedupeToolResults(gathered: any[]): any[] {
  const seenIds = new Set<string>();
  return gathered.filter((tr: any) => {
    const id = tr.toolCallId || tr.id || JSON.stringify(tr);
    return seenIds.has(id) ? false : (seenIds.add(id), true);
  });
}

export function logToolResults(uniqueResults: any[]) {
  console.log(
    '[mastraAgentChat] tool results:',
    JSON.stringify(
      uniqueResults.map((tr: any) => {
        const data = tr.result ?? tr;
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
          success: (data && typeof data === 'object') ? data.success : undefined,
          error: (data && typeof data === 'object') ? (data.error || data.message) : undefined,
        };
      }),
    ),
  );
}

// Turn a set of tool results into a one-or-two sentence human answer. Skips
// synthesis when nothing real came back (synthesis would fabricate success).
export async function synthesizeFromToolResults(params: {
  agent: any;
  message: string;
  isLegacy: boolean;
  authCtx: any;
  toolResults: any[];
}): Promise<string> {
  const { agent, message, isLegacy, authCtx, toolResults } = params;

  // search_erxes_operations is navigational; only execute (action) results
  // decide whether the turn produced something real to report.
  const actionResults = toolResults.filter((tr: any) => !isSearchResult(tr));
  const hasRealResult = actionResults.some((tr: any) => isRealToolData(tr.result ?? tr));
  const fallback = buildFallbackFromResults(toolResults);

  if (!hasRealResult) {
    return fallback || 'Something went wrong. Please try again.';
  }

  // All tool calls succeeded — synthesise a human-readable summary from the
  // action results (the search listing would only distract the model).
  const toolContext = actionResults
    .map((tr: any) => {
      const name = tr.toolName || tr.name || 'tool';
      const data = tr.result ?? tr;
      return `[${name}]:\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
    })
    .join('\n\n');

  const synthesisMessages: any[] = [
    {
      role: 'user',
      content: `Report the following tool results accurately to the user in one or two sentences. Do not call any tools. Do not invent information not present in the results.\n\nUser request: ${message}\n\n${toolContext}`,
    },
  ];

  try {
    const synthesis = await runWithAuth(authCtx, () =>
      (isLegacy
        ? agent.generateLegacy(synthesisMessages)
        : agent.generate(synthesisMessages, { maxSteps: 1 } as any)) as Promise<any>,
    );
    return synthesis.text || fallback || 'Done.';
  } catch {
    return fallback || 'Done.';
  }
}

// Execute a tool call the model emitted as plain text. Returns the reply text,
// null (caller's fallback applies), or undefined when the tool wasn't found /
// failed and the original model text should be returned as-is.
export async function executeTextToolCall(params: {
  agent: any;
  tools: Record<string, any>;
  convo: any[];
  message: string;
  isLegacy: boolean;
  authCtx: any;
  depth: number;
  extracted: TextToolCall;
  rawText: string;
  onToolEvent?: (event: { phase: 'call' | 'result'; toolName: string; args?: any; result?: any; isError?: boolean }) => void;
}): Promise<string | null | undefined> {
  const { agent, tools, convo, message, isLegacy, authCtx, depth, extracted, rawText, onToolEvent } = params;

  // Find the tool by name or by toolId
  const tool =
    tools[extracted.name] ||
    Object.entries(tools).find(([, v]: [string, any]) => v?.id === extracted.name)?.[1];

  if (!tool?.execute) return undefined;

  try {
    onToolEvent?.({ phase: 'call', toolName: extracted.name, args: extracted.args });
    const toolResult = await runWithAuth(authCtx, () => tool.execute(extracted.args));
    onToolEvent?.({
      phase: 'result',
      toolName: extracted.name,
      args: extracted.args,
      result: toolResult,
      isError: !isRealToolData(toolResult),
    });
    const syntheticResults = [{ toolName: extracted.name, result: toolResult, toolCallId: `text-${Date.now()}` }];

    console.log(
      '[text-tool-call]', extracted.name,
      JSON.stringify(extracted.args),
      '→', (JSON.stringify(toolResult) || '').slice(0, 300),
    );

    // search_erxes_operations is navigational. The model emitted it as
    // text (no native multi-step), so feed the results back and let it
    // continue to execute_erxes_operation. Bounded to avoid loops.
    if (extracted.name.toLowerCase().includes('search_erxes_operations') && depth < 2) {
      const followup = [
        ...convo,
        { role: 'assistant', content: rawText },
        {
          role: 'user',
          content:
            `Available operations (from search_erxes_operations):\n${JSON.stringify(toolResult)}\n\n` +
            `Now call execute_erxes_operation with the exact "operation" name and an "args" object to fulfil: "${message}".`,
        },
      ];
      return await runAgentTurn({
        agent, tools, convo: followup, message, isLegacy, authCtx, depth: depth + 1,
      });
    }

    const fallback = buildFallbackFromResults(syntheticResults);
    if (!isRealToolData(toolResult)) return fallback || 'Something went wrong. Please try again.';

    // Synthesise a human-readable summary.
    const toolContext = `[${extracted.name}]:\n${JSON.stringify(toolResult, null, 2)}`;
    const synthesisMessages: any[] = [{
      role: 'user',
      content: `Report the following tool results accurately to the user in one or two sentences. Do not call any tools.\n\nUser request: ${message}\n\n${toolContext}`,
    }];
    try {
      const synthesis = await runWithAuth(authCtx, () =>
        (isLegacy
          ? agent.generateLegacy(synthesisMessages)
          : agent.generate(synthesisMessages, { maxSteps: 1 } as any)) as Promise<any>,
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
