import type { Request } from 'express';

/**
 * Request headers core doesn't pass on: hop-by-hop, the caller's credentials for core, encodings
 * (core reads the body inflated and passes the answer's bytes on as they come), and the client
 * addresses proxies set, which the caller could make up. Core sets `x-forwarded-for` itself.
 */
const DROPPED = new Set([
  'accept-encoding',
  'authorization',
  'cf-connecting-ip',
  'connection',
  'content-encoding',
  'content-length',
  'cookie',
  'expect',
  'fastly-client-ip',
  'forwarded',
  'host',
  'keep-alive',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'true-client-ip',
  'upgrade',
  'x-client-ip',
  'x-cluster-client-ip',
  'x-real-ip',
]);

const isDropped = (name: string) => DROPPED.has(name) || name.startsWith('x-forwarded-');

export const forwardedHeaders = (req: Request) =>
  Object.fromEntries(
    Object.entries(req.headers).flatMap(([name, value]) =>
      isDropped(name) || value === undefined
        ? []
        : [[name, Array.isArray(value) ? value.join(', ') : value]],
    ),
  );

export const SANDBOXED_ANSWER = {
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; sandbox",
  'Cache-Control': 'no-store',
};
