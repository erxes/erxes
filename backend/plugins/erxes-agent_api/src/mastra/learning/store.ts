// ---------------------------------------------------------------------------
// Agent Learning — Qdrant store for distilled learnings.
//
// One point per learning, payload-tagged with {subdomain, learningId, status,
// type, agentId}. Retrieval ALWAYS filters on subdomain (tenant isolation,
// fail-closed) and status=approved — candidates and rejected lessons are
// never visible to a live agent turn.
// ---------------------------------------------------------------------------

import { createHash } from 'crypto';
import { ExpectedError } from 'erxes-api-shared/utils';
import {
  isLearningEnabled,
  learningCollectionName,
  resolveEmbedderConfig,
  resolveLearningTuning,
} from './config';
import { getEmbedder } from '~/mastra/memory/embedder';
import {
  ensureCollection,
  upsert,
  search,
  setPayload,
  deletePoints,
  SearchHit,
} from '~/mastra/memory/vectorStore';
import { IMastraLearningDocument } from '@/learning/@types/learning';

/** Deterministic UUID-shaped point id from the learning id (idempotent upserts). */
export function learningPointId(subdomain: string, learningId: string): string {
  const hex = createHash('sha256')
    .update(`learning:${subdomain}:${learningId}`)
    .digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16,
  )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// One Qdrant filter condition ({key, match} clauses).
type QdrantCondition = Record<string, unknown>;

/** Tenant-scoped filter — refuses to build one without a subdomain. */
export function buildLearningFilter(args: {
  subdomain: string;
  statuses?: string[];
}): { must: QdrantCondition[] } {
  if (!args.subdomain) {
    throw new ExpectedError(
      '[mastra:learning] refusing to query Qdrant without a subdomain (tenant isolation).',
    );
  }
  const must: QdrantCondition[] = [
    { key: 'subdomain', match: { value: args.subdomain } },
  ];
  if (args.statuses?.length) {
    must.push({ key: 'status', match: { any: args.statuses } });
  }
  return { must };
}

/** Resolve the learnings collection name + dimension from the embedder. */
function collection(): { name: string; dimension: number } {
  const emb = resolveEmbedderConfig();
  return {
    name: learningCollectionName(emb.model, emb.dimension),
    dimension: emb.dimension,
  };
}

/** Create the learnings collection if absent (idempotent). */
export async function ensureLearningCollection(): Promise<void> {
  const { name, dimension } = collection();
  await ensureCollection(name, dimension);
}

/** Embed + upsert one learning (create or statement edit). Throws on failure. */
export async function indexLearning(
  subdomain: string,
  learning: IMastraLearningDocument,
): Promise<void> {
  const { name } = collection();
  const embedder = await getEmbedder();
  const [vector] = await embedder.embed([learning.statement]);
  if (!vector) throw new Error('embedding produced no vector');

  await upsert(name, [
    {
      id: learningPointId(subdomain, String(learning._id)),
      vector,
      payload: {
        subdomain,
        learningId: String(learning._id),
        status: learning.status,
        type: learning.type,
        agentId: learning.agentId || null,
        statement: learning.statement,
      },
    },
  ]);
}

/** Status flip without re-embedding (approve / reject / archive). */
export async function setLearningVectorStatus(
  subdomain: string,
  learningId: string,
  status: string,
): Promise<void> {
  const { name } = collection();
  await setPayload(name, [learningPointId(subdomain, learningId)], { status });
}

/** Remove a learning's vector point (hard delete). */
export async function deleteLearningVector(
  subdomain: string,
  learningId: string,
): Promise<void> {
  const { name } = collection();
  await deletePoints(name, [learningPointId(subdomain, learningId)]);
}

export interface LearningHit {
  learningId: string;
  statement: string;
  type: string;
  score: number;
}

/**
 * Semantic search over the tenant's learnings. Defaults to approved-only —
 * the dedupe path widens to candidates so a re-derived candidate merges
 * instead of duplicating.
 */
export async function searchLearnings(
  subdomain: string,
  query: string,
  opts?: { topK?: number; minScore?: number; statuses?: string[] },
): Promise<LearningHit[]> {
  const tuning = resolveLearningTuning();
  const { name } = collection();
  const embedder = await getEmbedder();
  const [vector] = await embedder.embed([query]);
  if (!vector) return [];

  const hits = await search(name, vector, {
    topK: opts?.topK ?? tuning.topK,
    filter: buildLearningFilter({
      subdomain,
      statuses: opts?.statuses ?? ['approved'],
    }),
  });

  return hits
    .filter(
      (hit: SearchHit) => hit.score >= (opts?.minScore ?? tuning.minScore),
    )
    .map((hit: SearchHit) => ({
      learningId: String(hit.payload.learningId || ''),
      statement: String(hit.payload.statement || ''),
      type: String(hit.payload.type || ''),
      score: hit.score,
    }));
}

// ── Best-effort wrappers for GraphQL resolvers ───────────────────────────────
// Curation actions must succeed even when Qdrant is down; the sweep's
// reconciliation pass will converge the index later.

/** Best-effort re-embed + upsert; never throws (sweep reconciles later). */
export async function syncLearningVectorSafe(
  subdomain: string | undefined,
  learning: IMastraLearningDocument,
): Promise<void> {
  if (!isLearningEnabled() || !subdomain) return;
  try {
    await indexLearning(subdomain, learning);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[mastra:learning] vector sync skipped: ${e?.message || e}`);
  }
}

/** Best-effort status flip on the vector payload; never throws. */
export async function setLearningVectorStatusSafe(
  subdomain: string | undefined,
  learningId: string,
  status: string,
): Promise<void> {
  if (!isLearningEnabled() || !subdomain) return;
  try {
    await setLearningVectorStatus(subdomain, learningId, status);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      `[mastra:learning] vector status sync skipped: ${e?.message || e}`,
    );
  }
}

/** Best-effort vector delete; never throws. */
export async function deleteLearningVectorSafe(
  subdomain: string | undefined,
  learningId: string,
): Promise<void> {
  if (!isLearningEnabled() || !subdomain) return;
  try {
    await deleteLearningVector(subdomain, learningId);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[mastra:learning] vector delete skipped: ${e?.message || e}`);
  }
}
