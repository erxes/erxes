// ---------------------------------------------------------------------------
// Company Knowledge RAG — configuration (pure, env-driven).
//
// Mirrors src/mastra/memory/config.ts: every function takes an injectable
// `env` map so the logic is unit-testable, and nothing here performs I/O.
// The knowledge feature shares the Qdrant + embedder configuration with
// advanced memory (ERXES_AGENT_QDRANT_*, ERXES_AGENT_EMBEDDER_*) but has its
// own master switch and its own Qdrant collection.
//
// See docs/COMPANY_KNOWLEDGE_RAG.md.
// ---------------------------------------------------------------------------

import {
  Env,
  resolveEmbedderConfig,
  qdrantUrl,
  qdrantApiKey,
} from '~/mastra/memory/config';

export { resolveEmbedderConfig, qdrantUrl, qdrantApiKey };
export type { Env };

export interface KnowledgeTuning {
  topK: number;
  minScore: number;
  /** Candidate multiplier for the authoritative post-filter (over-fetch). */
  overfetch: number;
}

export interface KnowledgeStatus {
  enabled: boolean;
  embedder: string | null;
  embedderModel: string | null;
  qdrantUrl: string | null;
  qdrantReachable: boolean | null;
  collection: string | null;
}

const DEFAULT_SYNC_CRON = '0 * * * *'; // hourly, on the hour

function val(env: Env, key: string): string {
  return (env[key] ?? '').trim();
}

/**
 * The master switch. Company knowledge is enabled ONLY when
 * ERXES_AGENT_KNOWLEDGE is exactly "enable" (whitespace-trimmed) — same
 * unambiguous contract as ERXES_AGENT_MEMORY, but independent of it.
 */
export function isKnowledgeEnabled(env: Env = process.env): boolean {
  return val(env, 'ERXES_AGENT_KNOWLEDGE') === 'enable';
}

/**
 * Qdrant collection for company knowledge, separate from chat memory.
 * Encodes model + dimension so switching embedders creates a fresh
 * collection instead of crashing on a vector-size mismatch.
 */
export function knowledgeCollectionName(model: string, dimension: number): string {
  const slug = model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `mastra_knowledge_${slug}_${dimension}`;
}

function parsePositiveInt(raw: string, def: number): number {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function parseScore(raw: string, def: number): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : def;
}

export function resolveKnowledgeTuning(env: Env = process.env): KnowledgeTuning {
  return {
    topK: parsePositiveInt(val(env, 'ERXES_AGENT_KNOWLEDGE_TOPK'), 4),
    minScore: parseScore(val(env, 'ERXES_AGENT_KNOWLEDGE_MIN_SCORE'), 0.5),
    overfetch: parsePositiveInt(val(env, 'ERXES_AGENT_KNOWLEDGE_OVERFETCH'), 3),
  };
}

/** Cron pattern for the reconciliation sweep (BullMQ job scheduler). */
export function knowledgeSyncCron(env: Env = process.env): string {
  return val(env, 'ERXES_AGENT_KNOWLEDGE_SYNC_CRON') || DEFAULT_SYNC_CRON;
}

/**
 * Canonical tenant tag for Qdrant points and filters.
 *
 * In saas mode the request subdomain IS the org subdomain, so sweep (which
 * iterates orgs) and retrieval agree naturally. In non-saas there is exactly
 * one tenant but the request-derived label varies with the hostname
 * (localhost, app, erxes, ...), while background jobs have no request at all —
 * so both sides pin the erxes single-tenant convention, 'os'.
 */
export function knowledgeTenant(
  requestSubdomain: string | undefined,
  env: Env = process.env,
): string | undefined {
  if (val(env, 'VERSION') === 'saas') return requestSubdomain || undefined;
  return 'os';
}

/**
 * The read-only status surfaced in Settings. When disabled, every detail is
 * null. `qdrantReachable` is supplied by a live health check; pass undefined
 * when no check has run yet.
 */
export function computeKnowledgeStatus(
  env: Env = process.env,
  health?: { reachable: boolean | null },
): KnowledgeStatus {
  if (!isKnowledgeEnabled(env)) {
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
    collection: knowledgeCollectionName(emb.model, emb.dimension),
  };
}
