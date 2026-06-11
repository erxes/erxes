// ---------------------------------------------------------------------------
// Advanced Memory — configuration (pure, env-driven).
//
// Every function here takes an injectable `env` map (defaulting to process.env)
// so the logic is unit-testable without touching the real environment. Nothing
// in this file performs I/O — it only reads/normalizes configuration.
//
// See docs/ADVANCED_MEMORY.md (§6) and docs/ADVANCED_MEMORY_TESTS.md (§1–3, §9).
// ---------------------------------------------------------------------------

import { trimEdgeChars } from '~/mastra/text';

export type Env = Record<string, string | undefined>;

export type EmbedderKind = 'fastembed' | 'openai';

export interface EmbedderConfig {
  kind: EmbedderKind;
  model: string;
  dimension: number;
  baseUrl?: string;
  apiKey?: string;
}

export interface RecallTuning {
  topK: number;
  minScore: number;
  scope: 'resource' | 'thread';
}

export interface AdvancedMemoryStatus {
  enabled: boolean;
  embedder: EmbedderKind | null;
  embedderModel: string | null;
  qdrantUrl: string | null;
  qdrantReachable: boolean | null;
  collection: string | null;
}

const FASTEMBED_DEFAULT_MODEL = 'bge-small-en-v1.5';
const OPENAI_DEFAULT_MODEL = 'text-embedding-3-small';
const OPENAI_DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_QDRANT_URL = 'http://localhost:6333';

// Known embedding dimensions — used to size the Qdrant collection. A model not
// listed here falls back to its provider's most common size.
const EMBED_DIMENSIONS: Record<string, number> = {
  'bge-small-en-v1.5': 384,
  'bge-base-en-v1.5': 768,
  'all-minilm-l6-v2': 384,
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
};
const FASTEMBED_FALLBACK_DIM = 384;
const OPENAI_FALLBACK_DIM = 1536;

/** Read one env var as trimmed text (absent → empty string). */
function val(env: Env, key: string): string {
  return (env[key] ?? '').trim();
}

/**
 * The master switch. Advanced memory is enabled ONLY when ERXES_AGENT_MEMORY is
 * exactly "enable" (whitespace-trimmed). Every other value — true/1/on/ENABLE —
 * is treated as off, so the flag is unambiguous and hard to enable by accident.
 */
export function isAdvancedMemoryEnabled(env: Env = process.env): boolean {
  return val(env, 'ERXES_AGENT_MEMORY') === 'enable';
}

/** Resolve the embedder kind, model, dimension, and (for openai) endpoint/key. */
export function resolveEmbedderConfig(env: Env = process.env): EmbedderConfig {
  const raw = val(env, 'ERXES_AGENT_EMBEDDER').toLowerCase();

  let kind: EmbedderKind;
  if (raw === '' || raw === 'fastembed') {
    kind = 'fastembed';
  } else if (raw === 'openai') {
    kind = 'openai';
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      `[mastra:memory] Unknown ERXES_AGENT_EMBEDDER="${raw}", defaulting to fastembed.`,
    );
    kind = 'fastembed';
  }

  if (kind === 'fastembed') {
    const model =
      val(env, 'ERXES_AGENT_EMBEDDER_MODEL') || FASTEMBED_DEFAULT_MODEL;
    const dimension = EMBED_DIMENSIONS[model] ?? FASTEMBED_FALLBACK_DIM;
    return { kind, model, dimension };
  }

  const model = val(env, 'ERXES_AGENT_EMBEDDER_MODEL') || OPENAI_DEFAULT_MODEL;
  const dimension = EMBED_DIMENSIONS[model] ?? OPENAI_FALLBACK_DIM;
  const baseUrl =
    val(env, 'ERXES_AGENT_EMBEDDER_BASE_URL') || OPENAI_DEFAULT_BASE_URL;
  const apiKey = val(env, 'ERXES_AGENT_EMBEDDER_API_KEY') || undefined;

  const cfg: EmbedderConfig = { kind, model, dimension, baseUrl };
  if (apiKey) cfg.apiKey = apiKey;
  return cfg;
}

/**
 * Qdrant collection name, derived from the embedder model + dimension. Encoding
 * the dimension means switching embedders creates a NEW collection instead of
 * crashing on a vector-size mismatch against an old one.
 */
export function collectionName(model: string, dimension: number): string {
  const slug = model.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const trimmed = trimEdgeChars(slug, '_', '_');
  return `mastra_memory_${trimmed}_${dimension}`;
}

/** Parse a positive integer from env text, falling back to the default. */
function parsePositiveInt(raw: string, def: number): number {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

/** Parse a 0..1 score from env text, falling back to the default. */
function parseScore(raw: string, def: number): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : def;
}

/** Semantic-recall tuning knobs (topK / minScore / scope) with safe defaults. */
export function resolveRecallTuning(env: Env = process.env): RecallTuning {
  return {
    topK: parsePositiveInt(val(env, 'ERXES_AGENT_MEMORY_TOPK'), 4),
    minScore: parseScore(val(env, 'ERXES_AGENT_MEMORY_MIN_SCORE'), 0.5),
    scope:
      val(env, 'ERXES_AGENT_MEMORY_SCOPE').toLowerCase() === 'thread'
        ? 'thread'
        : 'resource',
  };
}

/** Qdrant base URL (ERXES_AGENT_QDRANT_URL, default localhost:6333). */
export function qdrantUrl(env: Env = process.env): string {
  return val(env, 'ERXES_AGENT_QDRANT_URL') || DEFAULT_QDRANT_URL;
}

/** Optional Qdrant API key (ERXES_AGENT_QDRANT_API_KEY). */
export function qdrantApiKey(env: Env = process.env): string | undefined {
  return val(env, 'ERXES_AGENT_QDRANT_API_KEY') || undefined;
}

/**
 * The read-only status surfaced in Settings. When disabled, every detail is
 * null. `qdrantReachable` is supplied by a live health check (Phase 1); pass
 * undefined when no check has run yet.
 */
export function computeAdvancedMemoryStatus(
  env: Env = process.env,
  health?: { reachable: boolean | null },
): AdvancedMemoryStatus {
  if (!isAdvancedMemoryEnabled(env)) {
    return {
      enabled: false,
      embedder: null,
      embedderModel: null,
      qdrantUrl: null,
      qdrantReachable: null,
      collection: null,
    };
  }

  const emb = resolveEmbedderConfig(env);
  return {
    enabled: true,
    embedder: emb.kind,
    embedderModel: emb.model,
    qdrantUrl: qdrantUrl(env),
    qdrantReachable: health?.reachable ?? null,
    collection: collectionName(emb.model, emb.dimension),
  };
}
