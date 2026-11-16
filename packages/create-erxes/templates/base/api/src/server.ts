import { bearerOf, verifyCoreJob, verifyPluginSession } from '@erxes/plugin-sdk';
import { pluginOpenApi } from '@erxes/plugin-sdk/openapi';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { onError, ORPCError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/node';
import cors from 'cors';
import express from 'express';
import { pinoHttp } from 'pino-http';
import { config, PLUGIN } from '#/config.ts';
import { manifest } from '#/core.ts';
import { runJob } from '#/jobs.ts';
import { logger } from '#/logger.ts';
import { router } from '#/router.ts';

const logFailure = (error: unknown) => {
  if (!(error instanceof ORPCError) || error.status >= 500) logger.error(error);
};

// The same procedures twice: RPC for the plugin UI, REST (documented below) for scripts.
const rpc = new RPCHandler(router, { interceptors: [onError(logFailure)] });
const rest = new OpenAPIHandler(router, { interceptors: [onError(logFailure)] });

/** Settings › Developer › API reference shows it (the manifest's `api.openapi`). */
const openApi = pluginOpenApi(router, {
  plugin: PLUGIN,
  title: manifest.title,
  version: manifest.version,
  description: manifest.description,
  prefix: '/v1',
});

/** The member behind a request from the plugin UI, or null without a valid session token. */
const memberOf = async (authorization: string | undefined) => {
  const token = bearerOf(authorization);

  if (!token) return null;

  return verifyPluginSession(token, { coreUrl: config.coreUrl, plugin: PLUGIN }).catch(() => null);
};

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(pinoHttp({ logger }));
  // The plugin UI calls this API from web, at whatever address the organisation
  // uses (acme.app.erxes.io, its own domain). Any origin may: access is the
  // Bearer session token core issues, never a cookie, so CORS guards nothing here.
  // Routes for websites (an API key, customer tokens) set their own CORS.
  app.use(
    ['/api/rpc', '/api/v1', '/api/openapi.json', '/ui'],
    cors({ origin: true, credentials: false, maxAge: 600 }),
  );

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/openapi.json', async (_req, res) => {
    res.json(await openApi);
  });

  // A 5-minute session token core issued for this member and plugin: erxes-ui's pluginFetch
  // adds it, and a script gets one from core with an API key.
  for (const [prefix, handler] of [
    ['/api/rpc', rpc],
    ['/api/v1', rest],
  ] as const) {
    app.use(prefix, async (req, res, next) => {
      const member = await memberOf(req.headers.authorization);

      if (!member) {
        res.status(401).json({ message: 'Send a session token for this plugin from core' });

        return;
      }

      const { matched } = await handler.handle(req, res, { prefix, context: { member } });

      if (!matched) next();
    });
  }

  // Core's jobs (`api/src/jobs.ts`). The token signs the raw body, so it stays text.
  app.post('/api/jobs/:name', express.text({ type: '*/*' }), async (req, res) => {
    const body = typeof req.body === 'string' ? req.body : '';

    const job = await verifyCoreJob(req.headers.authorization, body, {
      coreUrl: config.coreUrl,
      plugin: PLUGIN,
    }).catch(() => null);

    if (!job) {
      res.sendStatus(401);

      return;
    }

    // A throw answers 500 and core retries it.
    await runJob(job);
    res.sendStatus(204);
  });

  if (config.uiDir) app.use('/ui', express.static(config.uiDir));

  return app;
};
