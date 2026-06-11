// ---------------------------------------------------------------------------
// Company Knowledge RAG — reconciliation sweep (registry-driven).
//
// Mongo (via gateway GraphQL) is the source of truth; Qdrant is a derived
// index. Each sweep computes the desired point set from every ENABLED
// content type, then converges Qdrant to it: upsert changed/new points,
// delete orphans — including all points of types that were disabled or
// records that were deleted/hidden since the last run. A periodic full
// reconciliation is the baseline sync — this repo has no MongoDB change
// streams — and also self-heals any missed update.
//
// One content type failing (plugin not enabled, query error) never blocks
// the others: its error is recorded per-type and its existing points are
// LEFT IN PLACE (a fetch failure must not be interpreted as "0 records").
// ---------------------------------------------------------------------------

import { generateModels } from '~/connectionResolvers';
import {
  resolveEmbedderConfig,
  knowledgeCollectionName,
  enabledKnowledgeTypes,
  knowledgeMaxPerType,
} from './config';
import { getEmbedder } from '~/mastra/memory/embedder';
import {
  ensureCollection,
  upsert,
  scroll,
  deletePoints,
  QdrantPoint,
} from '~/mastra/memory/vectorStore';
import { pointIdFor } from '~/mastra/memory/semanticRecall';
import {
  KNOWLEDGE_CONTENT_TYPES,
  ALL_KNOWLEDGE_TYPE_NAMES,
} from './contentTypes';
import { buildAuthHeaders, makeGqlExec } from './gatewayClient';

const EMBED_BATCH = 32;

// Bump when the point id/payload contract changes: new ids ≠ old ids, so the
// orphan pass cleanly rebuilds the corpus instead of leaving mixed payloads.
const POINT_SCHEMA_VERSION = 'v2';

export interface TypeSweepStatus {
  count: number;
  points: number;
  error?: string;
}

export interface SweepResult {
  ok: boolean;
  pointCount: number;
  upserted: number;
  deleted: number;
  types: Record<string, TypeSweepStatus>;
  error?: string;
}

interface DesiredPoint {
  id: string;
  contentType: string;
  recordId: string;
  chunkIndex: number;
  title: string;
  text: string;
  modifiedDate: string;
}

/**
 * One full reconciliation for one tenant. Returns a result instead of
 * throwing; the caller persists it to settings for the status UI.
 */
export async function runKnowledgeSweep(
  subdomain: string,
): Promise<SweepResult> {
  const result: SweepResult = {
    ok: false,
    pointCount: 0,
    upserted: 0,
    deleted: 0,
    types: {},
  };

  try {
    const models = await generateModels(subdomain);
    const settings = await models.MastraSettings.getSettings();
    const gql = makeGqlExec(
      settings.erxesApiUrl || 'http://localhost:4000',
      buildAuthHeaders({ apiToken: settings.erxesApiToken }),
    );

    const emb = resolveEmbedderConfig();
    const collection = knowledgeCollectionName(emb.model, emb.dimension);
    await ensureCollection(collection, emb.dimension);

    const enabled = enabledKnowledgeTypes(ALL_KNOWLEDGE_TYPE_NAMES);
    const maxPerType = knowledgeMaxPerType();

    // Desired state per enabled type. A failed type contributes NO desired
    // points and is excluded from orphan deletion below.
    const desired: DesiredPoint[] = [];
    const failedTypes = new Set<string>();

    for (const typeName of enabled) {
      const ct = KNOWLEDGE_CONTENT_TYPES[typeName];
      try {
        const records = await ct.list(gql, maxPerType);
        let points = 0;
        for (const rec of records) {
          for (const chunk of rec.chunks) {
            desired.push({
              id: pointIdFor(
                subdomain,
                `${POINT_SCHEMA_VERSION}:${typeName}:${rec._id}#${chunk.chunkIndex}`,
              ),
              contentType: typeName,
              recordId: rec._id,
              chunkIndex: chunk.chunkIndex,
              title: rec.title,
              text: chunk.text,
              modifiedDate: rec.modifiedDate,
            });
            points++;
          }
        }
        result.types[typeName] = { count: records.length, points };
      } catch (e) {
        failedTypes.add(typeName);
        result.types[typeName] = {
          count: 0,
          points: 0,
          error: e?.message || String(e),
        };
      }
    }
    result.pointCount = desired.length;

    // Current state in Qdrant for this tenant (every content type).
    const existing = await scroll(collection, {
      must: [{ key: 'subdomain', match: { value: subdomain } }],
    });
    const existingById = new Map(
      existing.map((p) => [String(p.id), p.payload]),
    );

    // Converge: embed+upsert changed points; delete orphans. Points belonging
    // to a type whose fetch FAILED this run are kept (unknown ≠ gone); points
    // of disabled types are orphaned and removed.
    const desiredIds = new Set(desired.map((d) => d.id));
    const stale = desired.filter((d) => {
      const cur = existingById.get(d.id);
      return !cur || cur.modifiedDate !== d.modifiedDate;
    });
    const orphanIds = existing
      .filter((p) => !desiredIds.has(String(p.id)))
      .filter((p) => !failedTypes.has(String(p.payload?.contentType)))
      .map((p) => String(p.id));

    if (stale.length) {
      const embedder = await getEmbedder(emb);
      for (let i = 0; i < stale.length; i += EMBED_BATCH) {
        const batch = stale.slice(i, i + EMBED_BATCH);
        const vectors = await embedder.embed(batch.map((p) => p.text));
        const points: QdrantPoint[] = batch.map((p, j) => ({
          id: p.id,
          vector: vectors[j],
          payload: {
            subdomain,
            contentType: p.contentType,
            recordId: p.recordId,
            chunkIndex: p.chunkIndex,
            title: p.title,
            text: p.text,
            modifiedDate: p.modifiedDate,
          },
        }));
        await upsert(collection, points);
        result.upserted += points.length;
      }
    }

    await deletePoints(collection, orphanIds);
    result.deleted = orphanIds.length;
    result.ok = true;

    const typeErrors = Object.entries(result.types)
      .filter(([, s]) => s.error)
      .map(([t, s]) => `${t}: ${s.error}`);
    if (typeErrors.length) result.error = typeErrors.join(' | ');
  } catch (e) {
    result.error = e?.message || String(e);
    // eslint-disable-next-line no-console
    console.error(
      `[erxes-agent:knowledge] sweep failed for "${subdomain}": ${result.error}`,
    );
  }

  // Persist status for the read-only Settings block. Best-effort.
  try {
    const models = await generateModels(subdomain);
    await models.MastraSettings.saveKnowledgeSyncStatus({
      lastSweepAt: new Date(),
      pointCount: result.pointCount,
      types: result.types,
      lastError: result.error ?? null,
    });
  } catch {
    // status persistence must never fail the sweep
  }

  return result;
}
