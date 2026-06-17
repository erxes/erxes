// ---------------------------------------------------------------------------
// Observability host — a per-tenant Mastra instance carrying a LangfuseExporter.
//
// Production builds standalone agents (agentRuntime), which have no Mastra
// parent and therefore export nothing. To ship traces + scorer scores + thumbs
// feedback to a central, self-hosted Langfuse, we register each agent onto a
// lightweight Mastra here via agent.__registerMastra(host): the agent then
// emits through host.observability → Langfuse (see chunk: scorer.run() calls
// `this.#mastra.observability.addScore(...)`).
//
// One host per subdomain (serviceName `erxes-agent:<subdomain>`) so a single
// Langfuse server monitors every client, filterable per tenant. Returns null
// when scoring is off or Langfuse isn't configured — callers then skip
// registration entirely (zero overhead when the feature is disabled).
// ---------------------------------------------------------------------------
import { Mastra } from '@mastra/core';
import { Observability } from '@mastra/observability';
import { LangfuseExporter } from '@mastra/langfuse';
import { langfuseConfig, isEvaluationEnabled } from './config';
import { getMastraStore } from '~/mastra/memory/mastraMemory';

// subdomain → host (or null sentinel = "tried, not available"). Map.has lets us
// distinguish "not yet built" from "built to null" so we don't rebuild on miss.
const hosts = new Map<string, Mastra | null>();
let warnedMissingConfig = false;

/**
 * The shared observability host for a tenant, or null when central export is
 * not configured (scoring off, or Langfuse connection incomplete). Cached per
 * subdomain.
 *
 * The host carries BOTH the Langfuse exporter (traces) AND a storage (the native
 * Mongo store): Mastra's live-scoring hook (onScorerRun) bails with "Storage not
 * found, skipping score validation and saving" when the Mastra has no storage —
 * so without it, scorers never run. With it, the hook runs each scorer (resolved
 * via getScorerById — see agentRuntime registering them) and the scorer emits to
 * this host's observability → Langfuse.
 */
export async function getObservabilityHost(
  subdomain?: string,
): Promise<Mastra | null> {
  if (!isEvaluationEnabled()) return null;
  const lf = langfuseConfig();
  if (!lf) {
    // Evaluation is ON but the (separately-hosted) Langfuse DSN is missing or
    // invalid — scores still compute locally, nothing is exported. Warn ONCE so
    // this is visible rather than a silent black hole.
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[mastra:scoring] ERXES_AGENT_EVALUATION=enable but ' +
          'ERXES_AGENT_EVALUATION_DSN is unset/invalid — scores are computed ' +
          'but NOT exported to the central server.',
      );
    }
    return null;
  }

  const key = (subdomain || 'os').trim() || 'os';
  if (hosts.has(key)) return hosts.get(key) ?? null;

  try {
    const exporter = new LangfuseExporter({
      publicKey: lf.publicKey,
      secretKey: lf.secretKey,
      baseUrl: lf.baseUrl,
      // Batched export (flush on interval) — realtime would flush per event and
      // add latency to every chat turn; we only need eventual central visibility.
      realtime: false,
    });
    const observability = new Observability({
      configs: {
        default: {
          serviceName: `erxes-agent:${key}`,
          exporters: [exporter],
        },
      },
    } as never);
    // Reuse the native Mongo store (it has a `scores` domain) so the scoring
    // hook can persist + run. Scores land in Mongo AND export to Langfuse.
    const storage = await getMastraStore(subdomain);
    const host = new Mastra({ observability, storage } as never);
    hosts.set(key, host);
    return host;
  } catch (err) {
    // A bad key / unreachable Langfuse must never break chat — log and disable.
    // eslint-disable-next-line no-console
    console.error(
      `[mastra:scoring] observability host disabled for "${key}": ${(err as Error).message}`,
    );
    hosts.set(key, null);
    return null;
  }
}

/** Drop cached hosts (e.g. after a settings/env change or in tests). */
export function resetObservabilityHosts(): void {
  hosts.clear();
}
