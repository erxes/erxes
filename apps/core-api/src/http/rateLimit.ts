import type { NextFunction, Request, Response } from 'express';

/**
 * A fixed-window limit per key, in this process's memory: a cheap first line
 * against floods from one address. (Per-account sign-in lockout is in the
 * database, so it holds across replicas.)
 */
const rateLimit = (options: {
  windowMs: number;
  max: number;
  key: (req: Request) => string | null;
}) => {
  const hits = new Map<string, { count: number; resetAt: number }>();

  const sweep = setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, options.windowMs);

  sweep.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.key(req);

    if (!key) return next();

    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });

      return next();
    }

    entry.count += 1;

    if (entry.count > options.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

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
  windowMs: 60_000,
  max: 20,
  key: (req) => (req.method === 'POST' ? `auth:${ip(req)}` : null),
});

/** Plugin token requests: 120 a minute per address. */
export const tokenLimit = rateLimit({
  windowMs: 60_000,
  max: 120,
  key: (req) => (req.method === 'POST' ? `token:${ip(req)}` : null),
});

/** Uploads through signed links: 120 a minute per address. */
export const uploadLimit = rateLimit({
  windowMs: 60_000,
  max: 120,
  key: (req) => (req.method === 'PUT' ? `upload:${ip(req)}` : null),
});
