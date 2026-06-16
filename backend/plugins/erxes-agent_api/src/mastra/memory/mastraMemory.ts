// ---------------------------------------------------------------------------
// Mastra Memory — semantic recall + working memory backed by the tenant's Mongo
// DB (records) and Qdrant (vectors), with a local fastembed embedder.
//
// Replaces the custom recall/working-memory implementation for the chat path.
// One Memory instance per tenant, cached. Storage lands in the tenant's own
// Mongo database (same per-tenant isolation the workflow runtime uses); vectors
// go to Qdrant, scoped by a tenant-prefixed resourceId. ToolCallFilter is NOT
// configured here — in @mastra/memory 1.20.3 it lives on the Agent's
// inputProcessors (Memory({ processors }) was removed); agentRuntime attaches it.
// ---------------------------------------------------------------------------
import { Memory } from '@mastra/memory';
import { MongoDBStore } from '@mastra/mongodb';
import { QdrantVector } from '@mastra/qdrant';
import { getEmbedder } from './embedder';
import { resolveRecallTuning } from './config';

const QDRANT_URL = () =>
  process.env.ERXES_AGENT_QDRANT_URL || 'http://localhost:6333';
const MONGO_URL = () => process.env.MONGO_URL || 'mongodb://localhost:27017';

/** Tenant → its dedicated Mastra-memory database name. */
function memoryDbName(tenant: string): string {
  const prefix = (
    process.env.ERXES_AGENT_MEMORY_DB_PREFIX || 'erxes_mastra_memory'
  ).trim();
  return `${prefix}_${tenant}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

// fastembed → a MastraEmbeddingModel (AI SDK v2 embedding model). Verified in
// scripts/spike-memory.ts. The embedder + its wrapper are both cached.
let _embeddingModel: unknown | null = null;
async function getEmbeddingModel(): Promise<unknown> {
  if (_embeddingModel) return _embeddingModel;
  const fe = await getEmbedder();
  _embeddingModel = {
    specificationVersion: 'v2',
    provider: 'fastembed',
    modelId: 'erxes-embedder',
    maxEmbeddingsPerCall: 256,
    supportsParallelCalls: false,
    async doEmbed({ values }: { values: string[] }) {
      return { embeddings: await fe.embed(values) };
    },
  };
  return _embeddingModel;
}

const _byTenant = new Map<string, Memory>();

/**
 * The tenant's Mastra Memory (cached). `subdomain` is the tenant key; falls back
 * to 'os' so background/non-request callers still get a stable instance.
 */
export async function getMastraMemory(subdomain?: string): Promise<Memory> {
  const tenant = (subdomain || 'os').trim() || 'os';
  const hit = _byTenant.get(tenant);
  if (hit) return hit;

  const embedder = await getEmbeddingModel();
  const tuning = resolveRecallTuning();

  const storage = new MongoDBStore({
    id: `erxes-agent-memory-${tenant}`,
    url: MONGO_URL(),
    dbName: memoryDbName(tenant),
  } as never);

  const vector = new QdrantVector({
    id: `erxes-agent-memory-${tenant}`,
    url: QDRANT_URL(),
    // Client/server minor-version skew otherwise logs a noisy warning per call.
    checkCompatibility: false,
  } as never);

  const memory = new Memory({
    storage,
    vector,
    embedder: embedder as never,
    options: {
      // Mastra owns recent-history replay + semantic recall + working memory for
      // this turn. (The erxes MastraMessage store stays the UI source of truth;
      // the chat pipeline stops manually replaying history when memory is active.)
      lastMessages: 12,
      semanticRecall: {
        topK: tuning.topK,
        messageRange: 2,
        scope: tuning.scope,
      },
      // Working memory is off for now: in @mastra/memory 1.20.3 it runs as an
      // output-processor *workflow* that creates extra storage collections,
      // which trips the Atlas shared-tier 500-collection cap ("already using 501
      // collections of 500"). Semantic recall alone provides cross-session
      // memory; revisit working memory once the collection footprint is sorted.
      workingMemory: { enabled: false },
    },
  } as never);

  _byTenant.set(tenant, memory);
  return memory;
}

/** Tenant-scoped resource id so a shared Qdrant collection stays isolated. */
export function scopedResource(subdomain: string, resourceId: string): string {
  return `${(subdomain || 'os').trim() || 'os'}:${resourceId}`;
}

/** Drop cached instances (tests / config changes). */
export function resetMastraMemoryCache(): void {
  _byTenant.clear();
}
