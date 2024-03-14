import { RequestHandler, createProxyMiddleware } from 'http-proxy-middleware';
import { ErxesProxyTarget } from './targets';
import * as dotenv from 'dotenv';
import { apolloRouterPort } from '../apollo-router';
import { Express } from 'express';
dotenv.config();

const { NODE_ENV } = process.env;

const onProxyReq = (proxyReq, req: any) => {
  proxyReq.setHeader('hostname', req.hostname);
};

const forbid = (_req, res) => {
  res.status(403).end();
};

export function applyProxies(
  app: Express,
  targets: ErxesProxyTarget[],
): RequestHandler {
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

  const proxyMiddleware = createProxyMiddleware(
    function filter(pathname, req): boolean {
      const isHttp = req.protocol === 'http' || req.protocol === 'https';
      const isGraphql = pathname.startsWith('/graphql');
      const isSubscription = !isHttp && isGraphql;
      // Graphql subscriptions are handled by gateway itself. Do not proxy them.
      return !isSubscription;
    },
    {
      router,
      pathRewrite,
      ws: true,
      onProxyReq,
      logLevel: NODE_ENV === 'production' ? 'error' : 'warn',
    },
  );

  app.use(proxyMiddleware);
  return proxyMiddleware;
}
