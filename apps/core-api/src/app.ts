import { db } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { authenticate } from '~/http/auth';
import { requestContext } from '~/http/requestContext';
import { auditExportRouter } from '~/modules/audit/audit.http';
import { downloadRouter, signedFilesRouter } from '~/modules/files/files.http';
import { streamRouter } from '~/modules/live/stream.http';
import { HttpError } from '~/http/errors';
import { coreApi, openApiDocument } from '~/rpc';

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
  app.use('/core/v1/files/signed', signedFilesRouter);

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/ready', (_req, res) => {
    db()
      .execute(sql`SELECT 1`)
      .then(() => res.json({ status: 'ok' }))
      .catch(() => res.status(503).json({ status: 'unavailable' }));
  });

  app.get('/core/v1/openapi.json', openApiDocument);

  // Every /core/v1 route needs a signed-in member or a plugin key.
  app.use('/core/v1', authenticate, streamRouter, downloadRouter, auditExportRouter, coreApi);

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

    console.error('[core] unhandled error', error);
    res.status(500).json(errorBody(500, 'INTERNAL', 'Something went wrong'));
  });

  return app;
};
