import * as dotenv from 'dotenv';
import { Express } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { Agent } from 'http';
import { apolloRouterPort } from '~/apollo-router';
import { ErxesProxyTarget } from '~/proxy/targets';

dotenv.config();

const { NODE_ENV } = process.env;
const DEBUG_GATEWAY_AUTH = process.env.DEBUG_GATEWAY_AUTH === 'true';

const proxyAgent = new Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: 60000,
});

export const proxyReq = (proxyReq, req: any) => {
  if (proxyReq.headersSent) {
    return;
  }

  const safeSetHeader = (name: string, value: string) => {
    if (!proxyReq.headersSent) {
      proxyReq.setHeader(name, value);
    }
  };

  safeSetHeader('hostname', req.hostname || '');
  safeSetHeader('userid', req.user?._id || '');

  if (DEBUG_GATEWAY_AUTH && req.originalUrl?.startsWith('/graphql')) {
    console.log(
      JSON.stringify({
        scope: 'gateway-proxy',
        event: 'proxy-graphql-request',
        method: req.method,
        path: req.originalUrl,
        targetHost: proxyReq.host,
        targetPath: proxyReq.path,
        hasUser: Boolean(req.user?._id),
        userId: req.user?._id || '',
        hasUseridHeader: Boolean(req.headers.userid),
        hasAuthorizationHeader: Boolean(req.headers.authorization),
        hasAuthCookie: Boolean(req.cookies?.['auth-token']),
      }),
    );
  }

  /**
   * Manually forward client connection info instead of using the xfwd
   * proxy option. Our downstream services handle X-Forwarded-For securely
   * by reading the rightmost (gateway-appended) IP.
   */
  const existingXff = req.headers['x-forwarded-for'];
  const clientIp =
    req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  safeSetHeader(
    'x-forwarded-for',
    existingXff ? `${existingXff}, ${clientIp}` : clientIp,
  );
  safeSetHeader(
    'x-forwarded-port',
    String(req.socket?.localPort || req.connection?.localPort || ''),
  );
  safeSetHeader(
    'x-forwarded-proto',
    req.protocol || (req.socket?.encrypted ? 'https' : 'http'),
  );

  if (!proxyReq.headersSent) {
    fixRequestBody(proxyReq, req);
  }
};

export function applyProxiesCoreless(app: Express) {
  app.use(
    '^/graphql',
    createProxyMiddleware({
      pathRewrite: { '^/graphql': '/' },
      target: `http://127.0.0.1:${apolloRouterPort}`,
      agent: proxyAgent,
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

  app.use(
    '/',
    createProxyMiddleware({
      target:
        NODE_ENV === 'production' ? core.address : 'http://localhost:3300',
      agent: proxyAgent,
      on: {
        proxyReq,
      },
    }),
  );
}
