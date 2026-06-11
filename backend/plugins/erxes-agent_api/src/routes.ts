import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { extractUserFromHeader, getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from './connectionResolvers';
import { getOrCreateAgent } from './mastra/agentRuntime';
import {
  ActivityTracker,
  createActivityTracker,
  summarizeActivity,
} from './mastra/activity';
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
import { readLearnedDigest } from './mastra/learning/digest';
import {
  prepareChatTurn,
  persistTurn,
  executeTextToolCall,
  extractTextToolCall,
  synthesizeFromToolResults,
  toUserFacingError,
  TurnAgent,
} from '@/agent/turn';
import {
  IMastraChatAttachment,
  IMastraToolCall,
  IMastraTurnPart,
} from '@/session/@types/session';
import { attachmentStorageStatus } from '@/settings/graphql/resolvers/queries/settings';

export const router: Router = Router();

// Generous per-IP throttle on the LLM-backed endpoints — normal chat traffic
// stays well under it; it only blunts abnormal high-frequency bursts (and the
// LLM/API cost they would incur). Mirrors the limiter in start-plugin.ts.
const llmRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

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
//   {type:'activity', text}        — LLM one-liner of what the agent is doing
//   {type:'done', reply, interrupted}
//   {type:'thread_title', threadId, title} — LLM-generated conversation title
//   {type:'error', message}
//
// Interrupt: the client aborts the fetch; the closed connection aborts the
// agent run via AbortSignal. Whatever text already streamed is persisted and
// marked `interrupted` so the partial reply survives reloads.

interface StreamEvent {
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

// The slice of a raw Mastra/AI-SDK stream chunk payload that normalizeChunk
// reads. Chunks are untyped wire data; the cast below declares only what we use.
interface RawChunkPayload {
  text?: string;
  textDelta?: string;
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
  input?: unknown;
  result?: unknown;
  output?: unknown;
  isError?: boolean;
  error?: unknown;
  message?: string;
}

// Normalize Mastra stream chunks (modern `{type, payload}` and legacy AI-SDK
// flat shapes) into the wire events above.
function normalizeChunk(raw: unknown): StreamEvent | null {
  const chunk = (raw ?? {}) as {
    type?: string;
    payload?: RawChunkPayload;
  } & RawChunkPayload;
  const type = chunk.type;
  const payload = chunk.payload ?? chunk;

  switch (type) {
    case 'text-delta': {
      const text = payload.text ?? payload.textDelta ?? '';
      return text ? { type: 'text', text } : null;
    }
    case 'reasoning': // legacy AI-SDK reasoning delta
    case 'reasoning-delta': {
      const text = payload.text ?? payload.textDelta ?? '';
      return text ? { type: 'thinking', text } : null;
    }
    case 'tool-call':
      return {
        type: 'tool_call',
        toolCallId: payload.toolCallId,
        toolName: payload.toolName,
        args: payload.args ?? payload.input,
      };
    case 'tool-result':
      return {
        type: 'tool_result',
        toolCallId: payload.toolCallId,
        toolName: payload.toolName,
        result: payload.result ?? payload.output,
        isError: Boolean(payload.isError),
      };
    case 'tool-error':
      return {
        type: 'tool_result',
        toolCallId: payload.toolCallId,
        toolName: payload.toolName,
        result: payload.error ?? payload.result,
        isError: true,
      };
    case 'error': {
      const errorValue = payload.error ?? payload;
      const message =
        typeof errorValue === 'string'
          ? errorValue
          : (errorValue as { message?: string } | null | undefined)?.message ||
            'Agent error';
      return { type: 'error', message };
    }
    default:
      return null;
  }
}

// Shape-check the attachments array a chat turn may carry. Returns the
// sanitized list, or null when the payload is malformed.
const MAX_ATTACHMENTS_PER_MESSAGE = 10;
function sanitizeAttachments(raw: unknown): IMastraChatAttachment[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_ATTACHMENTS_PER_MESSAGE)
    return null;

  const out: IMastraChatAttachment[] = [];
  for (const item of raw) {
    const candidate = item as Record<string, unknown> | null | undefined;
    if (
      !candidate ||
      typeof candidate.url !== 'string' ||
      typeof candidate.name !== 'string'
    )
      return null;
    const url = candidate.url.trim();
    const name = candidate.name.trim();
    if (!url || url.length > 2048 || !name || name.length > 512) return null;
    out.push({
      url,
      name,
      type:
        typeof candidate.type === 'string'
          ? candidate.type.slice(0, 128)
          : undefined,
      size:
        // skipcq: JS-W1031 — byte size from untrusted input, not a collection length
        typeof candidate.size === 'number' && candidate.size >= 0
          ? candidate.size
          : undefined,
    });
  }
  return out;
}

router.post('/chat/stream', llmRouteLimiter, async (req, res) => {
  const user = extractUserFromHeader(req.headers);
  if (!user?._id) {
    return res.status(401).json({ error: 'Login required' });
  }

  const { agentId, message, threadId } = req.body || {};
  if (
    typeof agentId !== 'string' ||
    !agentId ||
    typeof message !== 'string' ||
    !message.trim()
  ) {
    return res.status(400).json({ error: 'agentId and message are required' });
  }
  if (threadId !== undefined && typeof threadId !== 'string') {
    return res.status(400).json({ error: 'threadId must be a string' });
  }

  const attachments = sanitizeAttachments(req.body?.attachments);
  if (attachments === null) {
    return res.status(400).json({ error: 'Invalid attachments payload' });
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  // Attachments require the instance's upload storage — reject early (the UI
  // hides the attach button in this state, so this is defense in depth).
  if (attachments.length) {
    const storage = await attachmentStorageStatus(models, subdomain);
    if (!storage.enabled) {
      return res.status(400).json({
        error:
          'File attachments are not available: no upload storage is configured on this instance. The conversation is text-only.',
      });
    }
  }

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
  // `parts` keeps reasoning bursts and tool calls in arrival order (thinking →
  // tool → thinking → …); tool entries in `parts` share object identity with
  // `toolCalls`, so a result landing later updates both.
  const acc = {
    text: '',
    thinking: '',
    toolCalls: [] as IMastraToolCall[],
    parts: [] as IMastraTurnPart[],
  };

  // A new non-thinking event ends the current reasoning burst — the next
  // thinking delta starts a fresh part instead of growing the old one.
  let thinkingOpen = false;

  const appendThinking = (text: string) => {
    acc.thinking += text;
    const last = acc.parts[acc.parts.length - 1];
    if (thinkingOpen && last?.kind === 'thinking') last.text += text;
    else {
      acc.parts.push({ kind: 'thinking', text });
      thinkingOpen = true;
    }
  };

  const recordToolCall = (ev: StreamEvent) => {
    thinkingOpen = false;
    if (ev.type === 'tool_call') {
      const call: IMastraToolCall = {
        toolCallId: ev.toolCallId,
        toolName: ev.toolName as string,
        args: ev.args,
      };
      acc.toolCalls.push(call);
      acc.parts.push({ kind: 'tool', call });
    } else if (ev.type === 'tool_result') {
      const existing = ev.toolCallId
        ? acc.toolCalls.find((tc) => tc.toolCallId === ev.toolCallId)
        : undefined;
      if (existing) {
        existing.result = ev.result;
        existing.isError = ev.isError;
      } else {
        const call: IMastraToolCall = {
          toolCallId: ev.toolCallId,
          toolName: ev.toolName as string,
          result: ev.result,
          isError: ev.isError,
        };
        acc.toolCalls.push(call);
        acc.parts.push({ kind: 'tool', call });
      }
    }
  };

  let activity: ActivityTracker | null = null;

  try {
    const prepared = await prepareChatTurn({
      models,
      subdomain,
      user,
      agentId,
      message,
      threadId,
      attachments,
    });
    const { agent, tools, convo, authCtx, isLegacy } = prepared;

    // Narrates "what is the agent doing" while the turn runs — throttled
    // summaries of the live reasoning/tool signals, pushed as activity events.
    activity = createActivityTracker({
      userMessage: message,
      emit: (text) => send({ type: 'activity', text }),
      summarize: (snapshot) =>
        summarizeActivity({
          provider: prepared.agentConfig.provider,
          model: prepared.agentConfig.model,
          providers: prepared.providers,
          authCtx,
          isLegacy,
          snapshot,
        }),
    });

    let streamError: string | null = null;

    try {
      await runWithAuth(authCtx, async () => {
        const stream = await (isLegacy
          ? agent.streamLegacy(convo, { abortSignal: controller.signal })
          : agent.stream(convo, { abortSignal: controller.signal }));

        for await (const chunk of stream.fullStream as AsyncIterable<unknown>) {
          const ev = normalizeChunk(chunk);
          if (!ev) continue;

          if (ev.type === 'text') {
            acc.text += ev.text ?? '';
            thinkingOpen = false;
          } else if (ev.type === 'thinking') {
            appendThinking(ev.text ?? '');
            activity?.onThinking(ev.text ?? '');
          } else if (ev.type === 'error') {
            streamError = ev.message ?? null;
            continue; // surfaced after the loop so fallbacks still apply
          } else {
            recordToolCall(ev);
            if (ev.type === 'tool_call')
              activity?.onToolCall(ev.toolName ?? '', ev.args);
          }

          send(ev);
        }
      });
    } catch (err) {
      // An abort lands here on most providers — that's an interrupt, not an error.
      if (!controller.signal.aborted) throw err;
    }

    activity.stop();

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
          onToolEvent: (toolEvent) => {
            const ev: StreamEvent =
              toolEvent.phase === 'call'
                ? {
                    type: 'tool_call',
                    toolName: toolEvent.toolName,
                    args: toolEvent.args,
                  }
                : {
                    type: 'tool_result',
                    toolName: toolEvent.toolName,
                    result: toolEvent.result,
                    isError: toolEvent.isError,
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

    const { titlePromise, assistantMessageId } = await persistTurn({
      models,
      prepared,
      message,
      reply,
      meta: reply
        ? {
            thinking: acc.thinking || undefined,
            toolCalls: acc.toolCalls.length ? acc.toolCalls : undefined,
            parts: acc.parts.length ? acc.parts : undefined,
            interrupted: interrupted || undefined,
          }
        : undefined,
    });

    send({ type: 'done', reply, interrupted, messageId: assistantMessageId });

    // The auto-titler summarizes the conversation in the background; hold the
    // stream open briefly so the client gets the new sidebar title without a
    // refetch. Bounded — a slow/failed titling never hangs the stream (the
    // title still self-persists and shows on the next session-list load).
    if (!clientGone) {
      const title = await Promise.race([
        titlePromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      if (title) {
        send({ type: 'thread_title', threadId: prepared.sessionId, title });
      }
    }
  } catch (err) {
    console.error('[mastra chat stream error]', err);
    send({ type: 'error', message: toUserFacingError(err).message });
  } finally {
    activity?.stop();
    clearInterval(heartbeat);
    if (!res.writableEnded) res.end();
  }
});

// erxes frontline bot webhook — called by frontline_api when botEndpointUrl is set
router.post('/bot/:conversationId', llmRouteLimiter, async (req, res) => {
  const { conversationId } = req.params;
  const { text, subdomain = 'localhost', customerId } = req.body;

  try {
    const models = await generateModels(subdomain);
    const settings = await models.MastraSettings.getSettings();

    if (!settings?.defaultAgentId) {
      return res.json({
        responses: [
          {
            type: 'text',
            text: 'No default agent configured. Please set one in Mastra Settings.',
          },
        ],
      });
    }

    const agentConfig = await models.MastraAgent.findOne({
      agentId: settings.defaultAgentId,
      isEnabled: true,
    });

    if (!agentConfig) {
      return res.json({
        responses: [
          { type: 'text', text: 'Configured agent not found or disabled.' },
        ],
      });
    }

    const providers = await models.MastraProvider.find({ isEnabled: true });
    const { agent } = await getOrCreateAgent(agentConfig, models);

    // Conversation memory is Mongo-backed, keyed by the frontline conversationId.
    const userText = text || '';
    const useHistory = agentConfig.memoryEnabled !== false;
    const advanced =
      isAdvancedMemoryEnabled() && useHistory && !!userText.trim();
    const history = useHistory
      ? await models.MastraMessage.getRecent(conversationId, 20)
      : [];
    const recentHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const memCtx: MemoryContext = {
      subdomain,
      resourceId: deriveBotResourceId({ customerId, conversationId }),
      threadId: conversationId,
      agentId: agentConfig.agentId,
    };

    // Advanced memory: semantic recall + working memory (best-effort), plus
    // the tenant's learned digest (shared, PII-free agent knowledge).
    const [[recall, wmBlock], digest] = await Promise.all([
      advanced
        ? Promise.all([
            recallBlock(userText, memCtx),
            readWorkingMemory(models, memCtx),
          ])
        : Promise.resolve([null, null] as [string | null, string | null]),
      readLearnedDigest(models, agentConfig.agentId),
    ]);

    const convo = augmentConvo({
      recentHistory,
      userMessage: userText,
      recallBlock: recall,
      workingMemoryBlock: wmBlock,
      learnedDigestBlock: digest?.block,
    });

    // Bot requests use the static app token from settings (no user session available)
    const authCtx = { token: settings?.erxesApiToken, subdomain };
    const isLegacy = isLegacyProvider(agentConfig.provider, providers);
    // The published Agent generics type tool results as wire chunks; this
    // text-only webhook path reads only `.text`, hence the structural cast
    // (same idiom as prepareChatTurn in @/agent/turn).
    const turnAgent = agent as unknown as TurnAgent;
    const result = await runWithAuth(authCtx, () =>
      isLegacy ? turnAgent.generateLegacy(convo) : turnAgent.generate(convo),
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
    const userMsg = await models.MastraMessage.addMessage(
      conversationId,
      'user',
      userText,
    );
    const asstMsg = reply
      ? await models.MastraMessage.addMessage(
          conversationId,
          'assistant',
          reply,
        )
      : null;
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
  } catch (err) {
    console.error('[mastra bot endpoint error]', err);
    return res.json({
      responses: [
        {
          type: 'text',
          text: `Error: ${(err as { message?: string }).message}`,
        },
      ],
    });
  }
});
