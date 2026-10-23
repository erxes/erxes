import type { ConnectorHandler } from '@mastra/mongodb' with {
  'resolution-mode': 'import',
};
import type { MastraMemory } from '@mastra/core/memory' with {
  'resolution-mode': 'import',
};
import type { Mastra } from '@mastra/core/mastra' with {
  'resolution-mode': 'import',
};
import type { DurableAgent } from '@mastra/core/agent/durable' with {
  'resolution-mode': 'import',
};
import type { Connection } from 'mongoose';
import { generateModels } from '~/connectionResolvers';
import { buildBaseAgentsAgent, AGENTS_MAX_STEPS } from '@/agents/agent';
import { getAgentsPubSub } from '@/agents/pubsub';
// MongoDB 4.4.25 compatible
import { installMongo44WorkflowCompatibility } from '@/agents/mongo44Compatibility';

/**
 * Tenant-scoped conversation persistence for the agents, built on Mastra's
 * Memory + MongoDBStore. Threads, messages, and their indexes live entirely
 * inside Mastra-owned collections in a dedicated agents sub-database; this
 * plugin defines no custom models for them.
 *
 * The store reuses the plugin's existing mongoose connection through the
 * library-sanctioned `connectorHandler` seam instead of re-reading MONGO_URL,
 * so there is exactly one Mongo client per process. Collections resolve
 * against a dedicated `{baseDb}_agents_memory` database (derived, not
 * read from env) so the agents' conversation data never collides with, or
 * is muddled by, the platform's own legacy Mastra collections. The
 * connection's lifecycle is owned by the platform (`erxes-api-shared/utils`
 * connect()), so `close()` is intentionally a no-op.
 */

const MONGODB_STORE_ID = 'core-agents-store';
/** Recent messages replayed into the prompt alongside the newest one. */
const LAST_MESSAGES_WINDOW = 20;

/**
 * Resolves the dedicated agents memory database off the shared connection.
 * Mongoose caches sub-connections by name, so calling this repeatedly is
 * cheap; it stays lazy because the connection may not be open at import time.
 */
const agentsMemoryDbName = (connection: Connection): string => {
  const base = connection.db?.databaseName;

  if (!base) {
    throw new Error('Mongoose connection is not open yet.');
  }

  return `${base}_agents_memory`;
};

/**
 * Structural bridge between mongoose's bundled driver and @mastra/mongodb's
 * bundled driver: both wrap a MongoDB deployment but ship different major
 * versions of the `Collection` typings, so the shared connection's collection
 * handle passes through one explicit, narrow cast at this boundary.
 */
const createConnectorHandler = (connection: Connection): ConnectorHandler => ({
  getCollection: async (collectionName) => {
    const subDb = connection.useDb(agentsMemoryDbName(connection), {
      useCache: true,
      noListener: true,
    });
    const db = subDb.db;

    if (!db) {
      throw new Error('Agents memory database is not connected yet.');
    }

    return db.collection(collectionName) as unknown as Awaited<
      ReturnType<ConnectorHandler['getCollection']>
    >;
  },
  close: async () => {
    // Intentional no-op: the platform owns the shared connection lifecycle.
  },
});

/**
 * The per-tenant agents runtime bundle: conversation memory, a minimal
 * Mastra instance sharing the same MongoDBStore, and one stable native
 * DurableAgent registered under the id `agents`.
 *
 * The DurableAgent wraps a base Agent whose dynamic model callback
 * re-fetches the acting user's BYOK credentials server-side from the
 * RequestContext snapshot (subdomain/userId/provider/model). This makes
 * the wrapper actually attached and the workflow registered, so durable
 * suspend/resume works across requests and restarts without per-request
 * agent creation leaks.
 */
export interface IAgentsRuntime {
  memory: MastraMemory;
  mastra: Mastra;
  agent: DurableAgent;
}

const createAgentsRuntime = async (subdomain: string): Promise<IAgentsRuntime> => {
  const models = await generateModels(subdomain);
  const connection = models.Users.db;
  // All packages are loaded dynamically from CommonJS like the other
  // ESM-only Mastra entries used by this plugin.
  const [{ MongoDBStore }, { Memory }, { Mastra }, { createDurableAgent }] =
    await Promise.all([
      import('@mastra/mongodb'),
      import('@mastra/memory'),
      import('@mastra/core/mastra'),
      import('@mastra/core/agent/durable'),
    ]);

  // The process-wide Redis Streams bus is shared by every tenant runtime:
  // stream events for a run publish to Redis, so `observe(runId)` replays
  // them from any replica or process — not just the one driving the run.
  // The same instance is reused (never closed per tenant); its lifecycle
  // belongs to the process.
  const pubsub = await getAgentsPubSub();

  const storage = new MongoDBStore({
    id: MONGODB_STORE_ID,
    connectorHandler: createConnectorHandler(connection),
  });

  // MongoDB 4.4.25 compatible
  // Remove with mongo44Compatibility.ts only after encoded runs have drained.
  if (!storage.stores.workflows) {
    throw new Error('Agents workflow storage is unavailable.');
  }
  installMongo44WorkflowCompatibility(storage.stores.workflows);

  // Library-driven conversation memory. `generateTitle: true` makes Mastra
  // derive a thread title from the first user message asynchronously (agent
  // model, no response-time cost); semantic recall stays off until retrieval
  // features are added because it needs an embedder/vector store.
  const memory = new Memory({
    storage,
    options: {
      lastMessages: LAST_MESSAGES_WINDOW,
      generateTitle: true,
    },
  });

  // Build the base agent once. Its dynamic model callback reads
  // provider/model/thinking/codeMode from the per-run RequestContext and
  // re-fetches current BYOK credentials server-side, so the same agent
  // instance serves every request for this tenant.
  const baseAgent = await buildBaseAgentsAgent({ memory });

  // Wrap with durable execution capabilities. maxSteps matches the
  // per-request budget previously passed only at stream time.
  const durableAgent = createDurableAgent({
    agent: baseAgent,
    maxSteps: AGENTS_MAX_STEPS,
    // Reconnect and concurrent-turn guards discover runs through workflow
    // storage. Mastra's default skips running snapshots with recovery off,
    // making an executing run invisible after the browser changes sessions.
    // Persist terminal states too so a finished run never remains "running".
    shouldPersistSnapshot: () => true,
    // Keep a short terminal replay window, then delete both Redis topics.
    // The bus's atomic idle TTL also bounds leftovers after crashes/errors.
    cleanupTimeoutMs: 30_000,
  });

  // Minimal Mastra instance: registers the durable agent so its workflow
  // is persisted to the same dedicated agents sub-database through the
  // shared store's workflows domain. The shared Redis Streams bus carries
  // live stream events across replicas/processes for `observe` reconnects.
  // No workers, no logging: `stream`/`resume`/`observe` drive the workflow
  // in-process via `run.start()` with direct pubsub subscriptions, so no
  // orchestration worker is required — and one Mastra instance exists per
  // tenant, so enabling workers would start duplicate schedulers. Do not
  // enable workers without re-verifying the need.
  const mastra = new Mastra({
    storage,
    agents: { agents: durableAgent },
    logger: false,
    workers: false,
    pubsub,
  });

  return { memory, mastra, agent: durableAgent };
};

// One runtime bundle (and therefore one store/init cycle) per subdomain per
// process. Pending promises are cached so concurrent requests cannot
// double-run store initialization; failed creations are evicted so the next
// request retries.
const runtimeCache = new Map<string, Promise<IAgentsRuntime>>();

export const getAgentsRuntime = async (
  subdomain: string,
): Promise<IAgentsRuntime> => {
  const cached = runtimeCache.get(subdomain);

  if (cached) {
    return cached;
  }

  const creation = createAgentsRuntime(subdomain);

  runtimeCache.set(subdomain, creation);

  try {
    return await creation;
  } catch (error) {
    runtimeCache.delete(subdomain);

    throw error;
  }
};

export const getAgentsMemory = async (
  subdomain: string,
): Promise<MastraMemory> => {
  const runtime = await getAgentsRuntime(subdomain);

  return runtime.memory;
};
