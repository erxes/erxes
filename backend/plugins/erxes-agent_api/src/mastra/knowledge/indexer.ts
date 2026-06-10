// ---------------------------------------------------------------------------
// Company Knowledge RAG — reconciliation sweep.
//
// Mongo (via gateway GraphQL) is the source of truth; Qdrant is a derived
// index. Each sweep computes the desired point set from published+public
// articles, then converges Qdrant to it: upsert changed/new points, delete
// orphans (articles deleted, unpublished, or made private since last sweep).
// A periodic full reconciliation is the baseline sync — this repo has no
// MongoDB change streams — and also self-heals any missed update.
// ---------------------------------------------------------------------------

import { generateModels } from '~/connectionResolvers';
import { resolveEmbedderConfig, knowledgeCollectionName } from './config';
import { getEmbedder } from '~/mastra/memory/embedder';
import {
  ensureCollection,
  upsert,
  scroll,
  deletePoints,
  QdrantPoint,
} from '~/mastra/memory/vectorStore';
import { pointIdFor } from '~/mastra/memory/semanticRecall';
import { articleToChunks } from './serializer';
import { buildAuthHeaders, fetchPublishedArticles, KbArticle } from './gatewayClient';

export const KNOWLEDGE_CONTENT_TYPE = 'kb-article';

const EMBED_BATCH = 32;

export interface SweepResult {
  ok: boolean;
  articleCount: number;
  pointCount: number;
  upserted: number;
  deleted: number;
  error?: string;
}

interface DesiredPoint {
  id: string;
  articleId: string;
  chunkIndex: number;
  title: string;
  text: string;
  categoryId?: string;
  topicId?: string;
  modifiedDate: string;
}

function desiredPointsFor(subdomain: string, articles: KbArticle[]): DesiredPoint[] {
  const out: DesiredPoint[] = [];
  for (const article of articles) {
    const modifiedDate = article.modifiedDate
      ? new Date(article.modifiedDate).toISOString()
      : '';
    for (const chunk of articleToChunks(article)) {
      out.push({
        id: pointIdFor(subdomain, `${article._id}#${chunk.chunkIndex}`),
        articleId: article._id,
        chunkIndex: chunk.chunkIndex,
        title: article.title || '',
        text: chunk.text,
        categoryId: article.categoryId,
        topicId: article.topicId,
        modifiedDate,
      });
    }
  }
  return out;
}

/**
 * One full reconciliation for one tenant. Returns a result instead of
 * throwing; the caller persists it to settings for the status UI.
 */
export async function runKnowledgeSweep(subdomain: string): Promise<SweepResult> {
  const result: SweepResult = {
    ok: false,
    articleCount: 0,
    pointCount: 0,
    upserted: 0,
    deleted: 0,
  };

  try {
    const models = await generateModels(subdomain);
    const settings = await models.MastraSettings.getSettings();
    const headers = buildAuthHeaders({ apiToken: settings.erxesApiToken });
    const apiUrl = settings.erxesApiUrl || 'http://localhost:4000';

    const emb = resolveEmbedderConfig();
    const collection = knowledgeCollectionName(emb.model, emb.dimension);
    await ensureCollection(collection, emb.dimension);

    // Desired state from the source of truth.
    const articles = await fetchPublishedArticles(apiUrl, headers);
    const desired = desiredPointsFor(subdomain, articles);
    result.articleCount = articles.length;
    result.pointCount = desired.length;

    // Current state in Qdrant for this tenant + content type.
    const existing = await scroll(collection, {
      must: [
        { key: 'subdomain', match: { value: subdomain } },
        { key: 'contentType', match: { value: KNOWLEDGE_CONTENT_TYPE } },
      ],
    });
    const existingById = new Map(existing.map((p) => [String(p.id), p.payload]));

    // Converge: embed+upsert points whose content version changed, delete orphans.
    const desiredIds = new Set(desired.map((d) => d.id));
    const stale = desired.filter((d) => {
      const cur = existingById.get(d.id);
      return !cur || cur.modifiedDate !== d.modifiedDate;
    });
    const orphanIds = existing
      .map((p) => String(p.id))
      .filter((id) => !desiredIds.has(id));

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
            contentType: KNOWLEDGE_CONTENT_TYPE,
            articleId: p.articleId,
            chunkIndex: p.chunkIndex,
            title: p.title,
            text: p.text,
            categoryId: p.categoryId ?? null,
            topicId: p.topicId ?? null,
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
  } catch (e: any) {
    result.error = e?.message || String(e);
    // eslint-disable-next-line no-console
    console.error(`[erxes-agent:knowledge] sweep failed for "${subdomain}": ${result.error}`);
  }

  // Persist status for the read-only Settings block. Best-effort.
  try {
    const models = await generateModels(subdomain);
    await models.MastraSettings.saveKnowledgeSyncStatus({
      lastSweepAt: new Date(),
      articleCount: result.articleCount,
      pointCount: result.pointCount,
      lastError: result.error ?? null,
    });
  } catch {
    // status persistence must never fail the sweep
  }

  return result;
}
