import * as dotenv from 'dotenv';
import { Express, Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

import { apolloRouterPort } from '~/apollo-router';
import { ErxesProxyTarget } from '~/proxy/targets';

dotenv.config();

const { NODE_ENV } = process.env;

// Shared proxyReq handler
export const proxyReq = (proxyReq: any, req: Request) => {
  // preserve original host safely
  proxyReq.setHeader('x-original-host', req.hostname);

  if ((req as any).user?._id) {
    proxyReq.setHeader('x-user-id', (req as any).user._id);
  }

  fixRequestBody(proxyReq, req);
};

const forbid = (_req: Request, res: Response) => {
  res.status(403).send('Forbidden');
};

/**
 * Proxy GraphQL → Apollo Router (used when Coreless)
 */
export async function applyProxiesCoreless(app: Express) {
  app.use(
    '^/graphql',
    createProxyMiddleware({
      pathRewrite: { '^/graphql': '/' },
      target: `http://127.0.0.1:${apolloRouterPort}`,
      changeOrigin: true,
      xfwd: true,
      on: {
        proxyReq,
        error(err, _req, res) {
          console.error('[Coreless Proxy Error]', err.message);
          (res as Response).status(502).send('Apollo Router unavailable');
        },
      },
    }),
  );
}

/**
 * Proxy → Core service (legacy / OS version)
 */
export function applyProxyToCore(app: Express, targets: ErxesProxyTarget[]) {
  const core = targets.find((t) => t.name === 'core');

  if (!core) {
    throw new Error('core service not found in proxy targets');
  }

  console.log(
    `[applyProxyToCore] Forwarding → ${
      NODE_ENV === 'production' ? core.address : 'http://localhost:3300'
    }`,
  );

  app.use('/trpc', forbid);

  app.use(
    '/',
    createProxyMiddleware({
      target:
        NODE_ENV === 'production' ? core.address : 'http://localhost:3300',
      changeOrigin: true,
      xfwd: true,
      on: {
        proxyReq,
        error(err, _req, res) {
          console.error('[Core Proxy Error]', err.message);
          (res as Response).status(502).send('Core service unavailable');
        },
      },
    }),
  );
}
