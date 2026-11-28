import { bearerOf, verifyCoreJob, verifyPluginCall, verifyPluginSession } from '@erxes/plugin-sdk';
import { pluginOpenApi, pluginRestHandler } from '@erxes/plugin-sdk/openapi';

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
const rest = pluginRestHandler(router, { interceptors: [onError(logFailure)] });

/**
 * Settings › Developer › API reference shows it (the manifest's `api.docs`). Routes for
 * customers or a portal get their own document with that `audience`.
 */
const memberDoc = pluginOpenApi(router, {
  plugin: PLUGIN,
  audience: 'member',
  title: manifest.title,
  version: manifest.version,
  description: manifest.description,
  server: `${config.publicUrl}/api`,
  prefix: '/v1',
});

/**
 * Who is calling: the member behind a request from the plugin UI (a session token), or another
 * plugin reading for an organisation (a plugin call token, `userId` `plugin:<name>`, with the
 * permissions the owner approved for it). Null without a valid token of either kind.
 */
const memberOf = async (authorization: string | undefined) => {
  const token = bearerOf(authorization);

  if (!token) return null;

  const options = { coreUrl: config.coreUrl, plugin: PLUGIN };

  return verifyPluginSession(token, options)
    .catch(() => verifyPluginCall(token, options))
    .catch(() => null);
};

/** The API; requests log to `log` (tests pass their own). */
export const createApp = (log = logger) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(pinoHttp({ logger: log }));
  // The plugin UI calls this API from web, at whatever address the organisation
  // uses (acme.app.erxes.io, its own domain). Any origin may: access is the
  // Bearer session token core issues, never a cookie, so CORS guards nothing here.
  // Routes for portals (an API key, customer tokens) set their own CORS.
  app.use(
    ['/api/rpc', '/api/v1', '/api/openapi', '/ui'],
    cors({ origin: true, credentials: false, maxAge: 600 }),
  );

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/openapi/member.json', async (_req, res) => {
    res.json(await memberDoc);
  });

  // A 5-minute session token core issued for this member and plugin: erxes-ui's pluginFetch
  // adds it, and a script gets one from core with an API key. Another plugin's
  // `core.fetchPlugin` sends a plugin call token, which `reads(...)` checks the same way.
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
