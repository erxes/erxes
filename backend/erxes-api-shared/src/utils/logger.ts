import { randomUUID } from 'crypto';
import { STATUS_CODES } from 'http';
import type { NextFunction, Request, Response } from 'express';
import pino, { DestinationStream, Logger, LoggerOptions } from 'pino';

/**
 * Shared structured logger: one JSON line per event on stdout, read by the host's log agent.
 *
 * - `"level":"error"` (string, not 50) and ISO `time`, so log tools filter without parsing.
 * - `service` on every line (SERVICE_NAME, or the plugin name set by startPlugin).
 * - Secrets are masked HERE, before anything is written: credentials inside URLs
 *   (`mongodb://user:***@host`, also when the password itself contains `@`), Bearer tokens,
 *   and well-known secret keys (password, token, cookie, authorization, ...).
 *
 *   logger.info({ orderId }, 'order synced');
 *   logger.error({ err }, 'erkhet sync failed');
 *   getRequestLogger(req).warn({ attempt }, 'retrying');   // carries requestId
 */

// scheme://user:<anything up to the LAST @ of the URL>@ — the password may contain '@'.
// Stops at whitespace and quotes so it never runs across JSON fields.
const CREDENTIALS_IN_URL =
  /\b((?:mongodb(?:\+srv)?|amqps?|rediss?|postgres(?:ql)?|mysql|https?):\/\/[^:/\s@"'<>]+:)[^\s"'<>]*@/gi;
const BEARER_TOKEN = /\b(Bearer\s+)[A-Za-z0-9._~+/=-]{8,}/gi;

export const maskLogLine = (text: string): string =>
  text.replace(CREDENTIALS_IN_URL, '$1***@').replace(BEARER_TOKEN, '$1***');

const SECRET_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'cookie',
];

export const REDACT_PATHS = [
  ...SECRET_KEYS,
  ...SECRET_KEYS.map((key) => `*.${key}`),
  ...SECRET_KEYS.map((key) => `*.*.${key}`),
  'headers.authorization',
  'headers.cookie',
  '*.headers.authorization',
  '*.headers.cookie',
  'headers["x-app-token"]',
  'headers["erxes-app-token"]',
  'headers["erxes-core-token"]',
];

export interface CreateLoggerOptions {
  service?: string;
  level?: string;
  destination?: DestinationStream;
}

export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const service = options.service || process.env.SERVICE_NAME;

  const loggerOptions: LoggerOptions = {
    level: options.level || process.env.LOG_LEVEL || 'info',
    base: service ? { service } : {},
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
    redact: { paths: REDACT_PATHS, censor: '[Redacted]' },
    hooks: {
      // last step before the line is written: covers msg, error messages and stacks,
      // nested objects and bindings alike
      streamWrite: maskLogLine,
    },
  };

  return options.destination
    ? pino(loggerOptions, options.destination)
    : pino(loggerOptions);
}

export const logger = createLogger();

/** Name every line of this process after the plugin (startPlugin), unless SERVICE_NAME already does. */
export const setLoggerService = (service: string) => {
  if (!process.env.SERVICE_NAME) {
    logger.setBindings({ service });
  }
};

// ------------------------------------------------------------------ request logging

const REQUEST_ID_HEADER = 'x-request-id';
const VALID_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

/** The incoming x-request-id (set by the gateway, propagated by the router) or a new one. */
export const getRequestId = (req: Request): string => {
  const header = req.headers[REQUEST_ID_HEADER];
  const value = Array.isArray(header) ? header[0] : header;

  return value && VALID_REQUEST_ID.test(value) ? value : randomUUID();
};

/** Logger bound to the current request's id (falls back to the process logger). */
export const getRequestLogger = (req: Request): Logger =>
  (req as any).log || logger;

export type RequestLogMode = 'all' | 'slow' | 'errors' | 'off';

export interface RequestLoggerOptions {
  log?: Logger;
  /** all: every request · slow (default): 4xx/5xx, slow and aborted · errors: 4xx/5xx and aborted · off */
  mode?: RequestLogMode;
  slowMs?: number;
}

const SKIP_PATHS = new Set(['/health', '/subscriptionPlugin.js']);

const operationOf = (req: Request): string | undefined => {
  const operationName = (req.body as any)?.operationName;

  return typeof operationName === 'string' ? operationName : undefined;
};

/**
 * One line per request that matters: method, path (no query string), status, duration,
 * GraphQL operation and requestId. The id is taken from x-request-id or generated, echoed in
 * the response and passed on by the gateway, so one request can be followed across services.
 * A request the client gave up on (e.g. nginx timing out after 60 s) is logged as "aborted".
 */
export function requestLogger(options: RequestLoggerOptions = {}) {
  const mode =
    options.mode || (process.env.LOG_REQUESTS as RequestLogMode) || 'slow';
  const slowMs = options.slowMs ?? Number(process.env.LOG_SLOW_MS || 1000);
  const base = options.log || logger;

  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = getRequestId(req);

    (req as any).requestId = requestId;
    (req as any).log = base.child({ requestId });
    res.setHeader(REQUEST_ID_HEADER, requestId);

    if (mode === 'off' || SKIP_PATHS.has(req.path)) {
      return next();
    }

    const startedAt = process.hrtime.bigint();
    const fields = () => ({
      method: req.method,
      path: (req.originalUrl || req.url).split('?')[0],
      // a request the client gave up on never got a status
      status: res.headersSent ? res.statusCode : undefined,
      durationMs: Number((process.hrtime.bigint() - startedAt) / BigInt(1e6)),
      operation: operationOf(req),
      userId: (req.headers.userid as string) || undefined,
      // erxes' own correlation id for a request's DB changes (x-erxes-process-id), when the caller set one
      processId: (req.headers['x-erxes-process-id'] as string) || undefined,
    });

    let finished = false;

    res.on('finish', () => {
      finished = true;
      const line = fields();
      const status = res.statusCode;
      const failed = status >= 400;
      const slow = line.durationMs >= slowMs;

      if (mode === 'all' || failed || (mode === 'slow' && slow)) {
        const level =
          status >= 500 ? 'error' : failed || slow ? 'warn' : 'info';
        (req as any).log[level](line, 'request');
      }
    });

    res.on('close', () => {
      if (!finished) {
        (req as any).log.warn(fields(), 'request aborted by client');
      }
    });

    next();
  };
}

/**
 * Last error handler (mount after Sentry's): one JSON line with the request id and the whole error,
 * then the same short answer Express would give (status from `err.status`, else 500; never a stack).
 * Without it Express prints a plain-text stack trace that log tools can neither parse nor tie to the
 * request.
 */
export function errorLogger(options: { log?: Logger } = {}) {
  const base = options.log || logger;

  return (err: any, req: Request, res: Response, _next: NextFunction) => {
    const declared = Number(err?.status || err?.statusCode);
    const status = declared >= 400 && declared < 600 ? declared : 500;
    const log: Logger = (req as any).log || base;

    log[status >= 500 ? 'error' : 'warn'](
      {
        err,
        method: req.method,
        path: (req.originalUrl || req.url).split('?')[0],
        status,
      },
      'unhandled error',
    );

    if (res.headersSent) {
      // too late for a status: close the connection, as Express does
      req.socket?.destroy();
      return;
    }

    res
      .status(status)
      .type('text')
      .send(STATUS_CODES[status] || 'Error');
  };
}
