import { db } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import express, { type Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Logger, SerializedRequest } from 'pino';
import { pinoHttp } from 'pino-http';
import { logger } from '~/logger';
import { authenticate } from '~/http/auth';
import { createRateLimits } from '~/http/rateLimit';
import { requestContext } from '~/http/requestContext';
import { auditExportRouter } from '~/modules/audit/audit.http';
import { downloadRouter, signedFilesRouter } from '~/modules/files/files.http';
import { streamRouter } from '~/modules/live/stream.http';
import { answerError, fail } from '~/http/errors';
import { randomUUID } from '~/lib/crypto';
import { isDraining } from '~/lib/lifecycle';
import { publicJwks } from '~/lib/signing';
import { oauthRouter, openidConfiguration } from '~/modules/oauth/oauth.http';
import { customerCors } from '~/modules/customerAuth/customerApps';
import { paymentCallbackRouter } from '~/modules/payments/payments.http';
import { coreApi, openApiDocument } from '~/rpc';
import { saasLogin, saasRouter } from '~/modules/saas/saas.http';
import { standingGuard } from '~/modules/saas/saas.service';

const REQUEST_ID = /^[\w.:-]{8,100}$/;

/** Where customers ask for and type sign-in codes. */
const CUSTOMER_CODE_PATHS = [
  '/core/v1/customer-auth/code',
  '/core/v1/customer-auth/sign-in',
  '/core/v1/customer/me/logins',
  '/core/v1/customer/me/logins/confirm',
];

/** The caller's `X-Request-Id` when it is a plain token, else a new one. Echoed on the response. */
const requestId = (req: IncomingMessage, res: ServerResponse) => {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && REQUEST_ID.test(incoming) ? incoming : randomUUID();

  res.setHeader('x-request-id', id);

  return id;
};

/** A signed file link is the permission itself, so its token stays out of the logs. */
const SIGNED_LINK = /^(\/core\/v1\/files\/signed\/)[^/?]+/;

/**
 * One line per request when it ends, plus `req.log` for the route: a child
 * logger with `requestId`, and `orgId` and `actorId` once `authenticate`
 * resolved the caller. Load balancer probes are not logged.
 */
const requestLogger = (log: Logger) =>
  pinoHttp({
    logger: log,
    genReqId: requestId,
    quietReqLogger: true,
    quietResLogger: true,
    customAttributeKeys: { reqId: 'requestId' },
    autoLogging: { ignore: (req) => req.url === '/health' || req.url === '/ready' },
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error';

      return res.statusCode >= 400 ? 'warn' : 'info';
    },
    serializers: {
      // oRPC's logging plugin binds a `req` too, with `url` as a URL. The path
      // only: query strings can hold search terms and other personal data.
      req: ({
        method,
        url,
        headers,
        remoteAddress,
      }: Omit<SerializedRequest, 'url'> & { url: string | URL }) => ({
        method,
        url: (String(url).split('?')[0] ?? '').replace(SIGNED_LINK, '$1[Redacted]'),
        headers,
        remoteAddress,
      }),
    },
    customSuccessObject: (req, _res, line: Record<string, unknown>) => ({ ...line, req }),
    customErrorObject: (req, _res, _error, line: Record<string, unknown>) => ({ ...line, req }),
  });

export const createApp = (log: Logger = logger): Express => {
  const app = express();
  const limit = createRateLimits();

  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use(requestLogger(log));
  app.use(requestContext);

  // Signed file links stream bytes: before the JSON parser and sign-in.
  app.use('/core/v1/files/signed', limit.upload, signedFilesRouter);

  // Plugins' customer apps call these from their own origins (decision 42).
  app.use(['/core/v1/customer-auth', '/core/v1/customer'], customerCors);

  // Guessing passwords and secrets: limited per address before anything else.
  app.use(
    [
      '/core/v1/auth/sign-in',
      '/core/v1/auth/sign-in/2fa',
      '/core/v1/setup',
      '/core/v1/auth/password-reset',
      '/core/v1/auth/invitation',
    ],
    limit.signIn,
  );
  app.use(['/core/v1/plugins/token', '/core/v1/customer-auth/refresh'], limit.token);
  app.use(CUSTOMER_CODE_PATHS, limit.customerCode);

  // The SaaS control plane's own door: signed over the raw body, so before JSON parsing and member authentication.
  // erxes.io's door and sign-in hand-off (its own token; also at the path old erxes used).
  app.use('/core/v1/saas', limit.token, saasRouter);
  app.get('/gateway/pl\\:core/core-login', limit.token, saasLogin);

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Ready for traffic: the database answers and the server isn't shutting down.
  app.get('/ready', async (req, res) => {
    if (isDraining()) {
      res.status(503).json({ status: 'draining' });

      return;
    }

    const answered = await db()
      .execute(sql`SELECT 1`)
      .then(
        () => true,
        (error: unknown) => {
          req.log.warn({ err: error }, 'not ready: the database does not answer');

          return false;
        },
      );

    res.status(answered ? 200 : 503).json({ status: answered ? 'ok' : 'unavailable' });
  });

  app.get('/core/v1/openapi.json', openApiDocument);

  // Core's public signing keys: plugins verify plugin tokens and auditors
  // verify audit checkpoints with them.
  app.get('/core/v1/.well-known/jwks.json', (_req, res) => {
    res.set('Cache-Control', 'public, max-age=300').json(publicJwks());
  });

  // Payment gateways call back here: signed addresses, confirmed with the gateway.
  app.use('/core/v1', paymentCallbackRouter);

  // "Sign in with erxes" (OAuth 2.1 / OpenID Connect): its own authentication.
  app.use('/core/v1/oauth', limit.token, oauthRouter);
  app.get('/core/v1/.well-known/openid-configuration', openidConfiguration);

  // Every /core/v1 route needs a signed-in member or a plugin key.
  app.use(
    '/core/v1',
    authenticate,
    standingGuard,
    streamRouter,
    downloadRouter,
    auditExportRouter,
    coreApi,
  );

  app.use(() => {
    throw fail('NOT_FOUND', 'No such route');
  });
  app.use(answerError);

  return app;
};
