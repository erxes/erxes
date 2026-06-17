// ---------------------------------------------------------------------------
// Langfuse SDK client — for pushing HUMAN signals (thumbs/ratings) to Langfuse
// as scores on a trace (Plan B). Runtime code uses the official `langfuse` SDK
// programmatically — never the `langfuse` CLI (that's dev-only).
//
// A human annotation in Langfuse IS a score (just human-sourced), so an erxes
// user's thumbs becomes a score attached to that turn's trace. The trace id is
// captured per turn and stored on the assistant message; the feedback mutation
// reads it back and calls pushUserScore here.
// ---------------------------------------------------------------------------
import { Langfuse } from 'langfuse';
import { langfuseConfig } from './config';

// Langfuse is configured by ONE global DSN, so a single shared client serves
// every tenant — no per-subdomain fan-out. (undefined = not yet resolved;
// null = configured-absent sentinel.)
let client: Langfuse | null | undefined;

function getClient(): Langfuse | null {
  if (client !== undefined) return client;
  const lf = langfuseConfig();
  client = lf
    ? new Langfuse({
        publicKey: lf.publicKey,
        secretKey: lf.secretKey,
        baseUrl: lf.baseUrl,
      })
    : null;
  return client;
}

/**
 * Attach a human-sourced score to a trace in Langfuse. No-op (never throws) when
 * Langfuse isn't configured or the trace id is missing — so feedback always
 * succeeds even if the central server is unreachable.
 */
export async function pushUserScore(params: {
  traceId: string | null | undefined;
  name: string;
  value: number;
  comment?: string;
}): Promise<void> {
  if (!params.traceId) return;
  const lf = getClient();
  if (!lf) return;
  try {
    lf.score({
      traceId: params.traceId,
      name: params.name,
      value: params.value,
      comment: params.comment,
      dataType: 'NUMERIC',
    });
    await lf.flushAsync();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[mastra:scoring] langfuse user-score push failed: ${(err as Error).message}`,
    );
  }
}

/** Drop the cached client (e.g. after an env change or in tests). */
export function resetLangfuseClients(): void {
  client = undefined;
}
