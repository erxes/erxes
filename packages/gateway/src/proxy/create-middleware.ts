import { Request, RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { ErxesProxyTarget, proxyConfigByPath0 } from './targets';
import { ServerOptions } from 'http-proxy';

type RequestWithTargetExtra = Request & {
  foundProxyTarget?: ErxesProxyTarget;
};

export default function createErxesProxyMiddleware(
  targets: ErxesProxyTarget[]
): RequestHandler {
  const lookup = proxyConfigByPath0(targets);

  console.log(lookup);

  return createProxyMiddleware({
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
    }
  });
}
