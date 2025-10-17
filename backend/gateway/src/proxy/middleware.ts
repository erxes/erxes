// @ts-nocheck
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { ErxesProxyTarget } from './targets';
import * as dotenv from 'dotenv';
import { apolloRouterPort } from '../apollo-router';
import { Express } from 'express';
dotenv.config();

const onProxyReq = (proxyReq, req: any) => {
  proxyReq.setHeader('hostname', req.hostname);
  proxyReq.setHeader('userid', req.user ? req.user._id : '');
  fixRequestBody(proxyReq, req);
};

const forbid = (_req, res) => {
  res.status(403).send();
};

export async function applyProxiesCoreless(
  app: Express,
  targets: ErxesProxyTarget[],
) {
  app.use(
    '^/graphql',
    createProxyMiddleware({
      pathRewrite: { '^/graphql': '/' },
      target: `http://127.0.0.1:${apolloRouterPort}`,

      onProxyReq,
    }),
  );

  for (const target of targets) {
    const path = `^/pl(-|:)${target.name}`;

    app.use(`${path}/trpc`, forbid);

    app.use(
      path,
      createProxyMiddleware({
        pathRewrite: { [path]: '/' },
        target: target.address,
        onProxyReq,
      }),
    );
  }
}
