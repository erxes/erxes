import { Router } from 'express';
import { extractUserFromHeader, getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from './connectionResolvers';
import { getOrCreateAgent } from './mastra/agentRuntime';
import { isLegacyProvider } from './mastra/providers';
import { runWithAuth } from './mastra/requestContext';
import { isAdvancedMemoryEnabled } from './mastra/memory/config';
import {
  recallBlock,
  indexMessages,
  readWorkingMemory,
  refreshWorkingMemory,
  deriveBotResourceId,
  augmentConvo,
  MemoryContext,
} from './mastra/memory';
import {
  prepareChatTurn,
  persistTurn,
  executeTextToolCall,
  extractTextToolCall,
  synthesizeFromToolResults,
  toUserFacingError,
} from '@/agent/turn';
import { IMastraToolCall } from '@/session/@types/session';

export const router: Router = Router();

// ─── Streaming chat (SSE) ─────────────────────────────────────────────────────
//
// POST /chat/stream — the in-app chat UI's transport, proxied through the
// gateway at /pl:erxes-agent/chat/stream. The gateway's userMiddleware has
// already authenticated the request and forwarded the user as a base64 header.
//
// Emits `data: {json}\n\n` events:
//   {type:'thinking', text}        — model reasoning delta
//   {type:'text', text}            — answer text delta
//   {type:'text_replace', text}    — replace all streamed text (fallback paths)
//   {type:'tool_call', toolCallId, toolName, args}
//   {type:'tool_result', toolCallId, toolName, result, isError}
//   {type:'done', reply, interrupted}
//   {type:'error', message}
//
// Interrupt: the client aborts the fetch; the closed connection aborts the
// agent run via AbortSignal. Whatever text already streamed is persisted and
// marked `interrupted` so the partial reply survives reloads.

interface StreamEvent {
  type: string;
  [key: string]: any;
}

// Normalize Mastra stream chunks (modern `{type, payload}` and legacy AI-SDK
// flat shapes) into the wire events above.
function normalizeChunk(raw: any): StreamEvent | null {
  const type = raw?.type;
  const p = raw?.payload ?? raw;

  switch (type) {
    case 'text-delta': {
      const text = p.text ?? p.textDelta ?? '';
      return text ? { type: 'text', text } : null;
    }
    case 'reasoning': // legacy AI-SDK reasoning delta
    case 'reasoning-delta': {
      const text = p.text ?? p.textDelta ?? '';
      return text ? { type: 'thinking', text } : null;
    }
    case 'tool-call':
      return {
        type: 'tool_call',
        toolCallId: p.toolCallId,
        toolName: p.toolName,
        args: p.args ?? p.input,
      };
    case 'tool-result':
      return {
        type: 'tool_result',
        toolCallId: p.toolCallId,
        toolName: p.toolName,
        result: p.result ?? p.output,
        isError: !!p.isError,
      };
    case 'tool-error':
      return {
        type: 'tool_result',
        toolCallId: p.toolCallId,
        toolName: p.toolName,
        result: p.error ?? p.result,
        isError: true,
      };
    case 'error': {
      const e = p.error ?? p;
      const message = typeof e === 'string' ? e : e?.message || 'Agent error';
      return { type: 'error', message };
    }
    default:
      return null;
  }
}

router.post('/chat/stream', async (req, res) => {
  const user = extractUserFromHeader(req.headers);
  if (!user?._id) {
    return res.status(401).json({ error: 'Login required' });
  }

  const { agentId, message, threadId } = req.body || {};
  if (!agentId || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'agentId and message are required' });
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  // The plugin's global cors() stamps `Access-Control-Allow-Origin: *` on
  // every response, and the gateway proxy pipes upstream headers over its own
  // whitelist-scoped ones. Browsers reject a wildcard origin on credentialed
  // requests ("Failed to fetch"), so drop it and let the gateway's CORS
  // headers (exact origin + credentials) stand.
  res.removeHeader('Access-Control-Allow-Origin');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let clientGone = false;
  const controller = new AbortController();
  req.on('close', () => {
    clientGone = true;
    controller.abort();
  });

  const send = (event: StreamEvent) => {
    if (clientGone || res.writableEnded) return;
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // SSE comment heartbeat so the gateway proxy never sees an idle socket
  // during long tool calls.
  const heartbeat = setInterval(() => {
    if (!clientGone && !res.writableEnded) res.write(': ping\n\n');
  }, 10000);

  // Accumulated turn state — what gets persisted and what `done` reports.
  const acc = {
    text: '',
    thinking: '',
    toolCalls: [] as IMastraToolCall[],
  };

  const recordToolCall = (ev: StreamEvent) => {
    if (ev.type === 'tool_call') {
      acc.toolCalls.push({
        toolCallId: ev.toolCallId,
        toolName: ev.toolName,
        args: ev.args,
      });
    } else if (ev.type === 'tool_result') {
      const existing = ev.toolCallId
        ? acc.toolCalls.find((tc) => tc.toolCallId === ev.toolCallId)
        : undefined;
      if (existing) {
        existing.result = ev.result;
        existing.isError = ev.isError;
      } else {
        acc.toolCalls.push({
          toolCallId: ev.toolCallId,
          toolName: ev.toolName,
          result: ev.result,
          isError: ev.isError,
        });
      }
    }
  };

  try {
    const prepared = await prepareChatTurn({
      models,
      subdomain,
      user,
      agentId,
      message,
      threadId,
    });
    const { agent, tools, convo, authCtx, isLegacy } = prepared;

    let streamError: string | null = null;

    try {
      await runWithAuth(authCtx, async () => {
        const stream = await (isLegacy
          ? agent.streamLegacy(convo as any, { abortSignal: controller.signal } as any)
          : agent.stream(convo as any, { abortSignal: controller.signal } as any));

        for await (const chunk of stream.fullStream as any) {
          const ev = normalizeChunk(chunk);
          if (!ev) continue;

          if (ev.type === 'text') acc.text += ev.text;
          else if (ev.type === 'thinking') acc.thinking += ev.text;
          else if (ev.type === 'error') {
            streamError = ev.message;
            continue; // surfaced after the loop so fallbacks still apply
          } else recordToolCall(ev);

          send(ev);
        }
      });
    } catch (err: any) {
      // An abort lands here on most providers — that's an interrupt, not an error.
      if (!controller.signal.aborted) throw err;
    }

    const interrupted = controller.signal.aborted;
    let reply: string | null = acc.text || null;

    if (!interrupted) {
      const trimmed = acc.text.trimStart();

      // Text-emitted tool call (models without native tool_calls): execute it
      // and replace the raw JSON the client already saw with the real answer.
      const extracted = trimmed ? extractTextToolCall(trimmed) : null;
      if (extracted) {
        const handled = await executeTextToolCall({
          agent,
          tools,
          convo,
          message,
          isLegacy,
          authCtx,
          depth: 0,
          extracted,
          rawText: trimmed,
          onToolEvent: (e) => {
            const ev: StreamEvent =
              e.phase === 'call'
                ? { type: 'tool_call', toolName: e.toolName, args: e.args }
                : {
                    type: 'tool_result',
                    toolName: e.toolName,
                    result: e.result,
                    isError: e.isError,
                  };
            recordToolCall(ev);
            send(ev);
          },
        });
        if (handled !== undefined && handled !== null) {
          reply = handled;
          send({ type: 'text_replace', text: handled });
        }
      } else if (!acc.text) {
        // No text streamed — synthesize from tool results, or report the error.
        const toolResults = acc.toolCalls
          .filter((tc) => tc.result !== undefined)
          .map((tc) => ({
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            result: tc.result,
          }));

        if (toolResults.length) {
          reply = await synthesizeFromToolResults({
            agent,
            message,
            isLegacy,
            authCtx,
            toolResults,
          });
          send({ type: 'text', text: reply });
        } else if (streamError) {
          throw new Error(streamError);
        }
      }
    }

    await persistTurn({
      models,
      prepared,
      message,
      reply,
      meta: reply
        ? {
            thinking: acc.thinking || undefined,
            toolCalls: acc.toolCalls.length ? acc.toolCalls : undefined,
            interrupted: interrupted || undefined,
          }
        : undefined,
    });

    send({ type: 'done', reply, interrupted });
  } catch (err: any) {
    console.error('[mastra chat stream error]', err);
    send({ type: 'error', message: toUserFacingError(err).message });
  } finally {
    clearInterval(heartbeat);
    if (!res.writableEnded) res.end();
  }
});

// erxes frontline bot webhook — called by frontline_api when botEndpointUrl is set
router.post('/bot/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { text, subdomain = 'localhost', customerId } = req.body;

  try {
    const models = await generateModels(subdomain);
    const settings = await models.MastraSettings.getSettings();

    if (!settings?.defaultAgentId) {
      return res.json({
        responses: [{ type: 'text', text: 'No default agent configured. Please set one in Mastra Settings.' }],
      });
    }

    const agentConfig = await models.MastraAgent.findOne({
      agentId: settings.defaultAgentId,
      isEnabled: true,
    });

    if (!agentConfig) {
      return res.json({
        responses: [{ type: 'text', text: 'Configured agent not found or disabled.' }],
      });
    }

    const providers = await models.MastraProvider.find({ isEnabled: true });
    const { agent } = await getOrCreateAgent(agentConfig, models);

    // Conversation memory is Mongo-backed, keyed by the frontline conversationId.
    const userText = text || '';
    const useHistory = agentConfig.memoryEnabled !== false;
    const advanced = isAdvancedMemoryEnabled() && useHistory && !!userText.trim();
    const history = useHistory
      ? await models.MastraMessage.getRecent(conversationId, 20)
      : [];
    const recentHistory = history.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const memCtx: MemoryContext = {
      subdomain,
      resourceId: deriveBotResourceId({ customerId, conversationId }),
      threadId: conversationId,
      agentId: agentConfig.agentId,
    };

    // Advanced memory: semantic recall + working memory (best-effort).
    const [recall, wmBlock] = advanced
      ? await Promise.all([
          recallBlock(userText, memCtx),
          readWorkingMemory(models, memCtx),
        ])
      : [null, null];

    const convo = augmentConvo({
      recentHistory,
      userMessage: userText,
      recallBlock: recall,
      workingMemoryBlock: wmBlock,
    });

    // Bot requests use the static app token from settings (no user session available)
    const authCtx = { token: settings?.erxesApiToken, subdomain };
    const isLegacy = isLegacyProvider(agentConfig.provider, providers);
    const result = await runWithAuth(authCtx, () =>
      (isLegacy
        ? agent.generateLegacy(convo as any)
        : agent.generate(convo as any)) as Promise<any>,
    );

    const reply = result.text || '';

    // Persist the exchange so the bot remembers across webhook calls. The
    // synthetic "bot:*" owner keeps these threads out of every in-app user's
    // session list and ownership checks.
    await models.MastraThread.ensureThread(
      conversationId,
      agentConfig.agentId,
      `bot:${customerId || conversationId}`,
      userText,
    );
    const userMsg = await models.MastraMessage.addMessage(conversationId, 'user', userText);
    const asstMsg =
      reply ? await models.MastraMessage.addMessage(conversationId, 'assistant', reply) : null;
    await models.MastraThread.touchThread(conversationId);

    // Advanced memory: index the exchange + refresh the profile (best-effort).
    if (advanced) {
      const toIndex = [
        {
          id: String(userMsg._id),
          role: 'user',
          text: userText,
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

      if (reply) {
        void refreshWorkingMemory({
          models,
          ctx: memCtx,
          exchange: { user: userText, assistant: reply },
          provider: agentConfig.provider,
          model: agentConfig.model,
          providers,
          authCtx,
          isLegacy,
        });
      }
    }

    return res.json({ responses: [{ type: 'text', text: reply }] });
  } catch (err: any) {
    console.error('[mastra bot endpoint error]', err);
    return res.json({
      responses: [{ type: 'text', text: `Error: ${err.message}` }],
    });
  }
});
