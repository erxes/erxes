import { createProxyMiddleware } from 'http-proxy-middleware';
import { ErxesProxyTarget } from './targets';
import * as dotenv from 'dotenv';
import { apolloRouterPort } from '../apollo-router';
import { Express } from 'express';
dotenv.config();

const { NODE_ENV } = process.env;

const onProxyReq = (proxyReq, req: any) => {
  proxyReq.setHeader('hostname', req.hostname);
  proxyReq.setHeader('userid', req.user ? req.user._id : '');
};

const forbid = (_req, res) => {
  res.status(403).send();
};

export async function applyProxies(app: Express, targets: ErxesProxyTarget[]) {
  app.use('/rpc', forbid);

  const router = {
    '/graphql': `http://127.0.0.1:${apolloRouterPort}`,
  };
  const pathRewrite = {
    '/graphql': '',
  };

  for (const target of targets) {
    const path1 = `/pl-${target.name}`;
    const path2 = `/pl:${target.name}`;

    app.use(`${path1}/rpc`, forbid);
    app.use(`${path2}/rpc`, forbid);

    router[path1] = target.address;
    router[path2] = target.address;
    pathRewrite[path1] = '';
    pathRewrite[path2] = '';
  }

  const core = targets.find((t) => t.name === 'core');
  if (!core) {
    throw new Error('core service not found');
  }
  router['/'] = core.address;

  app.use(
    createProxyMiddleware({
      router,
      pathRewrite,
      ws: true,
      onProxyReq,
      logLevel: NODE_ENV === 'production' ? 'error' : 'warn',
    }),
  );
}
