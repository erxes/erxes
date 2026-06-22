import { runWithAuth } from '~/mastra/requestContext';
import {
  IMastraToolCall,
  IMastraTurnPart,
  IMastraMessageMeta,
} from '@/session/@types/session';
import { PreparedTurn, StreamEvent } from '@/agent/types';
import { dedupeToolResults, synthesizeFromToolResults } from '@/agent/run';

// Streaming turn execution. The blocking twin lives in run.ts (runAgentTurn);
// this owns the stream path: normalize Mastra/AI-SDK chunks into wire events,
// fold them into the turn's persisted artifacts, capture the trace id, and run
// the SAME tool-result fallback run.ts uses when the model streams no prose.
// The HTTP/SSE route is left with only transport (auth, headers, heartbeat,
// abort, onEvent→send).

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
// flat shapes) into the wire events the SSE route emits.
export function normalizeChunk(raw: unknown): StreamEvent | null {
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

// Accumulated turn state — what gets persisted and what `done` reports.
// `parts` keeps reasoning bursts and tool calls in arrival order (thinking →
// tool → thinking → …); tool entries in `parts` share object identity with
// `toolCalls`, so a result landing later updates both. A new non-thinking event
// ends the current reasoning burst, so the next thinking delta starts a fresh
// part instead of growing the old one.
export class TurnAccumulator {
  text = '';
  thinking = '';
  toolCalls: IMastraToolCall[] = [];
  parts: IMastraTurnPart[] = [];
  private thinkingOpen = false;

  appendText(text: string) {
    this.text += text;
    this.thinkingOpen = false;
  }

  appendThinking(text: string) {
    this.thinking += text;
    const last = this.parts[this.parts.length - 1];
    if (this.thinkingOpen && last?.kind === 'thinking') last.text += text;
    else {
      this.parts.push({ kind: 'thinking', text });
      this.thinkingOpen = true;
    }
  }

  recordToolCall(ev: StreamEvent) {
    this.thinkingOpen = false;
    if (ev.type === 'tool_call') {
      const call: IMastraToolCall = {
        toolCallId: ev.toolCallId,
        toolName: ev.toolName as string,
        args: ev.args,
      };
      this.toolCalls.push(call);
      this.parts.push({ kind: 'tool', call });
    } else if (ev.type === 'tool_result') {
      const existing = ev.toolCallId
        ? this.toolCalls.find((tc) => tc.toolCallId === ev.toolCallId)
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
        this.toolCalls.push(call);
        this.parts.push({ kind: 'tool', call });
      }
    }
  }

  /** The erxes turn meta to persist for this turn, or undefined when empty. */
  meta(interrupted: boolean, langfuseTraceId?: string): IMastraMessageMeta {
    return {
      thinking: this.thinking || undefined,
      toolCalls: this.toolCalls.length ? this.toolCalls : undefined,
      parts: this.parts.length ? this.parts : undefined,
      interrupted: interrupted || undefined,
      langfuseTraceId,
    };
  }
}

// A Mastra stream may expose `traceId` as a value or a promise — sniff and
// resolve it, accepting only a string (a non-string truthy value would slip
// past the falsy guard in pushUserScore and ship bad data to Langfuse).
export async function resolveTraceId(
  stream: unknown,
): Promise<string | undefined> {
  const tid = (stream as { traceId?: unknown }).traceId;
  const resolved =
    tid && typeof (tid as PromiseLike<unknown>).then === 'function'
      ? await (tid as Promise<unknown>).catch(() => undefined)
      : tid;
  return typeof resolved === 'string' ? resolved : undefined;
}

export interface StreamTurnHooks {
  // Emitted for every normalized wire event (text/thinking/tool_*/error and the
  // synthesized text). The route forwards these to the SSE client.
  onEvent: (event: StreamEvent) => void;
  // Per-thinking/tool hooks so the route's activity narrator can observe the
  // live signals without re-walking the stream. Optional.
  onThinking?: (text: string) => void;
  onToolCall?: (toolName: string, args: unknown) => void;
  // Stream options (abortSignal, memory, providerOptions) forwarded verbatim to
  // agent.stream().
  streamOptions?: Record<string, unknown>;
  // True once the client aborted — turns a stream-aborted run into an interrupt
  // rather than an error, and gates the no-text fallback.
  isAborted: () => boolean;
}

export interface StreamTurnResult {
  reply: string | null;
  meta: IMastraMessageMeta;
  interrupted: boolean;
}

/**
 * Run one agent turn against a stream, folding chunks into a TurnAccumulator
 * and emitting wire events via `onEvent`. Owns the trace-id capture and the
 * no-prose tool-result fallback — using the SAME dedupe +
 * synthesizeFromToolResults path as the blocking runAgentTurn, so the streamed
 * and blocking fallbacks can no longer drift. Returns the assembled reply, the
 * persist-ready meta, and whether the turn was interrupted.
 */
export async function streamAgentTurn(
  prepared: PreparedTurn,
  hooks: StreamTurnHooks,
  message: string,
): Promise<StreamTurnResult> {
  const { agent, convo, authCtx } = prepared;
  const acc = new TurnAccumulator();
  let streamError: string | null = null;
  let langfuseTraceId: string | undefined;

  try {
    await runWithAuth(authCtx, async () => {
      const stream = await agent.stream(convo, hooks.streamOptions ?? {});
      langfuseTraceId = await resolveTraceId(stream);

      for await (const chunk of stream.fullStream as AsyncIterable<unknown>) {
        const ev = normalizeChunk(chunk);
        if (!ev) continue;

        if (ev.type === 'text') {
          acc.appendText(ev.text ?? '');
        } else if (ev.type === 'thinking') {
          acc.appendThinking(ev.text ?? '');
          hooks.onThinking?.(ev.text ?? '');
        } else if (ev.type === 'error') {
          streamError = ev.message ?? null;
          continue; // surfaced after the loop so fallbacks still apply
        } else {
          acc.recordToolCall(ev);
          if (ev.type === 'tool_call')
            hooks.onToolCall?.(ev.toolName ?? '', ev.args);
        }

        hooks.onEvent(ev);
      }
    });
  } catch (err) {
    // An abort lands here on most providers — that's an interrupt, not an error.
    if (!hooks.isAborted()) throw err;
  }

  const interrupted = hooks.isAborted();
  let reply: string | null = acc.text || null;

  if (!interrupted && !acc.text) {
    // No answer text streamed — synthesize from tool results, or report the
    // error. (Native generate() produces the final text itself, so this only
    // fires when the model ended a turn on tool calls without prose.) Use the
    // same dedupe + synthesis run.ts uses so the two paths stay identical:
    // synthesizeFromToolResults internally skips synthesis when nothing real
    // came back (isSearchResult / isRealToolData), so we never fabricate a
    // success the way the old `result !== undefined` filter could.
    const toolResults = dedupeToolResults(
      acc.toolCalls
        .filter((tc) => tc.result !== undefined)
        .map((tc) => ({
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          result: tc.result,
        })),
    );

    if (toolResults.length) {
      reply = await synthesizeFromToolResults({
        agent,
        message,
        authCtx,
        toolResults,
      });
      hooks.onEvent({ type: 'text', text: reply });
    } else if (streamError) {
      throw new Error(streamError);
    }
  }

  return { reply, meta: acc.meta(interrupted, langfuseTraceId), interrupted };
}
