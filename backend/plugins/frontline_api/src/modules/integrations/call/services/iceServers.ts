import fetch from 'node-fetch';
import redis from '@/integrations/call/redlock';

const CREDENTIAL_TTL_SEC = 24 * 60 * 60;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const FAILURE_BACKOFF_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

export interface IIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

interface ICachedIceServers {
  iceServers: IIceServer[];
  expiresAt: number;
}

export interface ICallConfigEntry {
  _id: string;
  code: string;
  value: unknown;
}

let memoryCache: (ICachedIceServers & { keyId: string }) | null = null;
let failure: { keyId: string; retryAt: number } | null = null;
let inflight: Promise<IIceServer[] | null> | null = null;

const cacheKey = (keyId: string) => `callCfTurnIceServers:${keyId}`;

const isIceServerList = (value: unknown): value is IIceServer[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(
    (server) =>
      typeof server?.urls === 'string' ||
      (Array.isArray(server?.urls) &&
        server.urls.every((url: unknown) => typeof url === 'string')),
  );

const requestIceServers = async (keyId: string, token: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttl: CREDENTIAL_TTL_SEC }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const { iceServers } = await response.json();
    if (!isIceServerList(iceServers)) {
      throw new Error('response has no iceServers');
    }
    return iceServers;
  } finally {
    clearTimeout(timeout);
  }
};

const readRedisCache = async (keyId: string) => {
  try {
    const cached = await redis.get(cacheKey(keyId));
    if (!cached) return null;
    const parsed: ICachedIceServers = JSON.parse(cached);
    return parsed.expiresAt > Date.now() && isIceServerList(parsed.iceServers)
      ? parsed
      : null;
  } catch (e) {
    console.warn('[call] Cloudflare TURN cache read failed:', e.message);
    return null;
  }
};

const loadIceServers = async (keyId: string, token: string) => {
  const cached = await readRedisCache(keyId);
  if (cached) {
    memoryCache = { keyId, ...cached };
    return cached.iceServers;
  }

  if (failure?.keyId === keyId && failure.retryAt > Date.now()) return null;

  try {
    const iceServers = await requestIceServers(keyId, token);
    const entry = { iceServers, expiresAt: Date.now() + CACHE_TTL_MS };
    memoryCache = { keyId, ...entry };

    try {
      await redis.set(
        cacheKey(keyId),
        JSON.stringify(entry),
        'PX',
        CACHE_TTL_MS,
      );
    } catch (e) {
      console.warn('[call] Cloudflare TURN cache write failed:', e.message);
    }

    return iceServers;
  } catch (e) {
    failure = { keyId, retryAt: Date.now() + FAILURE_BACKOFF_MS };
    console.warn(
      '[call] Cloudflare TURN credentials unavailable, using CallConfigs:',
      e.message,
    );
    return null;
  }
};

/*
 * Short-lived Cloudflare Realtime TURN credentials, shared by every replica
 * through Redis for 12 hours (they live 24). Returns null when
 * CF_TURN_KEY_ID / CF_TURN_API_TOKEN are unset or Cloudflare fails.
 */
export const getCloudflareIceServers = async () => {
  const { CF_TURN_KEY_ID: keyId, CF_TURN_API_TOKEN: token } = process.env;
  if (!keyId || !token) return null;

  if (memoryCache?.keyId === keyId && memoryCache.expiresAt > Date.now()) {
    return memoryCache.iceServers;
  }

  if (!inflight) {
    inflight = loadIceServers(keyId, token).finally(() => {
      inflight = null;
    });
  }
  return inflight;
};

const urlsOf = (server: IIceServer) =>
  Array.isArray(server.urls) ? server.urls : [server.urls];

// `turn:turn.cloudflare.com:3478?transport=udp` -> `turn.cloudflare.com:3478`
const hostPort = (url: string) =>
  url.replace(/^(stuns?|turns?):/, '').split('?')[0];

/*
 * `ICE_SERVERS` carries the full list. The single-server codes keep older
 * UIs, which build `stun:`/`turn:` URLs from them, working unchanged.
 */
const iceServerConfigs = (iceServers: IIceServer[]): ICallConfigEntry[] => {
  const stunUrl = iceServers
    .flatMap(urlsOf)
    .find((url) => url.startsWith('stun:'));
  const turnServer = iceServers.find((server) =>
    urlsOf(server).some((url) => url.startsWith('turn:')),
  );
  const turnUrl = turnServer
    ? urlsOf(turnServer).find((url) => url.startsWith('turn:'))
    : undefined;

  const legacy: [string, string | undefined][] = [
    ['STUN_SERVER_URL', stunUrl && hostPort(stunUrl)],
    ['TURN_SERVER_URL', turnUrl && hostPort(turnUrl)],
    ['TURN_SERVER_USERNAME', turnServer?.username],
    ['TURN_SERVER_CREDENTIAL', turnServer?.credential],
  ];

  return [
    {
      _id: 'cf-ice-servers',
      code: 'ICE_SERVERS',
      value: JSON.stringify(iceServers),
    },
    ...legacy
      .filter((entry): entry is [string, string] => Boolean(entry[1]))
      .map(([code, value]) => ({
        _id: `cf-${code.toLowerCase().replace(/_/g, '-')}`,
        code,
        value,
      })),
  ];
};

/* Stored CallConfigs with Cloudflare TURN entries replacing matching codes. */
export const withCloudflareIceServers = async (
  configs: ICallConfigEntry[],
): Promise<ICallConfigEntry[]> => {
  const iceServers = await getCloudflareIceServers();
  if (!iceServers) return configs;

  const overrides = iceServerConfigs(iceServers);
  const overridden = new Set(overrides.map((config) => config.code));

  return [
    ...configs.filter((config) => !overridden.has(config.code)),
    ...overrides,
  ];
};

const LEGACY_ICE_CODES = [
  'STUN_SERVER_URL',
  'TURN_SERVER_URL',
  'TURN_SERVER_USERNAME',
  'TURN_SERVER_CREDENTIAL',
];

const isCloudflareIceHost = (value: unknown) =>
  typeof value === 'string' &&
  /(^|[.:/@])(stun|turn)\.cloudflare\.com/i.test(value);

/*
 * While Cloudflare TURN is on, the config form loads its short-lived values.
 * Saving the form must not store them over the permanent CallConfigs
 * fallback, so this drops ICE_SERVERS and every STUN/TURN value that is the
 * current Cloudflare one or points at Cloudflare. A Cloudflare TURN URL takes
 * its username and credential with it.
 */
export const withoutCloudflareIceConfigs = async (
  configsMap: Record<string, unknown>,
) => {
  const { CF_TURN_KEY_ID, CF_TURN_API_TOKEN } = process.env;
  if (!CF_TURN_KEY_ID || !CF_TURN_API_TOKEN) return configsMap;

  const iceServers = await getCloudflareIceServers();
  const current = new Map(
    (iceServers ? iceServerConfigs(iceServers) : []).map((config) => [
      config.code,
      config.value,
    ]),
  );
  const turnIsCloudflare =
    isCloudflareIceHost(configsMap.TURN_SERVER_URL) ||
    (current.has('TURN_SERVER_URL') &&
      current.get('TURN_SERVER_URL') === configsMap.TURN_SERVER_URL);

  return Object.fromEntries(
    Object.entries(configsMap).filter(([code, value]) => {
      if (code === 'ICE_SERVERS') return false;
      if (!LEGACY_ICE_CODES.includes(code)) return true;
      if (current.has(code) && current.get(code) === value) return false;
      if (isCloudflareIceHost(value)) return false;
      return !(
        turnIsCloudflare &&
        (code === 'TURN_SERVER_USERNAME' || code === 'TURN_SERVER_CREDENTIAL')
      );
    }),
  );
};
