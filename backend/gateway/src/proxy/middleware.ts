import * as dotenv from 'dotenv';
import { Express, NextFunction, Request, Response } from 'express';
import {
  clientPortalHeaderName,
  cpUserHeaderName,
  erxesSubdomainHeaderName,
  getSubdomain,
  setUserHeader,
  userHeaderName,
} from 'erxes-api-shared/utils';
import {
  DATA_EXTENSIONS_PROOF_HEADERS,
  gatewayProofPayload,
  signDataExtensionsProof,
} from 'erxes-api-shared/core-modules';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { Agent, ServerResponse } from 'http';
import { apolloRouterPort } from '~/apollo-router';
import { ErxesProxyTarget } from '~/proxy/targets';

dotenv.config();

const { NODE_ENV } = process.env;
const DEBUG_GATEWAY_AUTH = process.env.DEBUG_GATEWAY_AUTH === 'true';

// The agent's own `timeout` only emits an event; without `proxyTimeout` a
// stalled download holds its pooled socket forever and starves core traffic.
const PROXY_IDLE_TIMEOUT_MS = 60_000;

const proxyAgent = new Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 20,
  timeout: PROXY_IDLE_TIMEOUT_MS,
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

export const proxyRes = (proxyRes, req: any, res: ServerResponse) => {
  // An upstream cut off mid-stream (e.g. by proxyTimeout) never ends the
  // client response, so close it rather than leave the connection hanging.
  proxyRes.on('close', () => {
    if (!res.writableEnded) {
      res.destroy();
    }
  });

  if (DEBUG_GATEWAY_AUTH && req.originalUrl?.startsWith('/graphql')) {
    console.log(
      JSON.stringify({
        scope: 'gateway-proxy',
        event: 'proxy-graphql-response',
        method: req.method,
        path: req.originalUrl,
        statusCode: proxyRes.statusCode,
        hasUser: Boolean(req.user?._id),
        userId: req.user?._id || '',
        hasUseridHeader: Boolean(req.headers.userid),
      }),
    );
  }
};

export const proxyError = (error, req: any, res?: any) => {
  if (DEBUG_GATEWAY_AUTH && req.originalUrl?.startsWith('/graphql')) {
    console.log(
      JSON.stringify({
        scope: 'gateway-proxy',
        event: 'proxy-graphql-error',
        method: req.method,
        path: req.originalUrl,
        code: error?.code,
        message: error?.message,
        hasUser: Boolean(req.user?._id),
        userId: req.user?._id || '',
        hasUseridHeader: Boolean(req.headers.userid),
      }),
    );
  }

  if (res && !res.headersSent) {
    res.status(502).json({
      error: 'Gateway proxy error',
      code: error?.code,
    });
  }
};

export function applyProxiesCoreless(app: Express) {
  app.use(
    '^/graphql',
    createProxyMiddleware({
      pathRewrite: { '^/graphql': '/' },
      target: `http://127.0.0.1:${apolloRouterPort}`,
      on: {
        proxyReq,
        proxyRes,
        error: proxyError,
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
      proxyTimeout: PROXY_IDLE_TIMEOUT_MS,
      on: {
        proxyReq,
        proxyRes,
        error: proxyError,
      },
    }),
  );
}

/** Core serves the Data Extensions API, so the route follows core's address. */
const coreAddress = (targets: ErxesProxyTarget[]) => {
  const core = targets.find((target) => target.name === 'core');

  if (!core) {
    throw new Error('core service not found');
  }

  return NODE_ENV === 'production' ? core.address : 'http://localhost:3300';
};

/**
 * Identity headers on this route come only from what the gateway verified.
 * Anything a client sent under those names is dropped first, and the result
 * is signed so the runtime can tell it apart from the generic plugin proxy.
 */
const forwardVerifiedIdentity = (
  req: Request & { user?: Record<string, unknown> },
  _res: Response,
  next: NextFunction,
) => {
  delete req.headers[userHeaderName];
  delete req.headers.userid;
  delete req.headers[cpUserHeaderName];
  delete req.headers[clientPortalHeaderName];
  delete req.headers[erxesSubdomainHeaderName];

  for (const header of Object.values(DATA_EXTENSIONS_PROOF_HEADERS)) {
    delete req.headers[header];
  }

  if (req.user?._id) {
    setUserHeader(req.headers, req.user);
  }

  const userHeader = req.headers[userHeaderName];

  if (req.user?._id && typeof userHeader === 'string') {
    // The tenant the user was authenticated against in userMiddleware.
    const subdomain = getSubdomain(req);
    const proof = signDataExtensionsProof(
      'gateway',
      gatewayProofPayload(subdomain, userHeader),
    );

    req.headers[DATA_EXTENSIONS_PROOF_HEADERS.subdomain] = subdomain;
    req.headers[DATA_EXTENSIONS_PROOF_HEADERS.issuedAt] = String(
      proof.issuedAt,
    );
    req.headers[DATA_EXTENSIONS_PROOF_HEADERS.signature] = proof.signature;
  }

  next();
};

/**
 * Tenant-generated Data Extensions schemas, served by core outside the
 * router. Only the GraphQL route is public: other `/data-extensions/*` paths
 * (core's internal metrics) are refused instead of reaching core.
 */
export function applyDataExtensionsProxy(
  app: Express,
  targets: ErxesProxyTarget[],
) {
  app.use(
    '/data-extensions/graphql',
    forwardVerifiedIdentity,
    createProxyMiddleware({
      target: coreAddress(targets),
      pathRewrite: () => '/data-extensions/graphql',
      agent: proxyAgent,
      proxyTimeout: PROXY_IDLE_TIMEOUT_MS,
      on: {
        proxyReq,
        proxyRes,
        error: proxyError,
      },
    }),
  );

  app.use('/data-extensions', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });
}
