import { db } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { authenticate } from '~/http/auth';
import { signInLimit, tokenLimit, uploadLimit } from '~/http/rateLimit';
import { requestContext } from '~/http/requestContext';
import { auditExportRouter } from '~/modules/audit/audit.http';
import { downloadRouter, signedFilesRouter } from '~/modules/files/files.http';
import { streamRouter } from '~/modules/live/stream.http';
import { HttpError } from '~/http/errors';
import { isDraining } from '~/lib/lifecycle';
import { publicJwks } from '~/lib/signing';
import { oauthRouter, openidConfiguration } from '~/modules/oauth/oauth.http';
import { paymentCallbackRouter } from '~/modules/payments/payments.service';
import { coreApi, openApiDocument } from '~/rpc';
import { log } from '~/lib/log';
import { saasRouter } from '~/modules/saas/saas.http';
import { standingGuard } from '~/modules/saas/saas.service';

/** Errors outside oRPC (auth, unknown routes) in the same shape as oRPC's. */
const errorBody = (status: number, code: string, message: string, data?: unknown) => ({
  defined: false,
  code,
  status,
  message,
  ...(data === undefined ? {} : { data }),
});

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use(requestContext);

  // Signed file links stream bytes: before the JSON parser and sign-in.
  app.use('/core/v1/files/signed', uploadLimit, signedFilesRouter);

  // Guessing passwords and secrets: limited per address before anything else.
  app.use(
    ['/core/v1/auth/sign-in', '/core/v1/auth/sign-in/2fa', '/core/v1/setup', '/core/v1/auth/password-reset', '/core/v1/auth/invitation'],
    signInLimit,
  );
  app.use('/core/v1/plugins/token', tokenLimit);

  // The SaaS control plane's own door: signed over the raw body, so before JSON parsing and member authentication.
  app.use('/core/v1/saas', tokenLimit, saasRouter);

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Ready for traffic: the database answers and the server isn't shutting down.
  app.get('/ready', (_req, res) => {
    if (isDraining()) {
      res.status(503).json({ status: 'draining' });
      return;
    }

    db()
      .execute(sql`SELECT 1`)
      .then(() => res.json({ status: 'ok' }))
      .catch(() => res.status(503).json({ status: 'unavailable' }));
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
  app.use('/core/v1/oauth', tokenLimit, oauthRouter);
  app.get('/core/v1/.well-known/openid-configuration', openidConfiguration);

  // Every /core/v1 route needs a signed-in member or a plugin key.
  app.use('/core/v1', authenticate, standingGuard, streamRouter, downloadRouter, auditExportRouter, coreApi);

  app.use((_req, res) => {
    res.status(404).json(errorBody(404, 'NOT_FOUND', 'No such route'));
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.status).json(errorBody(error.status, error.code, error.message, error.data));
      return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json(errorBody(400, 'INVALID_JSON', 'The request body is not valid JSON'));
      return;
    }

    log.error('unhandled error', { error });
    res.status(500).json(errorBody(500, 'INTERNAL', 'Something went wrong'));
  });

  return app;
};
