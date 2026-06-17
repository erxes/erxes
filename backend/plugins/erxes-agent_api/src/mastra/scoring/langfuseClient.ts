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

// subdomain → client (or null sentinel when Langfuse isn't configured).
const clients = new Map<string, Langfuse | null>();

function clientFor(subdomain?: string): Langfuse | null {
  const key = (subdomain || 'os').trim() || 'os';
  if (clients.has(key)) return clients.get(key) ?? null;
  const lf = langfuseConfig();
  if (!lf) {
    clients.set(key, null);
    return null;
  }
  const client = new Langfuse({
    publicKey: lf.publicKey,
    secretKey: lf.secretKey,
    baseUrl: lf.baseUrl,
  });
  clients.set(key, client);
  return client;
}

/**
 * Attach a human-sourced score to a trace in Langfuse. No-op (never throws) when
 * Langfuse isn't configured or the trace id is missing — so feedback always
 * succeeds even if the central server is unreachable.
 */
export async function pushUserScore(params: {
  subdomain?: string;
  traceId: string | null | undefined;
  name: string;
  value: number;
  comment?: string;
}): Promise<void> {
  if (!params.traceId) return;
  const client = clientFor(params.subdomain);
  if (!client) return;
  try {
    client.score({
      traceId: params.traceId,
      name: params.name,
      value: params.value,
      comment: params.comment,
      dataType: 'NUMERIC',
    } as never);
    await client.flushAsync();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[mastra:scoring] langfuse user-score push failed: ${(err as Error).message}`,
    );
  }
}

/** Drop cached clients (e.g. after an env change or in tests). */
export function resetLangfuseClients(): void {
  clients.clear();
}
