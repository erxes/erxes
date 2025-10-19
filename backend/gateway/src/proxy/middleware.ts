import * as dotenv from 'dotenv';
import { Express } from 'express';

import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

import { apolloRouterPort } from '~/apollo-router';
import { ErxesProxyTarget } from '~/proxy/targets';

dotenv.config();

const { NODE_ENV } = process.env;

export const proxyReq = (proxyReq, req: any) => {
  proxyReq.setHeader('hostname', req.hostname);
  proxyReq.setHeader('userid', req.user ? req.user._id : '');
  fixRequestBody(proxyReq, req);
};

const forbid = (_req, res) => {
  res.status(403).send();
};

export async function applyProxiesCoreless(
  app: Express,
  // targets: ErxesProxyTarget[],
) {
  app.use(
    '^/graphql',
    createProxyMiddleware({
      pathRewrite: { '^/graphql': '/' },
      target: `http://127.0.0.1:${apolloRouterPort}`,
      on: {
        proxyReq,
      },
    }),
  );
}

export function applyProxyToCore(app: Express, targets: ErxesProxyTarget[]) {
  const core = targets.find((t) => t.name === 'core');

  if (!core) {
    throw new Error('core service not found');
  }

  app.use('/trpc', forbid);
  app.use(
    '/',
    createProxyMiddleware({
      target:
        NODE_ENV === 'production' ? core.address : 'http://localhost:3300',
      on: {
        proxyReq,
      },
    }),
  );
}
