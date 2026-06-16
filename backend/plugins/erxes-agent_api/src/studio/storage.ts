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

let store: MongoDBStore | null = null;

export function studioStorage(): MongoDBStore {
  if (!store) {
    store = new MongoDBStore({
      id: 'erxes-studio',
      url: process.env.MONGO_URL || 'mongodb://localhost:27017',
      dbName: memoryDbName(),
    } as never);
  }
  return store;
}
