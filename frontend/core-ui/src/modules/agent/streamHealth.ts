import type { TAgentLabelTranslate } from './utils/agentWorkSteps';

/** Backend code for a run whose producer is gone (core-api `agentsStream.ts`). */
export const AGENTS_RUN_INTERRUPTED_CODE = 'AGENTS_RUN_INTERRUPTED';

/**
 * How long an agents stream may stay silent. The backend writes a keep-alive
 * comment every 5 seconds, and the gateway keeps a connection open after its
 * producer process dies, so a longer silence means the reply is lost.
 */
export const AGENTS_STREAM_STALL_MS = 20_000;

/**
 * A stream that went silent. It is a `TypeError` naming the network, which
 * the AI SDK treats as a disconnect: the run stays reconnectable.
 */
export class AgentsStreamStalledError extends TypeError {
  constructor() {
    super('The network stream from the server stopped.');
    this.name = 'AgentsStreamStalledError';
  }
}

export const isAgentsStreamStalled = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AgentsStreamStalledError';

/** The `{ error, code }` body that HTTP errors and stream errors carry. */
const readErrorBody = (
  error: Error,
): { error?: unknown; code?: unknown } | undefined => {
  try {
    const parsed: unknown = JSON.parse(error.message);
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const isAgentsRunInterrupted = (error: unknown): boolean =>
  error instanceof Error &&
  readErrorBody(error)?.code === AGENTS_RUN_INTERRUPTED_CODE;

/** Readable chat error text: known failures are translated. */
export const describeAgentsChatError = (
  error: Error,
  t: TAgentLabelTranslate,
): string => {
  if (isAgentsRunInterrupted(error)) {
    return t(
      'run-interrupted',
      'The server restarted while answering. Retry to continue.',
    );
  }

  if (isAgentsStreamStalled(error)) {
    return t('stream-lost', 'Lost the connection to the server.');
  }

  const body = readErrorBody(error);

  if (typeof body?.error === 'string' && body.error) {
    return body.error;
  }

  return error.message || 'Something went wrong.';
};

/**
 * Passes an SSE body through, failing it with `AgentsStreamStalledError`
 * when no bytes (keep-alive comments included) arrive for `stallMs` while
 * the reader waits. Cancelling the source closes the dead connection.
 */
export const watchAgentsStream = (
  body: ReadableStream<Uint8Array>,
  stallMs: number,
): ReadableStream<Uint8Array> => {
  const reader = body.getReader();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const stalled = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new AgentsStreamStalledError()), stallMs);
      });

      try {
        const { done, value } = await Promise.race([reader.read(), stalled]);

        if (done) controller.close();
        else controller.enqueue(value);
      } catch (error) {
        if (isAgentsStreamStalled(error)) {
          reader.cancel(error).catch(() => undefined);
        }
        controller.error(error);
      } finally {
        clearTimeout(timer);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
};
