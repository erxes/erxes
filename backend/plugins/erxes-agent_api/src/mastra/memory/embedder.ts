// ---------------------------------------------------------------------------
// Embedder — turns text into vectors for semantic recall.
//
// Two backends, selected by ERXES_AGENT_EMBEDDER:
//   • openai   — any OpenAI-compatible /embeddings endpoint, called over fetch.
//                Zero extra dependency.
//   • fastembed — local, in-process embeddings. Requires the optional
//                "fastembed" package; loaded lazily so the plugin never hard-
//                depends on it. If it isn't installed we throw a clear, actionable
//                error (or the caller falls back to recent-history replay).
//
// The embedder is built lazily and cached, so default deployments (advanced
// memory off) never load a model.
// ---------------------------------------------------------------------------

import { resolveEmbedderConfig, EmbedderConfig } from './config';

export interface Embedder {
  embed(texts: string[]): Promise<number[][]>;
  dimension: number;
  kind: string;
  model: string;
}

let cached: Embedder | null = null;

/** Drop the cached embedder (tests / config changes). */
export function resetEmbedderCache() {
  cached = null;
}

/** Lazily build and cache the configured embedder backend. */
export async function getEmbedder(
  cfg: EmbedderConfig = resolveEmbedderConfig(),
): Promise<Embedder> {
  if (cached) return cached;
  cached =
    cfg.kind === 'openai'
      ? buildOpenAIEmbedder(cfg)
      : await buildFastEmbedEmbedder(cfg);
  return cached;
}

/** Embedder over any OpenAI-compatible /embeddings endpoint (fetch only). */
function buildOpenAIEmbedder(cfg: EmbedderConfig): Embedder {
  /** POST the batch and unwrap the embedding vectors. */
  const embed = async (texts: string[]): Promise<number[][]> => {
    if (!texts.length) return [];
    const res = await fetch(`${cfg.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey ?? ''}`,
      },
      body: JSON.stringify({ model: cfg.model, input: texts }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Embedding request failed (${res.status}): ${text}`);
    }
    const json = (await res.json()) as {
      data?: Array<{ embedding: number[] }>;
    };
    return (json.data || []).map((item) => item.embedding);
  };
  return { embed, dimension: cfg.dimension, kind: cfg.kind, model: cfg.model };
}

// The minimal surface used from the optional "fastembed" package — typed
// locally so the build never statically depends on its declarations.
interface FastEmbedModule {
  FlagEmbedding: {
    init(opts: Record<string, unknown>): Promise<{
      embed(texts: string[]): AsyncIterable<Array<Iterable<number>>>;
    }>;
  };
  EmbeddingModel?: Record<string, unknown>;
}

/** Embedder over the local fastembed model (lazy optional dependency). */
async function buildFastEmbedEmbedder(cfg: EmbedderConfig): Promise<Embedder> {
  // Loaded via a computed specifier so the build never statically requires the
  // optional package. Installed separately when the local embedder is used.
  const spec = 'fastembed';
  let mod: FastEmbedModule;
  try {
    mod = (await import(spec)) as FastEmbedModule;
  } catch {
    throw new Error(
      '[mastra:memory] The local embedder needs the "fastembed" package. ' +
        'Install it in backend/plugins/erxes-agent_api, or set ERXES_AGENT_EMBEDDER=openai.',
    );
  }

  const { FlagEmbedding, EmbeddingModel } = mod;
  const modelMap: Record<string, unknown> = {
    'bge-small-en-v1.5': EmbeddingModel?.BGESmallENV15,
    'bge-base-en-v1.5': EmbeddingModel?.BGEBaseENV15,
    'all-minilm-l6-v2': EmbeddingModel?.AllMiniLML6V2,
  };
  // Model files (~100MB+) cache to disk. Default is "local_cache" in cwd; allow
  // an explicit override so deployments can point at a persistent volume.
  const cacheDir =
    (process.env.ERXES_AGENT_EMBEDDER_CACHE_DIR ?? '').trim() || undefined;
  const flagModel = await FlagEmbedding.init({
    model: modelMap[cfg.model] ?? EmbeddingModel?.BGESmallENV15,
    ...(cacheDir ? { cacheDir } : {}),
  });

  /** Stream the model's batches and collect plain number arrays. */
  const embed = async (texts: string[]): Promise<number[][]> => {
    if (!texts.length) return [];
    const out: number[][] = [];
    for await (const batch of flagModel.embed(texts)) {
      for (const vector of batch) out.push(Array.from(vector));
    }
    return out;
  };
  return { embed, dimension: cfg.dimension, kind: cfg.kind, model: cfg.model };
}
