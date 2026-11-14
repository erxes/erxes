import { AsyncLocalStorage } from 'node:async_hooks';
import type { NextFunction, Request, Response } from 'express';

/** Facts about the current HTTP request that the audit log records. */
export interface RequestInfo {
  ip: string | null;
  userAgent: string | null;
}

const storage = new AsyncLocalStorage<RequestInfo>();

/** Runs the rest of the request with its info available to `requestInfo()`. */
export const requestContext = (req: Request, _res: Response, next: NextFunction) => {
  storage.run(
    { ip: req.ip ?? null, userAgent: req.get('user-agent')?.slice(0, 500) ?? null },
    next,
  );
};

/** The current request's info; empty outside a request (jobs, scripts, tests). */
export const requestInfo = (): RequestInfo => storage.getStore() ?? { ip: null, userAgent: null };
