import { getPool, rateLimits } from '@erxes/core-db';
import { getTableName } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { RateLimiterPostgres, RateLimiterRes } from 'rate-limiter-flexible';
import { fail } from '~/http/errors';

/**
 * A fixed-window count per key in `core_rate_limits`, so every replica shares one count. Counts
 * one for `key` and resolves to null, or to the seconds until the window ends when `max` is used up.
 */
export const fixedWindow = (options: { windowSeconds: number; max: number }) => {
  const pool = getPool();

  const limiter = new RateLimiterPostgres({
    // The limiter names its statements; a transaction pooler (Supabase 6543)
    // can't keep named statements, so they go to the pool unnamed.
    storeClient: {
      query: (query: { text: string; values?: unknown[] }) => pool.query(query.text, query.values),
    },
    storeType: 'pool',
    tableName: getTableName(rateLimits),
    // The table comes from core's migrations, never from the limiter.
    tableCreated: true,
    points: options.max,
    duration: options.windowSeconds,
  });

  return async (key: string) => {
    try {
      await limiter.consume(key);

      return null;
    } catch (rejection) {
      if (!(rejection instanceof RateLimiterRes)) throw rejection;

      return Math.ceil(rejection.msBeforeNext / 1000);
    }
  };
};

/**
 * A fixed-window limit per key, a first line against floods from one address.
 * (Per-account sign-in lockout is in the database too.)
 */
const rateLimit = (options: {
  windowSeconds: number;
  max: number;
  key: (req: Request) => string | null;
}) => {
  const count = fixedWindow(options);

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.key(req);

    if (!key) return next();

    const retryAfter = await count(key);

    if (retryAfter !== null) {
      res.set('Retry-After', String(retryAfter));
      throw fail('TOO_MANY_REQUESTS', `Too many attempts: try again in ${retryAfter} seconds`);
    }

    return next();
  };
};

const ip = (req: Request) => req.ip ?? req.socket.remoteAddress ?? 'unknown';

/** The app's limits, on the database `configureDb()` set up. */
export const createRateLimits = () => ({
  /** Sign-in and first-run setup: 20 a minute per address. */
  signIn: rateLimit({
    windowSeconds: 60,
    max: 20,
    key: (req) => (req.method === 'POST' ? `auth:${ip(req)}` : null),
  }),
  /**
   * Customer sign-in codes, asked for and typed: 10 a minute per address (the
   * codes themselves are limited per email and phone in the database).
   */
  customerCode: rateLimit({
    windowSeconds: 60,
    max: 10,
    key: (req) => (req.method === 'POST' ? `customer-code:${ip(req)}` : null),
  }),
  /** Plugin token requests: 120 a minute per address. */
  token: rateLimit({
    windowSeconds: 60,
    max: 120,
    key: (req) => (req.method === 'POST' ? `token:${ip(req)}` : null),
  }),
  /**
   * Calls to plugins' public routes: 600 a minute per address for each plugin and organisation,
   * by the route's decoded names, and 3000 a minute per address in all (a webhook sender calls
   * for many organisations from the same addresses).
   */
  pluginPublic: [
    rateLimit({
      windowSeconds: 60,
      max: 3000,
      key: (req) => `plugin-public:${ip(req)}`,
    }),
    rateLimit({
      windowSeconds: 60,
      max: 600,
      key: (req) =>
        `plugin-public:${ip(req)}:${String(req.params.name)}:${String(req.params.orgId)}`,
    }),
  ],
  /**
   * Email providers' event webhooks: 3000 a minute per address (SendGrid batches its events, SNS
   * posts one a message, both from shared addresses and both retry what was refused).
   */
  emailEvents: [
    rateLimit({
      windowSeconds: 60,
      max: 3000,
      key: (req) => `email-events:${ip(req)}`,
    }),
  ],
  automationHooks: [
    rateLimit({
      windowSeconds: 60,
      max: 3000,
      key: (req) => `automation-hooks:${ip(req)}`,
    }),
    rateLimit({
      windowSeconds: 60,
      max: 600,
      key: (req) => `automation-hooks:${ip(req)}:${String(req.params.id)}`,
    }),
  ],
  appHooks: [
    rateLimit({
      windowSeconds: 60,
      max: 6000,
      key: (req) => `app-hooks:${ip(req)}`,
    }),
    rateLimit({
      windowSeconds: 60,
      max: 1200,
      key: (req) => `app-hooks:${ip(req)}:${String(req.params.id)}`,
    }),
  ],
  /** Uploads through signed links: 120 a minute per address. */
  upload: rateLimit({
    windowSeconds: 60,
    max: 120,
    key: (req) => (req.method === 'PUT' ? `upload:${ip(req)}` : null),
  }),
});
