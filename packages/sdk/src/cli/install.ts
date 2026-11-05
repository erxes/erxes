import { createHash, randomBytes } from 'node:crypto';
import Redis from 'ioredis';
import { type BuildOptions, buildExtension } from './build';

export type InstallOptions = BuildOptions & {
  // The gateway, e.g. https://acme.erxes.io/gateway. Defaults to the local one.
  url?: string;
  // Monorepo only: sign in as this owner by writing a session into the
  // stack's Redis, instead of ERXES_TOKEN.
  owner?: string;
};

export const LOCAL_GATEWAY = 'http://localhost:4000';

// A login session for `userId`, the shape core-api's createSession stores,
// for ten minutes. Needs the stack's Redis (REDIS_HOST, REDIS_PORT,
// REDIS_PASSWORD).
const mintSession = async (gateway: string, userId: string) => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });
  // The tenant the gateway reads from the hostname, as getSubdomain does.
  const subdomain = new URL(gateway).hostname.split('.')[0];
  const sid = randomBytes(32).toString('base64url');
  const now = Date.now();
  const ttlSecs = 600;

  try {
    await redis.connect();
    await redis.set(
      `session:${subdomain}:${createHash('sha256').update(sid).digest('hex')}`,
      JSON.stringify({
        userId,
        method: 'erxes-ext',
        createdAt: now,
        lastSeenAt: now,
        expiresAt: now + ttlSecs * 1000,
        idleSecs: ttlSecs,
      }),
      'EX',
      ttlSecs,
    );
  } finally {
    redis.disconnect();
  }

  return sid;
};

// The owner's credential: a session minted with --owner, else ERXES_TOKEN
// as a bearer token.
const credential = async (
  gateway: string,
  owner?: string,
): Promise<Record<string, string>> => {
  if (owner) {
    return { cookie: `erxes-sid=${await mintSession(gateway, owner)}` };
  }

  const token = process.env.ERXES_TOKEN;

  if (!token) {
    throw new Error(
      'Set ERXES_TOKEN to an owner login token, or pass --owner <userId> against a local stack',
    );
  }

  return { authorization: `Bearer ${token}` };
};

// Builds the extension and installs it through the gateway, the same request
// Settings > Extensions sends for an upload.
export const installExtension = async (
  extDir: string,
  { url = LOCAL_GATEWAY, owner, schema }: InstallOptions,
) => {
  const { bundle } = await buildExtension(extDir, { schema });
  const gateway = url.replace(/\/+$/, '');
  const res = await fetch(`${gateway}/pl:extensions/install`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(await credential(gateway, owner)),
    },
    body: JSON.stringify(bundle),
  });
  const body: {
    ok?: boolean;
    data?: { version: string; reactivated: boolean };
    error?: { code: string; message: string };
  } | null = await res.json().catch(() => null);

  if (!body?.ok || !body.data) {
    throw new Error(
      body?.error
        ? `${body.error.code}: ${body.error.message}`
        : `install failed with HTTP ${res.status}`,
    );
  }

  return { id: bundle.id, ...body.data };
};
