import type { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

/**
 * A fixed-window limit per key, in this process's memory: a cheap first line
 * against floods from one address. (Per-account sign-in lockout is in the
 * database, so it holds across replicas.)
 */
const rateLimit = (options: {
  windowSeconds: number;
  max: number;
  key: (req: Request) => string | null;
}) => {
  const limiter = new RateLimiterMemory({ points: options.max, duration: options.windowSeconds });

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.key(req);

    if (!key) return next();

    try {
      await limiter.consume(key);
    } catch (rejection) {
      if (!(rejection instanceof RateLimiterRes)) throw rejection;

      const retryAfter = Math.ceil(rejection.msBeforeNext / 1000);

      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        defined: false,
        code: 'TOO_MANY_REQUESTS',
        status: 429,
        message: `Too many attempts: try again in ${retryAfter} seconds`,
      });

      return;
    }

    return next();
  };
};

const ip = (req: Request) => req.ip ?? req.socket.remoteAddress ?? 'unknown';

/** Sign-in and first-run setup: 20 a minute per address. */
export const signInLimit = rateLimit({
  windowSeconds: 60,
  max: 20,
  key: (req) => (req.method === 'POST' ? `auth:${ip(req)}` : null),
});

/**
 * Customer sign-in codes, asked for and typed: 10 a minute per address (the
 * codes themselves are limited per email and phone in the database).
 */
export const customerCodeLimit = rateLimit({
  windowSeconds: 60,
  max: 10,
  key: (req) => (req.method === 'POST' ? `customer-code:${ip(req)}` : null),
});

/** Plugin token requests: 120 a minute per address. */
export const tokenLimit = rateLimit({
  windowSeconds: 60,
  max: 120,
  key: (req) => (req.method === 'POST' ? `token:${ip(req)}` : null),
});

/** Uploads through signed links: 120 a minute per address. */
export const uploadLimit = rateLimit({
  windowSeconds: 60,
  max: 120,
  key: (req) => (req.method === 'PUT' ? `upload:${ip(req)}` : null),
});
