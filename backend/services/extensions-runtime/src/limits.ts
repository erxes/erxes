const int = (name: string, fallback: number) =>
  Number(process.env[name]) || fallback;

const KB = 1024;
const MB = 1024 * KB;

// Every bound the runtime enforces, in one place.
export const LIMITS = {
  // Wall clock for one function call. OSS workerd ignores CPU limits, so this
  // is the only limit on runaway code.
  runTimeoutMs: int('EXT_RUN_TIMEOUT_MS', 5000),
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
  // Server-side time limit for one Mongo query, so a slow $regex can't hold
  // a connection.
  dbMaxTimeMs: 2000,
  // Calls running at once, per tenant and in total.
  tenantConcurrency: int('EXT_TENANT_CONCURRENCY', 8),
  globalConcurrency: int('EXT_GLOBAL_CONCURRENCY', 64),
  // workerd processes. Each serves one tenant at a time.
  workerdProcesses: int('EXT_WORKERD_PROCESSES', 4),
  workerdIdleMs: int('EXT_WORKERD_IDLE_MS', 5 * 60 * 1000),
};
