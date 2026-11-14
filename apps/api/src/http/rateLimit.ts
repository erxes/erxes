import { getPool, rateLimits } from '@erxes/core-db';
import { getTableName } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { RateLimiterPostgres, RateLimiterRes } from 'rate-limiter-flexible';
import { fail } from '~/http/errors';

/**
 * A fixed-window limit per key, counted in `core_rate_limits`, so every
 * replica shares one count: a first line against floods from one address.
 * (Per-account sign-in lockout is in the database too.)
 */
const rateLimit = (options: {
  windowSeconds: number;
  max: number;
  key: (req: Request) => string | null;
}) => {
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

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.key(req);

    if (!key) return next();

    try {
      await limiter.consume(key);
    } catch (rejection) {
      if (!(rejection instanceof RateLimiterRes)) throw rejection;

      const retryAfter = Math.ceil(rejection.msBeforeNext / 1000);

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
  /** Uploads through signed links: 120 a minute per address. */
  upload: rateLimit({
    windowSeconds: 60,
    max: 120,
    key: (req) => (req.method === 'PUT' ? `upload:${ip(req)}` : null),
  }),
});
