import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  type UIMessageChunk,
} from 'ai';
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
import { IMastraChatAttachment } from '@/session/@types/session';
import { UITurnAccumulator } from '@/agent/uiTurn';
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

// ─── Streaming chat (AI SDK UIMessage stream) ────────────────────────────────
//
// POST /chat/stream — the in-app chat UI's transport, proxied through the
// gateway at /pl:erxes-agent/chat/stream. The gateway's userMiddleware has
// already authenticated the request and forwarded the user as a base64 header.
//
// The body is the standard AI SDK v5 UIMessage stream (text / reasoning / tool
// parts), produced by Mastra's `toUIMessageStream` and bridged to the Express
// response with `pipeUIMessageStreamToResponse`. On top of the model parts we
// write three erxes-only transient data parts:
//   data-activity      — LLM one-liner of what the agent is doing right now
//   data-thread-title  — the auto-generated conversation title (after the turn)
//   data-heartbeat     — keeps the gateway proxy socket warm during long tools
// and stamp `messageId` / `interrupted` / `langfuseTraceId` onto the assistant
// message's metadata via the final `finish` chunk.
//
// Interrupt: the client aborts the fetch; the closed connection aborts the
// agent run via AbortSignal. Whatever text already streamed is persisted and
// marked `interrupted` so the partial reply survives reloads.

// The slice of the Mastra agent stream this route drives: the v5 UIMessage chunk
// stream plus the optional Langfuse trace id. The published Agent type is wider;
// this declares only what we consume so the concrete stream satisfies it.
interface UIMessageStreamSource {
  toUIMessageStream(options?: {
    sendReasoning?: boolean;
    sendSources?: boolean;
    sendStart?: boolean;
    sendFinish?: boolean;
  }): AsyncIterable<UIMessageChunk>;
  traceId?: unknown;
}

// A Mastra stream may expose `traceId` as a value or a promise — sniff and
// resolve it, accepting only a string (a non-string truthy value would slip past
// the falsy guard in pushUserScore and ship bad data to Langfuse).
async function resolveTraceId(
  stream: UIMessageStreamSource,
): Promise<string | undefined> {
  const tid = stream.traceId;
  const resolved =
    tid && typeof (tid as PromiseLike<unknown>).then === 'function'
      ? await (tid as Promise<unknown>).catch(() => undefined)
      : tid;
  return typeof resolved === 'string' ? resolved : undefined;
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
  // requests ("Failed to fetch"), so drop it (pipeUIMessageStreamToResponse sets
  // the SSE headers below) and let the gateway's CORS headers stand.
  res.removeHeader('Access-Control-Allow-Origin');

  let clientGone = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const controller = new AbortController();
  const stopHeartbeat = () => {
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = undefined;
  };
  req.on('close', () => {
    clientGone = true;
    controller.abort();
    stopHeartbeat();
  });

  // Folds the model's UIMessage chunks into the erxes-only turn artifacts we
  // persist (ordered parts, thinking, tool calls). The live render is driven by
  // the chunks themselves — this only assembles what gets written to Mongo.
  const acc = new UITurnAccumulator();
  let activity: ActivityTracker | null = null;

  const stream = createUIMessageStream({
    onError: (err) => {
      console.error('[mastra chat stream error]', err);
      return toUserFacingError(err).message;
    },
    execute: async ({ writer }) => {
      // A transient data part keeps the gateway proxy socket warm during long
      // tool calls: it streams as bytes but is dropped client-side (never added
      // to the message). Replaces the old `: ping` SSE comment.
      heartbeat = setInterval(() => {
        if (!clientGone)
          writer.write({ type: 'data-heartbeat', data: {}, transient: true });
      }, 10000);

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

        // Per-conversation reasoning override → provider-specific options,
        // resolved once against the agent's provider. Providers without a
        // portable reasoning knob yield undefined, so the model's configured
        // default stands untouched.
        const reasoningOptions = buildReasoningProviderOptions(
          prepared.agentConfig.provider,
          reasoningEffort,
        );

        // Narrates "what is the agent doing" while the turn runs — throttled
        // summaries of the live reasoning/tool signals, pushed as transient
        // `data-activity` parts.
        activity = createActivityTracker({
          userMessage: message,
          emit: (text) => {
            if (!clientGone)
              writer.write({
                type: 'data-activity',
                data: { text },
                transient: true,
              });
          },
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

        // Plan B: the Langfuse trace id for this turn — stamped onto the
        // assistant message (via the finish chunk below) so a later thumbs
        // rating can attach a human score to the right trace. Undefined when
        // evaluation is off.
        let langfuseTraceId: string | undefined;
        try {
          await runWithAuth(authCtx, async () => {
            const modelStream = (await agent.stream(convo, {
              abortSignal: controller.signal,
              ...(memoryBinding ? { memory: memoryBinding } : {}),
              ...(reasoningOptions
                ? { providerOptions: reasoningOptions }
                : {}),
            })) as unknown as UIMessageStreamSource;
            langfuseTraceId = await resolveTraceId(modelStream);

            // sendFinish:false — we emit the final `finish` ourselves after
            // persisting, so it can carry the native messageId the client rates.
            for await (const chunk of modelStream.toUIMessageStream({
              sendReasoning: true,
              sendSources: false,
              sendFinish: false,
            })) {
              acc.fold(chunk);
              if (chunk.type === 'reasoning-delta')
                activity?.onThinking(chunk.delta ?? '');
              else if (chunk.type === 'tool-input-available')
                activity?.onToolCall(chunk.toolName, chunk.input);
              writer.write(chunk);
            }
          });
        } catch (err) {
          // An abort lands here on most providers — an interrupt, not an error.
          if (!controller.signal.aborted) throw err;
        }

        activity?.stop();

        const interrupted = controller.signal.aborted;
        let reply: string | null = acc.text || null;

        if (!interrupted && !acc.text) {
          // No answer text streamed — synthesize from tool results. (Native
          // generate() produces the final text itself, so this only fires when
          // the model ended a turn on tool calls without prose.)
          // synthesizeFromToolResults internally skips synthesis when nothing
          // real came back, so we never fabricate a success.
          const toolResults = acc.toolResults();
          if (toolResults.length) {
            reply = await synthesizeFromToolResults({
              agent,
              message,
              authCtx,
              toolResults,
            });
            if (reply) {
              const id = `synth-${Date.now()}`;
              writer.write({ type: 'text-start', id });
              writer.write({ type: 'text-delta', id, delta: reply });
              writer.write({ type: 'text-end', id });
            }
          }
        }

        const { titlePromise, assistantMessageId } = await persistTurn({
          models,
          prepared,
          message,
          reply,
          meta: reply ? acc.meta(interrupted, langfuseTraceId) : undefined,
        });

        // Close the assistant message with its final metadata: the native id
        // the client rates, the interrupted flag, and the Langfuse trace id.
        // Replaces the old `done` event (sendFinish:false suppressed Mastra's).
        writer.write({
          type: 'finish',
          messageMetadata: {
            messageId: assistantMessageId,
            interrupted,
            langfuseTraceId,
          },
        });

        // The auto-titler summarizes the conversation in the background; hold
        // the stream open briefly so the client gets the new sidebar title
        // without a refetch. Bounded — a slow/failed titling never hangs the
        // stream (the title still self-persists for the next session-list load).
        if (!clientGone) {
          const title = await Promise.race([
            titlePromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
          ]);
          if (title && !clientGone) {
            writer.write({
              type: 'data-thread-title',
              data: { threadId: prepared.sessionId, title },
              transient: true,
            });
          }
        }
      } finally {
        activity?.stop();
        stopHeartbeat();
      }
    },
  });

  pipeUIMessageStreamToResponse({
    response: res,
    stream,
    // Keep the gateway proxy from buffering the streamed SSE body.
    headers: { 'X-Accel-Buffering': 'no' },
  });
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
