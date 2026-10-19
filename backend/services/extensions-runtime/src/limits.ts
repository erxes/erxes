const int = (name: string, fallback: number) =>
  Number(process.env[name]) || fallback;

const KB = 1024;
const MB = 1024 * KB;

// Every bound the runtime enforces, in one place.
export const LIMITS = {
  // Wall clock for one function call. OSS workerd ignores CPU limits, so this
  // is the only limit on runaway code.
  runTimeoutMs: int('EXT_RUN_TIMEOUT_MS', 5000),
  // One contract call through the gateway. Also cut to what's left of the
  // run, so an upstream call never outlives the run that made it.
  upstreamTimeoutMs: int('EXT_UPSTREAM_TIMEOUT_MS', 4000),
  // workerd keeps every loaded worker in memory. scripts/bundle.ts refuses
  // bigger builds, and install refuses them again.
  workerBytes: 300 * KB,
  // Request bodies.
  inputBytes: int('EXT_MAX_INPUT_BYTES', 256 * KB),
  installBytes: int('EXT_MAX_INSTALL_BYTES', 16 * MB),
  hostDbRequestBytes: int('EXT_MAX_DB_REQUEST_BYTES', MB),
  // Serialized results: what a function returns, and what one db call returns
  // to the worker.
  resultBytes: int('EXT_MAX_RESULT_BYTES', MB),
  dbResultBytes: int('EXT_MAX_DB_RESULT_BYTES', MB),
  findLimit: 500,
  // What one install may declare, and how long activation may spend building
  // its indexes in total.
  maxCollections: 20,
  maxIndexes: 20,
  indexBuildMs: int('EXT_INDEX_BUILD_MS', 30_000),
  // Server-side time limit for one Mongo query, so a slow $regex can't hold
  // a connection.
  dbMaxTimeMs: 2000,
  // Outbound https from an extension that declares network hosts. The
  // timeout is also cut to what's left of the run.
  egressPerCall: int('EXT_EGRESS_PER_CALL', 50),
  egressTimeoutMs: int('EXT_EGRESS_TIMEOUT_MS', 10_000),
  egressRequestBytes: int('EXT_EGRESS_REQUEST_BYTES', MB),
  egressResponseBytes: int('EXT_EGRESS_RESPONSE_BYTES', 5 * MB),
  maxNetworkHosts: 20,
  // Secrets one install may declare, and how long one value may be.
  maxSecrets: 20,
  secretValueChars: 8192,
  // Triggers one install may declare. A schedule fires at most every
  // minScheduleMinutes; a webhook body is at most webhookBytes.
  maxSchedules: 10,
  minScheduleMinutes: 5,
  maxWebhooks: 10,
  webhookBytes: MB,
  maxEvents: 20,
  // Trigger runs one runtime instance works on at once. They also count
  // against the tenant and global limits below.
  triggerConcurrency: int('EXT_TRIGGER_CONCURRENCY', 8),
  // Calls running at once, per tenant and in total.
  tenantConcurrency: int('EXT_TENANT_CONCURRENCY', 8),
  globalConcurrency: int('EXT_GLOBAL_CONCURRENCY', 64),
  // workerd processes. Each serves one tenant at a time.
  workerdProcesses: int('EXT_WORKERD_PROCESSES', 4),
  workerdIdleMs: int('EXT_WORKERD_IDLE_MS', 5 * 60 * 1000),
};
