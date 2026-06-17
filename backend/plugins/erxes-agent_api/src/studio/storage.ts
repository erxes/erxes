/**
 * Studio instance storage = the SAME native Mastra-memory MongoDB the chat
 * runtime uses (src/mastra/memory/mastraMemory.ts → MongoDBStore on the
 * `erxes_mastra_memory` database). This lets Studio's global thread browser read
 * the native memory; per-agent history tabs read it via each agent's attached
 * getMastraMemory. No schema translation — it's Mastra-native end to end.
 */
import { MongoDBStore } from '@mastra/mongodb';

/** Mirror mastraMemory.ts::memoryDbName so Studio points at the same DB. */
function memoryDbName(): string {
  return (process.env.ERXES_AGENT_MEMORY_DB_PREFIX || 'erxes_mastra_memory')
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_');
}

// The observability domain backing the storage's list endpoints. MongoDBStore's
// ObservabilityMongoDB implements traces/spans but NOT logs or metrics, so those
// fall through to the base class which throws (HTTP 500 "This storage provider
// does not support listing logs"). Studio's Logs/Metrics tabs hit exactly those
// endpoints. We shim them to return an empty, schema-valid page so the tabs render
// "no data" instead of erroring — Studio is the only consumer of these reads.
interface ObservabilityListArg {
  mode?: string;
  limit?: number;
  pagination?: { page?: number; perPage?: number | false };
}
type EmptyListShape = 'logs' | 'metrics';

/** A schema-valid empty list response for the requested mode (page or delta). */
function emptyList(key: EmptyListShape, arg?: ObservabilityListArg) {
  const rows = { [key]: [] as unknown[] };
  if (arg?.mode === 'delta') {
    return { ...rows, delta: { limit: Number(arg.limit) || 100, hasMore: false } };
  }
  const perPage = arg?.pagination?.perPage ?? 100;
  const page = Number(arg?.pagination?.page ?? 0);
  return { ...rows, pagination: { total: 0, page, perPage, hasMore: false } };
}

/** Patch the unimplemented observability list reads so Studio's Logs/Metrics
 *  tabs return empty instead of 500. No-op if the domain shape ever changes. */
function shimObservabilityLists(store: MongoDBStore): void {
  const observability = (
    store as unknown as { stores?: { observability?: Record<string, unknown> } }
  ).stores?.observability;
  if (!observability) return;
  observability.listLogs = async (arg?: ObservabilityListArg) =>
    emptyList('logs', arg);
  observability.listMetrics = async (arg?: ObservabilityListArg) =>
    emptyList('metrics', arg);
}

let store: MongoDBStore | null = null;

export function studioStorage(): MongoDBStore {
  if (!store) {
    store = new MongoDBStore({
      id: 'erxes-studio',
      url: process.env.MONGO_URL || 'mongodb://localhost:27017',
      dbName: memoryDbName(),
    } as never);
    shimObservabilityLists(store);
  }
  return store;
}
