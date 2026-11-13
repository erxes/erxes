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
  DATA_EXTENSIONS_SERVICE,
  gatewayProofPayload,
  isDataExtensionsServiceEnabled,
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

/**
 * Who serves the Data Extensions API: the standalone app when it is enabled,
 * otherwise core. Read per request from the current targets, which the
 * gateway refreshes when services join or leave.
 */
export const dataExtensionsAddress = (targets: ErxesProxyTarget[]) => {
  if (isDataExtensionsServiceEnabled()) {
    const app = targets.find(
      (target) => target.name === DATA_EXTENSIONS_SERVICE,
    );

    if (!app) {
      throw new Error(`${DATA_EXTENSIONS_SERVICE} service not found`);
    }

    return app.address;
  }

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
 * The gateway answers CORS for this route (its own middleware ran before the
 * proxy). The serving service's headers are dropped so they cannot replace
 * them: a plugin's default `*` origin is refused by browsers on credentialed
 * requests.
 */
const keepGatewayCors = (upstream, req: any, res: ServerResponse) => {
  for (const header of Object.keys(upstream.headers)) {
    if (header.toLowerCase().startsWith('access-control-')) {
      delete upstream.headers[header];
    }
  }

  proxyRes(upstream, req, res);
};

/**
 * Tenant-generated Data Extensions schemas, served outside the router by
 * the standalone app or by core. Only the GraphQL route is public: other
 * `/data-extensions/*` paths (internal metrics) are refused.
 */
export function applyDataExtensionsProxy(
  app: Express,
  targets: ErxesProxyTarget[],
) {
  app.use(
    '/data-extensions/graphql',
    forwardVerifiedIdentity,
    createProxyMiddleware({
      target: dataExtensionsAddress(targets),
      router: () => dataExtensionsAddress(global.currentTargets || targets),
      pathRewrite: () => '/data-extensions/graphql',
      agent: proxyAgent,
      proxyTimeout: PROXY_IDLE_TIMEOUT_MS,
      on: {
        proxyReq,
        proxyRes: keepGatewayCors,
        error: proxyError,
      },
    }),
  );

  app.use('/data-extensions', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });
}

/**
 * The standalone Data Extensions app is reached only through the supergraph
 * and `/data-extensions/graphql`. Its other routes (internal metrics, the
 * runtime without the gateway's proof) are refused on the generic plugin
 * proxy instead of reaching it.
 */
export function refuseDataExtensionsPluginProxy(app: Express) {
  app.use(
    // A lookahead: Express only applies a `use` match that ends at a `/`.
    new RegExp(`^/pl:${DATA_EXTENSIONS_SERVICE}(?=/|$)`, 'i'),
    (_req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    },
  );
}
