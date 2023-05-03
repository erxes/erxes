import { Request, RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ErxesProxyTarget, proxyConfigByPath0 } from './targets';
import { ServerOptions } from 'http-proxy';
import * as dotenv from 'dotenv';
import { apolloRouterPort } from '../apollo-router';
dotenv.config();

const { NODE_ENV } = process.env;

type RequestWithTargetExtra = Request & {
  foundProxyTarget?: ErxesProxyTarget;
};

export default function createErxesProxyMiddleware(
  targets: ErxesProxyTarget[]
): RequestHandler {
  const targetsWithRouter: ErxesProxyTarget[] = [
    ...targets,
    {
      name: 'graphql',
      address: `http://localhost:${apolloRouterPort}`,
      pathRegex: /^\/graphql/i,
      config: null
    }
  ];

  const lookup = proxyConfigByPath0(targetsWithRouter);

  const core = targets.find(t => t.name === 'core');

  if (!core) {
    throw new Error('core service not found');
  }

  return createProxyMiddleware({
    target: NODE_ENV === 'production' ? core.address : 'http://localhost:3300',
    router: (req: RequestWithTargetExtra): ServerOptions['target'] => {
      const path0 = req.path.split('/').find(p => !!p);
      if (!path0) return;
      const target = lookup[path0];
      if (!target) return;
      req.foundProxyTarget = target;
      return target.address;
    },
    pathRewrite: (path: string, req: RequestWithTargetExtra) => {
      if (!req.foundProxyTarget?.pathRegex) return path;
      const newPath = path.replace(req.foundProxyTarget.pathRegex, '');
      return newPath;
    },
    onProxyReq: (proxyReq, req: any) => {
      proxyReq.setHeader('hostname', req.hostname);
      proxyReq.setHeader('userid', req.user ? req.user._id : '');
    }
  });
}
