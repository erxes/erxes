// ---------------------------------------------------------------------------
// Agent Knowledge = ONE native Mastra dataset, "Agent Knowledge (erxes)", stored
// in the SAME erxes_mastra_memory Mongo that Mastra Studio reads. It is the
// single source of truth for what the agent has been taught: a 👍 on a reply
// writes that turn straight in as a dataset item; removing the 👍 (or a 👎) takes
// it back out. No separate live-compute view and no materialize/sync step — the
// dataset IS the store, read directly by both this plugin's UI and Studio →
// Datasets (for Experiments). See docs/LANGFUSE-EVAL-HANDOFF.md §9
// (curate → measure → apply).
// ---------------------------------------------------------------------------
import { getMastraStore } from '~/mastra/memory/mastraMemory';
import { getOwnedThreadMessages } from '@/session/nativeStore';

const DATASET_NAME = 'Agent Knowledge (erxes)';
const DATASET_DESCRIPTION =
  'Human-approved (👍) erxes-agent conversations. Each item pairs the user ' +
  'question (input) with the approved answer (groundTruth). The single source of ' +
  'truth for agent knowledge — written live from chat feedback, read by the Agent ' +
  'Knowledge page and Studio → Experiments.';

// Minimal structural view of MongoDBStore.stores.datasets (MongoDBDatasetsStorage).
// The plugin imports Mastra via CJS without full types, so we describe only the
// methods we call. Contract: @mastra/core storage/domains/datasets/base.
interface DatasetRecord {
  id: string;
  name: string;
}
interface ItemMeta {
  threadId?: string;
  messageId?: string;
  rating?: number;
  comment?: string;
}
interface DatasetItemRecord {
  id: string;
  input?: unknown;
  groundTruth?: unknown;
  metadata?: ItemMeta | null;
  createdAt?: Date | string;
}
interface DatasetsStore {
  init?: () => Promise<void>;
  listDatasets: (a: {
    pagination: { page: number; perPage: number | false };
  }) => Promise<{ datasets: DatasetRecord[] }>;
  createDataset: (i: {
    name: string;
    description?: string;
  }) => Promise<DatasetRecord>;
  listItems: (a: {
    datasetId: string;
    pagination: { page: number; perPage: number | false };
  }) => Promise<{ items: DatasetItemRecord[] }>;
  addItem: (i: {
    datasetId: string;
    input: unknown;
    groundTruth?: unknown;
    metadata?: Record<string, unknown>;
    source?: { type: 'trace'; referenceId?: string };
  }) => Promise<DatasetItemRecord>;
  deleteItem: (a: { id: string; datasetId: string }) => Promise<void>;
}

async function getDatasetsStore(subdomain: string): Promise<DatasetsStore> {
  const store = (await getMastraStore(subdomain)) as unknown as {
    stores?: { datasets?: DatasetsStore };
  };
  const datasets = store.stores?.datasets;
  if (!datasets) {
    throw new Error(
      'Mastra datasets storage is unavailable (native memory store not ' +
        'initialized). Set ERXES_AGENT_MEMORY=enable.',
    );
  }
  return datasets;
}

/** Find-or-create the single Agent Knowledge dataset. */
async function ensureDataset(datasets: DatasetsStore): Promise<DatasetRecord> {
  try {
    await datasets.init?.();
  } catch {
    /* indexes are an optimization; collections auto-create on first write */
  }
  const { datasets: existing } = await datasets.listDatasets({
    pagination: { page: 1, perPage: false },
  });
  return (
    existing.find((d) => d.name === DATASET_NAME) ??
    (await datasets.createDataset({
      name: DATASET_NAME,
      description: DATASET_DESCRIPTION,
    }))
  );
}

export interface KnowledgeItem {
  /** Stable id for table rows (the rated assistant message id). */
  _id: string;
  input: string;
  groundTruth: string;
  threadId?: string;
  messageId?: string;
  comment?: string;
  createdAt?: string;
}

/** Read the single-source dataset for the UI (most recent first). */
export async function listKnowledge(
  subdomain: string,
  limit = 500,
): Promise<KnowledgeItem[]> {
  const datasets = await getDatasetsStore(subdomain);
  const dataset = await ensureDataset(datasets);
  const { items } = await datasets.listItems({
    datasetId: dataset.id,
    pagination: { page: 1, perPage: false },
  });
  return items.slice(0, limit).map((it) => ({
    _id: it.metadata?.messageId ?? it.id,
    input: String(it.input ?? ''),
    groundTruth: String(it.groundTruth ?? ''),
    threadId: it.metadata?.threadId,
    messageId: it.metadata?.messageId,
    comment: it.metadata?.comment,
    createdAt:
      it.createdAt instanceof Date
        ? it.createdAt.toISOString()
        : it.createdAt
          ? String(it.createdAt)
          : undefined,
  }));
}

/**
 * Keep the dataset in lock-step with one vote. 👍 (rating === 1) upserts the
 * turn as a dataset item; anything else removes it. Best-effort — a missing or
 * un-owned thread/message just no-ops, never throws to the caller.
 */
export async function recordKnowledgeFromFeedback(args: {
  subdomain: string;
  userId: string;
  threadId: string;
  messageId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const datasets = await getDatasetsStore(args.subdomain);
  const dataset = await ensureDataset(datasets);

  const { items } = await datasets.listItems({
    datasetId: dataset.id,
    pagination: { page: 1, perPage: false },
  });
  const existing = items.find((it) => it.metadata?.messageId === args.messageId);

  // Not a 👍 → ensure the turn is NOT in the knowledge dataset.
  if (args.rating !== 1) {
    if (existing) await datasets.deleteItem({ id: existing.id, datasetId: dataset.id });
    return;
  }
  if (existing) return; // already approved & stored

  // Pair the rated assistant message with the user message just before it.
  const msgs = await getOwnedThreadMessages(
    args.subdomain,
    args.userId,
    args.threadId,
  );
  const idx = msgs.findIndex((m) => m._id === args.messageId);
  if (idx < 0) return;
  const assistant = msgs[idx];
  const user = [...msgs.slice(0, idx)].reverse().find((m) => m.role === 'user');
  if (!user?.content || !assistant?.content) return;

  await datasets.addItem({
    datasetId: dataset.id,
    input: user.content,
    groundTruth: assistant.content,
    metadata: {
      threadId: args.threadId,
      messageId: args.messageId,
      rating: 1,
      ...(args.comment ? { comment: args.comment } : {}),
    },
    source: { type: 'trace', referenceId: args.messageId },
  });
}
