import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** Facts about the current HTTP request that the audit log and logs record. */
export interface RequestInfo {
  ip: string | null;
  userAgent: string | null;
  /** Correlates logs of one request (`X-Request-Id`, taken from a proxy or made here). */
  requestId: string | null;
}

const storage = new AsyncLocalStorage<RequestInfo>();

const VALID_ID = /^[A-Za-z0-9._:-]{8,100}$/;

/**
 * Runs the rest of the request with its info available to `requestInfo()`,
 * returns its id in `X-Request-Id`, and logs one line when it finishes.
 */
export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const given = req.get('x-request-id');
  const requestId = given && VALID_ID.test(given) ? given : randomUUID();
  const started = process.hrtime.bigint();

  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => {
    // Health checks would drown everything else.
    if (req.path === '/health' || req.path === '/ready') return;

    void import('~/lib/log').then(({ log }) =>
      storage.run({ ip: req.ip ?? null, userAgent: null, requestId }, () =>
        log[res.statusCode >= 500 ? 'error' : 'info']('request', {
          method: req.method,
          // The path only: query strings can hold search terms and other personal data.
          path: req.originalUrl.split('?')[0],
          status: res.statusCode,
          ms: Number((process.hrtime.bigint() - started) / 1_000_000n),
          org: req.actor?.orgId ?? req.plugin?.orgId,
          user: req.actor?.userId,
          plugin: req.plugin?.plugin ?? req.pluginService?.plugin,
        }),
      ),
    );
  });

  storage.run(
    { ip: req.ip ?? null, userAgent: req.get('user-agent')?.slice(0, 500) ?? null, requestId },
    next,
  );
};

/** The current request's info; empty outside a request (jobs, scripts, tests). */
export const requestInfo = (): RequestInfo =>
  storage.getStore() ?? { ip: null, userAgent: null, requestId: null };
