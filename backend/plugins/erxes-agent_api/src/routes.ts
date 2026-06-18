import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { extractUserFromHeader, getSubdomain } from 'erxes-api-shared/utils';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { generateModels } from './connectionResolvers';
import { getOrCreateAgent } from './mastra/agentRuntime';
import {
  ActivityTracker,
  createActivityTracker,
  summarizeActivity,
} from './mastra/activity';
import { toolStatusLine } from './mastra/activity-signals';
import {
  isReasoningEffort,
  buildReasoningProviderOptions,
  ReasoningEffort,
} from './mastra/providers';
import { runWithAuth, ApprovedOp } from './mastra/requestContext';
import { isAdvancedMemoryEnabled } from './mastra/memory/config';
import { scopedResource } from './mastra/memory/mastraMemory';
import { augmentConvo } from './mastra/memory';
import { readLearnedDigest } from './mastra/learning/digest';
import {
  prepareChatTurn,
  persistTurn,
  synthesizeFromToolResults,
  toUserFacingError,
  runAgentTurn,
  patchNativeTurn,
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

// Validated POST /chat/stream payload. All shape-checking for the untrusted
// request body lives here so the handler reads as straight-line logic.
interface ChatStreamRequest {
  agentId: string;
  message: string;
  threadId?: string;
  reasoningEffort?: ReasoningEffort;
  attachments: IMastraChatAttachment[];
  approvedOperations: ApprovedOp[];
}

// Shape-check the per-turn destructive-op approvals the client echoes back when
// the user clicks Approve. Returns the sanitized list, or null when malformed.
const MAX_APPROVED_OPS = 20;
function sanitizeApprovedOperations(raw: unknown): ApprovedOp[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_APPROVED_OPS) return null;
  const out: ApprovedOp[] = [];
  for (const item of raw) {
    const candidate = item as Record<string, unknown> | null | undefined;
    if (!candidate || typeof candidate.operation !== 'string') return null;
    const args =
      candidate.args && typeof candidate.args === 'object'
        ? (candidate.args as Record<string, unknown>)
        : undefined;
    out.push({ operation: candidate.operation, args });
  }
  return out;
}

type ParseResult =
  | { ok: true; value: ChatStreamRequest }
  | { ok: false; error: string };

function parseChatStreamBody(raw: unknown): ParseResult {
  const body = (raw ?? {}) as Record<string, unknown>;
  const { agentId, message, threadId, reasoningEffort } = body;

  if (
    typeof agentId !== 'string' ||
    !agentId ||
    typeof message !== 'string' ||
    !message.trim()
  ) {
    return { ok: false, error: 'agentId and message are required' };
  }
  if (threadId !== undefined && typeof threadId !== 'string') {
    return { ok: false, error: 'threadId must be a string' };
  }
  if (reasoningEffort !== undefined && !isReasoningEffort(reasoningEffort)) {
    return {
      ok: false,
      error: 'reasoningEffort must be off | low | medium | high',
    };
  }

  const attachments = sanitizeAttachments(body.attachments);
  if (attachments === null) {
    return { ok: false, error: 'Invalid attachments payload' };
  }

  const approvedOperations = sanitizeApprovedOperations(body.approvedOperations);
  if (approvedOperations === null) {
    return { ok: false, error: 'Invalid approvedOperations payload' };
  }

  return {
    ok: true,
    value: {
      agentId,
      message,
      threadId,
      reasoningEffort,
      attachments,
      approvedOperations,
    },
  };
}

router.post('/chat/stream', llmRouteLimiter, async (req, res) => {
  const user = extractUserFromHeader(req.headers);
  if (!user?._id) {
    return res.status(401).json({ error: 'Login required' });
  }

  const parsed = parseChatStreamBody(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }
  // reasoningEffort is the optional per-conversation override from the composer.
  const { agentId, message, threadId, reasoningEffort, attachments } =
    parsed.value;
  const { approvedOperations } = parsed.value;

  const subdomain = getSubdomain(req);

  // Streaming chat is the HTTP twin of the mastraAgentChat resolver, so it is
  // gated by the same `agentsChat` permission. checkPermissionGroup throws on
  // denial (FORBIDDEN) — translate that into a 403 for the SSE client.
  try {
    await checkPermissionGroup(subdomain, user)('agentsChat');
  } catch {
    return res.status(403).json({ error: 'Permission required' });
  }

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
      approvedOperations,
    });
    const { agent, convo, authCtx, memoryBinding } = prepared;

    // Per-conversation reasoning override → provider-specific options, resolved
    // once against the agent's provider. Providers without a portable reasoning
    // knob yield undefined, so the model's configured default stands untouched.
    const reasoningOptions = buildReasoningProviderOptions(
      prepared.agentConfig.provider,
      reasoningEffort,
    );

    // Narrates "what is the agent doing" while the turn runs — throttled
    // summaries of the live reasoning/tool signals, pushed as activity events.
    activity = createActivityTracker({
      userMessage: message,
      emit: (text) => send({ type: 'activity', text }),
      // Tool steps narrate instantly (no LLM); reasoning bursts use the model.
      toolSignal: toolStatusLine,
      summarize: (snapshot) =>
        summarizeActivity({
          provider: prepared.agentConfig.provider,
          model: prepared.agentConfig.model,
          providers: prepared.providers,
          authCtx,
          snapshot,
        }),
    });

    let streamError: string | null = null;

    // Plan B: the Langfuse trace id for this turn — stamped onto the assistant
    // message (via meta below) so a later thumbs rating can attach a human score
    // to the right trace. Captured from the stream; undefined when eval is off.
    let langfuseTraceId: string | undefined;
    try {
      await runWithAuth(authCtx, async () => {
        const stream = await agent.stream(convo, {
          abortSignal: controller.signal,
          ...(memoryBinding ? { memory: memoryBinding } : {}),
          ...(reasoningOptions ? { providerOptions: reasoningOptions } : {}),
        });
        const tid = (stream as { traceId?: unknown }).traceId;
        const resolvedTid =
          tid && typeof (tid as PromiseLike<unknown>).then === 'function'
            ? await (tid as Promise<unknown>).catch(() => undefined)
            : tid;
        // Only accept a string trace id — a non-string truthy value would slip
        // past the falsy guard in pushUserScore and ship bad data to Langfuse.
        langfuseTraceId =
          typeof resolvedTid === 'string' ? resolvedTid : undefined;

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

    if (!interrupted && !acc.text) {
      // No answer text streamed — synthesize from tool results, or report the
      // error. (Native generate() produces the final text itself, so this only
      // fires when the model ended a turn on tool calls without prose.)
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
          authCtx,
          toolResults,
        });
        send({ type: 'text', text: reply });
      } else if (streamError) {
        throw new Error(streamError);
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
            langfuseTraceId,
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

    const { agent } = await getOrCreateAgent(agentConfig, models, subdomain);

    // The frontline conversation is a Mastra-native thread owned by a synthetic
    // "bot:*" resource (kept out of in-app users' chat lists). Memory replays
    // history + runs recall/working-memory and persists this turn itself.
    const userText = text || '';
    const useMemory =
      isAdvancedMemoryEnabled() &&
      agentConfig.memoryEnabled !== false &&
      Boolean(userText.trim());
    const memoryBinding = useMemory
      ? {
          thread: conversationId,
          resource: scopedResource(
            subdomain,
            `bot:${customerId || conversationId}`,
          ),
        }
      : undefined;

    // Shared learned digest (PII-free agent knowledge), separate from memory.
    const digest = await readLearnedDigest(models, agentConfig.agentId);
    const convo = augmentConvo({
      recentHistory: [],
      userMessage: userText,
      recallBlock: null,
      workingMemoryBlock: null,
      learnedDigestBlock: digest?.block,
    });

    // Bot requests use the static app token from settings (no user session).
    const authCtx = { token: settings?.erxesApiToken, subdomain };
    const reply =
      (await runWithAuth(authCtx, () =>
        runAgentTurn({
          // Structural cast (same idiom as prepareChatTurn): the published
          // Agent generics are wider than the slice runAgentTurn consumes.
          agent: agent as unknown as TurnAgent,
          convo,
          message: userText,
          authCtx,
          memory: memoryBinding,
        }),
      )) ?? '';

    // Native persistence happened in runAgentTurn; stamp agentId + tenant so the
    // bot thread is attributable + sweepable by the learning pass.
    if (memoryBinding) {
      await patchNativeTurn({
        subdomain,
        binding: memoryBinding,
        agentId: agentConfig.agentId,
        reply,
      }).catch(() => null);
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
