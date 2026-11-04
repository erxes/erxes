const int = (name: string, fallback: number) =>
  Number(process.env[name]) || fallback;

// `erxes-ext dev`: a version may be reinstalled with a different build, and
// UI files are served uncached. main.ts refuses it in production.
export const DEV_MODE = process.env.EXT_DEV_MODE === 'true';

const KB = 1024;
const MB = 1024 * KB;

// Every bound the runtime enforces, in one place.
export const LIMITS = {
  // Wall clock for one root field's sandbox call. OSS workerd ignores CPU limits, so this
  // is the only limit on runaway code.
  runTimeoutMs: int('EXT_RUN_TIMEOUT_MS', 5000),
  // One GraphQL operation through the gateway. Also cut to what's left of the
  // run, so an upstream call never outlives the run that made it.
  upstreamTimeoutMs: int('EXT_UPSTREAM_TIMEOUT_MS', 4000),
  // GraphQL operations one build may ship.
  maxOperations: 200,
  // workerd keeps every loaded worker in memory. `erxes-ext build` refuses
  // bigger builds, and install refuses them again.
  workerBytes: 300 * KB,
  // Request bodies.
  inputBytes: int('EXT_MAX_INPUT_BYTES', 256 * KB),
  installBytes: int('EXT_MAX_INSTALL_BYTES', 16 * MB),
  hostDbRequestBytes: int('EXT_MAX_DB_REQUEST_BYTES', MB),
  // Serialized results: what one root field returns, and what one db call
  // returns to the worker.
  resultBytes: int('EXT_MAX_RESULT_BYTES', MB),
  dbResultBytes: int('EXT_MAX_DB_RESULT_BYTES', MB),
  // find's limit when none is given, and the most it may ask for.
  findLimit: 500,
  // Documents one insertMany, and operations one bulkWrite, may carry.
  bulkMaxOps: 500,
  // One GraphQL request to an extension: selection depth, and root fields
  // (each one sandbox call), aliases and fragments counted.
  graphqlMaxDepth: int('EXT_GRAPHQL_MAX_DEPTH', 10),
  graphqlMaxRootFields: int('EXT_GRAPHQL_MAX_ROOT_FIELDS', 10),
  graphqlMaxTokens: int('EXT_GRAPHQL_MAX_TOKENS', 2000),
  // What one install may declare, and how long activation may spend building
  // its indexes in total.
  maxCollections: 20,
  maxIndexes: 20,
  indexBuildMs: int('EXT_INDEX_BUILD_MS', 30_000),
  // Server-side time limit for one Mongo query, so a slow $regex can't hold
  // a connection.
  dbMaxTimeMs: 2000,
  // Calls running at once, per tenant and in total.
  tenantConcurrency: int('EXT_TENANT_CONCURRENCY', 8),
  globalConcurrency: int('EXT_GLOBAL_CONCURRENCY', 64),
  // workerd processes. Each serves one tenant at a time. One fits a
  // self-hosted erxes; SaaS raises it.
  workerdProcesses: int('EXT_WORKERD_PROCESSES', 1),
  workerdIdleMs: int('EXT_WORKERD_IDLE_MS', 5 * 60 * 1000),
};
