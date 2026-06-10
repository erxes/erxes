import { IContext } from '~/connectionResolvers';
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

// Build a plain-text message from tool results when the model produces no text.
function buildFallbackFromResults(toolResults: any[]): string | null {
  for (const tr of toolResults) {
    const data = tr.result ?? tr;
    if (!data || typeof data !== 'object') continue;

    // Explicit failure
    if (data.success === false) {
      if (data.availableStages?.length) {
        const names = (data.availableStages as string[]).join(', ');
        return `Which stage? Available: ${names}.`;
      }
      if (data.message) return `Failed: ${data.message}`;
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

    if (data === true || data.success === true) return 'Action completed successfully.';
  }
  return null;
}

// ─── Text-based tool call extraction ─────────────────────────────────────────
//
// Some models (e.g. meta/llama-3.1-8b-instruct via NVIDIA NIM) do not support
// the structured tool_calls response field.  Instead they output their function
// call intent as plain JSON text.  We detect those patterns here and execute
// the tool directly, so the agent works even with these models.

interface TextToolCall {
  name: string;
  args: Record<string, any>;
}

function extractTextToolCall(text: string): TextToolCall | null {
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

// ─────────────────────────────────────────────────────────────────────────────

// How many recent messages of a session to replay as LLM context.
const HISTORY_LIMIT = 20;

// Runs a single agent turn over the full conversation array and returns the
// reply text (or null). Holds the tool-call extraction / synthesis / fallback
// logic; throws a user-facing message on hard failures.
async function runAgentTurn(params: {
  agent: any;
  tools: Record<string, any>;
  convo: any[];
  message: string;
  isLegacy: boolean;
  authCtx: any;
}): Promise<string | null> {
  const { agent, tools, convo, message, isLegacy, authCtx } = params;

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
        // Find the tool by name or by toolId
        const tool =
          tools[extracted.name] ||
          Object.entries(tools).find(([, v]: [string, any]) => v?.id === extracted.name)?.[1];

        if (tool?.execute) {
          try {
            const toolResult = await runWithAuth(authCtx, () => tool.execute(extracted.args));
            const syntheticResults = [{ toolName: extracted.name, result: toolResult, toolCallId: `text-${Date.now()}` }];

            if (extracted.name.toLowerCase().includes('deals')) {
              console.log('[text-tool-call] extracted:', extracted.name, JSON.stringify(extracted.args));
              console.log('[text-tool-call] result:', JSON.stringify(toolResult));
            }

            const fallback = buildFallbackFromResults(syntheticResults);
            const tr = toolResult as any;
            const hasReal = tr && typeof tr === 'object' && (tr._id || tr.list !== undefined || tr.success === true);
            if (!hasReal) return fallback || 'Something went wrong. Please try again.';

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
            // Tool execution failed — fall through to return the original text
          }
        }
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
    const gatheredResults: any[] = [
      ...(result.toolResults || []),
      ...(result.steps || []).flatMap((s: any) => s.toolResults || []),
    ];
    const seenIds = new Set<string>();
    const uniqueResults = gatheredResults.filter((tr: any) => {
      const id = tr.toolCallId || tr.id || JSON.stringify(tr);
      return seenIds.has(id) ? false : (seenIds.add(id), true);
    });

    if (!uniqueResults.length) return null;

    // Skip synthesis when tool calls didn't produce a real result.
    // Synthesis will fabricate success messages even for failed/null returns.
    const hasRealResult = uniqueResults.some((tr: any) => {
      const data = tr.result ?? tr;
      if (!data || typeof data !== 'object') return false;
      if (data.success === false) return false;
      // Mutations should return a record with _id; queries return list/data
      if (data._id) return true;
      if (data.list !== undefined) return true;
      if (data.success === true) return true;
      // Primitive truthy non-error result
      return false;
    });

    const fallback = buildFallbackFromResults(uniqueResults);

    if (!hasRealResult) {
      return fallback || 'Something went wrong. Please try again.';
    }

    // All tool calls succeeded — synthesise a human-readable summary.
    const toolContext = uniqueResults
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
  } catch (err: any) {
    const msg: string = err?.message ?? String(err);
    if (msg.toLowerCase().includes('too many requests') || msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
      throw new Error('The AI provider is temporarily rate-limited. Please wait a moment and try again.');
    }
    throw new Error(`Agent execution failed: ${msg}`);
  }
}

export const agentQueries = {
  mastraAgents: async (_: any, __: any, { models }: IContext) => {
    return models.MastraAgent.getAgents();
  },

  mastraAgent: async (_: any, { _id }: { _id: string }, { models }: IContext) => {
    return models.MastraAgent.getAgent(_id);
  },

  mastraAgentsMain: async (
    _: any,
    params: { page?: number; perPage?: number; searchValue?: string },
    { models }: IContext,
  ) => {
    return models.MastraAgent.getAgentsList(params || {});
  },

  mastraAgentChat: async (
    _: any,
    { agentId, message, threadId }: { agentId: string; message: string; threadId?: string },
    { models, user, subdomain }: IContext,
  ) => {
    const agentConfig = await models.MastraAgent.findOne({ agentId, isEnabled: true });
    if (!agentConfig) throw new Error(`Agent "${agentId}" not found or disabled`);

    const settings = await models.MastraSettings.findOne({});
    const providers = await models.MastraProvider.find({ isEnabled: true });
    const { agent, tools } = await getOrCreateAgent(agentConfig, models);

    // Stable session id — the persisted thread this turn belongs to.
    const sessionId = threadId || `chat-${Date.now()}`;
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

    const reply = await runAgentTurn({ agent, tools, convo, message, isLegacy, authCtx });

    // Persist the completed exchange so the session survives reloads. Only the
    // final user + assistant text is stored (no tool-call frames), which also
    // keeps replayed history clean for reasoning models like Kimi.
    await models.MastraThread.ensureThread(sessionId, agentId, message);
    const userMsg = await models.MastraMessage.addMessage(sessionId, 'user', message);
    const asstMsg =
      reply ? await models.MastraMessage.addMessage(sessionId, 'assistant', reply) : null;
    await models.MastraThread.touchThread(sessionId);

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

    return reply;
  },
};
