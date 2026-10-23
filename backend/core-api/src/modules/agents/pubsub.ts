import type { RedisStreamsPubSub } from '@mastra/redis-streams' with {
  'resolution-mode': 'import',
};

/**
 * Process-wide Redis Streams PubSub for the agents' durable runs.
 *
 * One instance per process (not per tenant runtime): every tenant `Mastra`
 * instance receives the same object, so stream events published by a run on
 * one replica/process are observable from any other through
 * `agent.observe(runId)` — this is what lets a reconnect survive browser
 * refresh and API replicas/processes. The durable agent wires it
 * automatically via `__registerMastra` (no custom per-agent pubsub), and
 * per-run topics are deleted on terminal states through the native
 * `clearTopic` path, so no homemade replay or cache layer exists here.
 *
 * Connection settings follow the platform Redis convention (`REDIS_HOST`,
 * `REDIS_PORT`, `REDIS_PASSWORD`) — infrastructure wiring, never chat or
 * provider secrets (those stay on the per-user BYOK document and never
 * enter this module). There is no `REDIS_URL` variable in the repo; those
 * settings are converted internally for `RedisStreamsPubSub`'s documented
 * URL option. The instance connects lazily on first publish or subscribe
 * and its lifecycle belongs
 * to the process: it is never closed per tenant, matching the shared
 * mongoose connection pattern.
 */

/** Stream-key namespace: `<prefix>:<topic>`, collision-safe on shared Redis. */
const AGENTS_PUBSUB_KEY_PREFIX = 'core-agents';

/** Retained entries per run topic; runs rarely exceed hundreds of chunks. */
const AGENTS_PUBSUB_MAX_STREAM_LENGTH = 10_000;

/**
 * Backstop TTL for streams that never reach `clearTopic` (e.g. a crashed
 * run): idle streams are deleted by Redis after one hour. Suspended runs
 * are unaffected — resume rebuilds from the Mongo snapshot and publishing
 * recreates the stream.
 */
const AGENTS_PUBSUB_STREAM_IDLE_TTL_MS = 3_600_000;

const REDIS_DEFAULT_PORT = 6379;
const REDIS_MIN_PORT = 1;
const REDIS_MAX_PORT = 65_535;

/**
 * Strictly parses a TCP port: all digits and in range. Rejects empty,
 * signed, decimal, and out-of-range values with an actionable error
 * instead of constructing a broken URL.
 */
const parseRedisPort = (raw: string | undefined): number | undefined => {
  if (raw === undefined) {
    return undefined;
  }

  const trimmed = raw.trim();

  if (!/^\d+$/.test(trimmed)) {
    throw new Error(
      `Invalid REDIS_PORT "${raw}": must be an integer between ${REDIS_MIN_PORT} and ${REDIS_MAX_PORT}.`,
    );
  }

  const port = Number.parseInt(trimmed, 10);

  if (!Number.isSafeInteger(port) || port < REDIS_MIN_PORT || port > REDIS_MAX_PORT) {
    throw new Error(
      `Invalid REDIS_PORT "${raw}": must be an integer between ${REDIS_MIN_PORT} and ${REDIS_MAX_PORT}.`,
    );
  }

  return port;
};

/**
 * Brackets a bare IPv6 literal for URL embedding (`::1` → `[::1]`);
 * hostnames, IPv4, and already-bracketed values pass through untouched.
 */
const formatRedisHost = (host: string): string =>
  host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;

/**
 * Builds the Redis URL from the platform convention. An absent host
 * defaults to localhost (matching ioredis, which defaults an undefined
 * host to loopback) so an independently supplied `REDIS_PORT` or
 * `REDIS_PASSWORD` is still honored instead of silently dropped. A
 * malformed or out-of-range `REDIS_PORT` throws instead of producing a
 * broken URL. The password is percent-encoded and never logged.
 */
const buildRedisUrl = (): string => {
  const host = process.env.REDIS_HOST?.trim() || 'localhost';
  const port = parseRedisPort(process.env.REDIS_PORT) ?? REDIS_DEFAULT_PORT;
  const password = process.env.REDIS_PASSWORD;
  const formattedHost = formatRedisHost(host);

  return password
    ? `redis://:${encodeURIComponent(password)}@${formattedHost}:${port}`
    : `redis://${formattedHost}:${port}`;
};

const createAgentsPubSub = async (): Promise<RedisStreamsPubSub> => {
  // `@mastra/redis-streams` is ESM-only; load it dynamically from CommonJS
  // like the other Mastra entries used by this plugin.
  const { RedisStreamsPubSub: RedisStreamsPubSubCtor } = await import(
    '@mastra/redis-streams'
  );

  const url = buildRedisUrl();

  return new RedisStreamsPubSubCtor({
    url,
    keyPrefix: AGENTS_PUBSUB_KEY_PREFIX,
    maxStreamLength: AGENTS_PUBSUB_MAX_STREAM_LENGTH,
    streamIdleTtlMs: AGENTS_PUBSUB_STREAM_IDLE_TTL_MS,
    // Bound poison-event retries so they cannot refresh expiry forever.
    maxDeliveryAttempts: 5,
    logger: {
      // Do not log adapter metadata: it can include event payloads or URLs.
      warn: (message) => {
        if (typeof message === 'string') {
          console.warn('[core-agents Redis]', message);
        }
      },
    },
  });
};

// One instance (and therefore one Redis connection set) per process.
// Pending promises are cached so concurrent first requests cannot create
// two buses; failed creations are evicted so the next request retries.
let cachedPubSub: Promise<RedisStreamsPubSub> | undefined;

export const getAgentsPubSub = async (): Promise<RedisStreamsPubSub> => {
  if (!cachedPubSub) {
    cachedPubSub = createAgentsPubSub();
  }

  try {
    return await cachedPubSub;
  } catch (error) {
    cachedPubSub = undefined;

    throw error;
  }
};
