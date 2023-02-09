import { Request, RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ErxesProxyTarget, proxyConfigByPath0 } from './targets';
import { ServerOptions } from 'http-proxy';
import * as dotenv from 'dotenv';
dotenv.config();

const { NODE_ENV, PLUGINS_INTERNAL_PORT } = process.env;

type RequestWithTargetExtra = Request & {
  foundProxyTarget?: ErxesProxyTarget;
};

export default function createErxesProxyMiddleware(
  targets: ErxesProxyTarget[]
): RequestHandler {
  const lookup = proxyConfigByPath0(targets);

  return createProxyMiddleware({
    target:
      NODE_ENV === 'production'
        ? `http://plugin_core_api${
            PLUGINS_INTERNAL_PORT ? `:${PLUGINS_INTERNAL_PORT}` : ''
          }`
        : 'http://localhost:3300',
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
      return path.replace(req.foundProxyTarget.pathRegex, '');
    },
    onProxyReq: (proxyReq, req: any) => {
      proxyReq.setHeader('hostname', req.hostname);
      proxyReq.setHeader('userid', req.user ? req.user._id : '');
    }
  });
}
