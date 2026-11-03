import type { UIMessageChunk } from 'ai' with { 'resolution-mode': 'import' };
import type { MastraModelOutput } from '@mastra/core/stream' with {
  'resolution-mode': 'import',
};
import type { ServerResponse } from 'node:http';

/** Error code clients map to their own translated restart message. */
export const AGENTS_RUN_INTERRUPTED_CODE = 'AGENTS_RUN_INTERRUPTED';

export const AGENTS_RUN_INTERRUPTED_MESSAGE =
  'The server restarted while answering. Retry to continue.';

/**
 * The `{ error, code }` body of a run whose producer is gone. HTTP errors and
 * stream error text share it, so clients read both the same way.
 */
export const agentsRunInterruptedError = (): {
  error: string;
  code: string;
} => ({
  error: AGENTS_RUN_INTERRUPTED_MESSAGE,
  code: AGENTS_RUN_INTERRUPTED_CODE,
});

/**
 * SSE keep-alive comment interval. A stream's bytes stop when its producer
 * process dies even though the gateway keeps the client connection open, so
 * clients treat a silence well past this interval as a lost stream.
 */
export const AGENTS_STREAM_KEEP_ALIVE_MS = 5_000;

// Aborted once, when this process starts shutting down.
const shutdown = new AbortController();

/**
 * Called on SIGINT/SIGTERM. Streams of runs this process produces end with
 * the restart error: those runs die with it (crash replay is off), so clients
 * learn it at once instead of waiting on a silent connection. Observed runs
 * (reconnects) may live in another process, so their connections only drop
 * and the client reconnects elsewhere.
 */
export const interruptAgentsStreams = (): void => shutdown.abort();

/** Passes chunks through until shutdown, then ends with the restart error. */
const interruptOnShutdown = (
  source: ReadableStream<UIMessageChunk>,
): ReadableStream<UIMessageChunk> => {
  const reader = source.getReader();
  let finished = false;
  let interrupt = (): void => undefined;

  return new ReadableStream<UIMessageChunk>({
    start(controller) {
      interrupt = () => {
        if (finished) return;
        finished = true;
        controller.enqueue({
          type: 'error',
          errorText: JSON.stringify(agentsRunInterruptedError()),
        });
        controller.close();
        reader.cancel().catch(() => undefined);
      };
      if (shutdown.signal.aborted) interrupt();
      else shutdown.signal.addEventListener('abort', interrupt, { once: true });
    },
    async pull(controller) {
      const { done, value } = await reader.read();
      if (finished) return;
      if (done) {
        finished = true;
        shutdown.signal.removeEventListener('abort', interrupt);
        controller.close();
        return;
      }
      controller.enqueue(value);
    },
    cancel(reason) {
      finished = true;
      shutdown.signal.removeEventListener('abort', interrupt);
      return reader.cancel(reason);
    },
  });
};

/**
 * Readable client-facing message for a failed model stream. Mastra's
 * `@mastra/ai-sdk` adapter may hand `onError` a plain serialized error
 * object (`{ name, message, stack }`) rather than an `Error` instance, so
 * both shapes are unwrapped. Provider errors (rate limits, unsupported
 * parameters, invalid keys) carry actionable text and no secrets — the
 * API key never appears in an error body — so the message is forwarded
 * instead of a generic dead end.
 */
export const describeAgentsStreamError = (error: unknown): string => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : '';

  return message.trim() || 'The model failed to generate a response.';
};

/** Drops the connection on shutdown, leaving the run's fate to a reconnect. */
const dropOnShutdown = (res: ServerResponse): void => {
  const drop = () => res.destroy();

  if (shutdown.signal.aborted) {
    drop();
    return;
  }

  shutdown.signal.addEventListener('abort', drop, { once: true });
  res.once('close', () => shutdown.signal.removeEventListener('abort', drop));
};

/**
 * Pipes a MastraModelOutput to the response as an AI SDK v7 UI message
 * stream, exposing the conversation id before streaming starts so clients
 * can continue the same thread on their next request. Quiet stretches carry
 * keep-alive comments. On shutdown a run produced here ends with the restart
 * error; an `observed` run (possibly produced elsewhere) drops the connection.
 */
export const pipeAgentsStream = async (
  res: ServerResponse,
  threadId: string,
  output: MastraModelOutput,
  {
    describeError = describeAgentsStreamError,
    keepAliveMs = AGENTS_STREAM_KEEP_ALIVE_MS,
    observed = false,
  }: {
    describeError?: (error: unknown) => string;
    keepAliveMs?: number;
    observed?: boolean;
  } = {},
): Promise<void> => {
  res.setHeader('X-Agents-Thread-Id', threadId);

  // 'ai' and '@mastra/ai-sdk' are ESM-only; load them dynamically from
  // CommonJS.
  const { pipeUIMessageStreamToResponse } = await import('ai');
  const { toAISdkStream } = await import('@mastra/ai-sdk');
  const stream = toAISdkStream(output, {
    from: 'agent',
    version: 'v7',
    onError: describeError,
  });

  if (observed) dropOnShutdown(res);

  pipeUIMessageStreamToResponse({
    response: res,
    keepAliveMs,
    stream: observed ? stream : interruptOnShutdown(stream),
  });
};
