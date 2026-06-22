// ---------------------------------------------------------------------------
// Mastra Memory — semantic recall + working memory backed by one shared Mongo
// DB (records) and Qdrant (vectors), with a local fastembed embedder.
//
// Replaces the custom recall/working-memory implementation for the chat path.
// A SINGLE Memory instance is shared across tenants, on the app's own Mongo
// connection (MONGO_URL) in a dedicated database. Mastra uses a fixed set of
// memory collections (threads/messages/resources/observational), so one shared
// database keeps the footprint at ~4 collections total instead of multiplying
// the full MongoDBStore system schema per tenant (which trips the Atlas
// shared-tier 500-collection cap). Tenant isolation is enforced by the
// tenant-prefixed resourceId (see scopedResource) — semantic recall and
// resource-scoped working memory both filter by that resource, so tenant A
// never reads tenant B. ToolCallFilter is NOT configured here — in
// @mastra/memory 1.20.3 it lives on the Agent's inputProcessors
// (Memory({ processors }) was removed); agentRuntime attaches it.
// ---------------------------------------------------------------------------
import { Memory } from '@mastra/memory';
import { MongoDBStore } from '@mastra/mongodb';
import { QdrantVector } from '@mastra/qdrant';
import { getEmbedder } from './embedder';
import { resolveRecallTuning, qdrantUrl } from './config';
import { TITLER_INSTRUCTIONS } from '~/mastra/titler';

// Memory storage shares the app's Mongo connection (MONGO_URL). Mastra's
// MongoDBStore provisions its collections in a dedicated database on that same
// cluster (memoryDbName), so there is a single Mongo to operate.
const MONGO_URL = () => process.env.MONGO_URL || 'mongodb://localhost:27017';

/** The single shared Mastra-memory database name. */
function memoryDbName(): string {
  const name = (
    process.env.ERXES_AGENT_MEMORY_DB_PREFIX || 'erxes_mastra_memory'
  ).trim();
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

// fastembed → a MastraEmbeddingModel (AI SDK v2 embedding model).
let _embeddingModel: unknown | null = null;
/** Build (once, cached) the fastembed-backed embedding model Memory uses. */
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

let _shared: Memory | null = null;
let _store: MongoDBStore | null = null;
let _building: Promise<Memory> | null = null;

/**
 * The shared Mastra Memory (cached). `subdomain` is accepted for call-site
 * symmetry but does not select the instance — isolation is by resourceId
 * (see scopedResource), so a single instance serves every tenant.
 */
export async function getMastraMemory(_subdomain?: string): Promise<Memory> {
  if (_shared) return _shared;
  if (_building) return _building;

  _building = (async () => {
    const embedder = await getEmbeddingModel();
    const tuning = resolveRecallTuning();

    const storage = new MongoDBStore({
      id: 'erxes-agent-memory',
      url: MONGO_URL(),
      dbName: memoryDbName(),
    } as never);
    _store = storage;

    const vector = new QdrantVector({
      id: 'erxes-agent-memory',
      url: qdrantUrl(),
      // Client/server minor-version skew otherwise logs a noisy warning per call.
      checkCompatibility: false,
    } as never);

    const memory = new Memory({
      storage,
      vector,
      embedder: embedder as never,
      options: {
        // Mastra owns recent-history replay + semantic recall + working memory
        // for this turn — and the thread/message records ARE the chat store the
        // UI reads (via session/nativeStore.ts). There is no separate store.
        lastMessages: 12,
        semanticRecall: {
          topK: tuning.topK,
          messageRange: 2,
          scope: tuning.scope,
        },
        // Resource-scoped working memory: a per-user record (Markdown template)
        // that persists across the user's threads. It is stored as a field on
        // the resource document in the fixed `mastra_resources` collection
        // (updateResource) — one row per user, NOT a collection per user — so it
        // adds no collections and is safe on the shared DB.
        workingMemory: { enabled: true, scope: 'resource' },
        // Native thread titling. Mastra fills thread.title ONCE (only while it
        // is empty; it never refreshes) using the agent's OWN model and erxes's
        // multilingual TITLER instructions. `model` is intentionally omitted:
        // the runtime's title path (genTitle → getLLM) falls back to the calling
        // agent's model when none is given, so there is no per-tenant model to
        // resolve on the shared instance. (The published type marks `model`
        // required; the surrounding `as never` cast covers the omission.)
        generateTitle: { instructions: TITLER_INSTRUCTIONS },
      },
    } as never);

    _shared = memory;
    return memory;
  })();

  try {
    return await _building;
  } finally {
    _building = null;
  }
}

/**
 * The shared Mastra memory STORE (MongoDBStore on erxes_mastra_memory). Built
 * alongside the Memory instance; exposed so the chat read layer can reach
 * storage-domain methods Memory doesn't surface (e.g. listMessagesById for
 * message-id feedback lookup). Ensures the Memory is built first.
 */
export async function getMastraStore(subdomain?: string): Promise<MongoDBStore> {
  await getMastraMemory(subdomain);
  if (!_store) throw new Error('Mastra memory store not initialized');
  return _store;
}

/** Tenant-scoped resource id so a shared Qdrant collection stays isolated. */
export function scopedResource(subdomain: string, resourceId: string): string {
  return `${(subdomain || 'os').trim() || 'os'}:${resourceId}`;
}

/** Drop the cached instance (tests / config changes). */
export function resetMastraMemoryCache(): void {
  _shared = null;
  _store = null;
  _building = null;
}
