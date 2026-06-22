// ---------------------------------------------------------------------------
// Shared env-config helpers for the memory / knowledge / learning / scoring
// subsystems. Pure and injectable: every helper takes an `env` map so the
// logic is unit-testable without touching the real environment. Nothing here
// performs I/O.
// ---------------------------------------------------------------------------

import { trimEdgeChars } from '~/mastra/text';

export type Env = Record<string, string | undefined>;

/** Read one env var as trimmed text (absent → empty string). */
export function val(env: Env, key: string): string {
  return (env[key] ?? '').trim();
}

/** Parse a positive integer from env text, falling back to the default. */
export function parsePositiveInt(raw: string, def: number): number {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

/** Parse a 0..1 score from env text, falling back to the default. */
export function parseScore(raw: string, def: number): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : def;
}

/**
 * A Qdrant collection name derived from `prefix` + embedder model + dimension.
 * Encoding the dimension means switching embedders creates a NEW collection
 * instead of crashing on a vector-size mismatch against an old one.
 */
export function collectionName(
  prefix: string,
  model: string,
  dimension: number,
): string {
  const slug = model.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const trimmed = trimEdgeChars(slug, '_', '_');
  return `${prefix}_${trimmed}_${dimension}`;
}

/** A master switch that is on ONLY when `key` is exactly "enable" (trimmed). */
export function enabledBy(env: Env, key: string): boolean {
  return val(env, key) === 'enable';
}

/**
 * Canonical tenant tag. In saas mode the request subdomain IS the org
 * subdomain; in non-saas there is exactly one tenant pinned to 'os'.
 */
export function canonicalTenant(
  env: Env,
  requestSubdomain: string | undefined,
): string | undefined {
  if (val(env, 'VERSION') === 'saas') return requestSubdomain || undefined;
  return 'os';
}

/** The status fields shared by the memory / knowledge / learning subsystems. */
export interface VectorStatusCore {
  embedder: string;
  embedderModel: string;
  qdrantUrl: string;
  collection: string;
}

/**
 * The common {embedder, embedderModel, qdrantUrl, collection} core of an
 * enabled subsystem's status. Callers spread this into their own status object
 * and add their extras (enabled, qdrantReachable, tuning floors, ...).
 */
export function buildVectorStatus(
  prefix: string,
  embedder: { kind: string; model: string; dimension: number },
  url: string,
): VectorStatusCore {
  return {
    embedder: embedder.kind,
    embedderModel: embedder.model,
    qdrantUrl: url,
    collection: collectionName(prefix, embedder.model, embedder.dimension),
  };
}
